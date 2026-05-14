# Policy Enforcer (PEP - Policy Enforcement Point)
# Enforces policies at the request-time and executes associated duties/remedies

class PolicyEnforcer:
    """Enforces access control policies and executes post-decision obligations"""
    
    def __init__(self, pip, pdp, cache=None):
        """Initialize the PEP with its components
        
        Args:
            pip: Context provider (PIP) for user/context resolution
            pdp: Logic evaluator (PDP) for making decisions
            cache: Optional decision cache for performance
        """
        self.pip = pip   # Policy Information Point
        self.pdp = pdp   # Policy Decision Point
        self.cache = cache  # Decision cache

    def enforce(self, user_id, action, target, context=None):
        """Main enforcement method: evaluate request and make access decision
        
        Workflow:
        1. Resolve user and context from request
        2. Check if decision is cached (with TTL validation)
        3. If not cached, evaluate policies via PDP
        4. Execute post-decision obligations (duties/remedies)
        5. Cache the decision for future requests
        
        Args:
            user_id: Identifier of the requesting user
            action: Action being requested
            target: Resource being accessed
            context: Optional contextual information
        
        Returns:
            Dict with decision (PERMIT/DENY), policy info, duties, and cache status
        """
        print("\n=== NEW REQUEST ===")
        print(f"user_id={user_id}, action={action}, target={target}")
        print(f"context={context}")

        # ===== STEP 1: Resolve user and context =====
        user = self.pip.user_resolver(user_id)
        if not user:
            return {"decision": "DENY", "reason": "Unknown user"}

        ctx = self.pip.get_state_of_the_world(context)
        print(f"resolved user={user}")
        print(f"resolved context={ctx}")

        # ===== STEP 2: Check cache first (performance optimization) =====
        if self.cache:
            cached_result = self.cache.get(user_id, action, target, ctx)
            if cached_result:
                print("Cache hit: returning cached decision")
                response = dict(cached_result)
                response["cache_hit"] = True
                return response

        # ===== STEP 3: Evaluate policies (cache miss) =====
        print("Cache miss: evaluating policies")
        result = self.pdp.get_decision(user, action, target, ctx)
        print(f"decision result={result}")

        # ===== STEP 4: Build response and execute duties/remedies =====
        if result["effect"] == "permit":
            # Execute post-permit obligations (duties)
            for duty in result["duties"]:
                self.execute_duties(duty, user_id)

            response = {
                "decision": "PERMIT",
                "policy": result["policy"]["uid"],
                "duties": result["duties"],
                "context": ctx,
                "cache_hit": False
            }

        else:
            # Execute post-deny obligations (remedies)
            if "remedy" in result["policy"]:
                for remedy in result["policy"]["remedy"]:
                    self.execute_duties(remedy, user_id)

            response = {
                "decision": "DENY",
                "policy": result["policy"]["uid"],
                "reason": "Conflicting prohibition applied",
                "cache_hit": False
            }

        # ===== STEP 5: Cache the decision =====
        if self.cache:
            self.cache.set(user_id, action, target, ctx, response)
            print("Stored decision in cache")

        return response

    def execute_duties(self, duties, user_id):
        """Execute post-decision obligations (duties or remedies)
        
        Duties are actions that must be performed when a policy applies.
        Examples: logging access, watermarking exports, anonymizing data.
        
        Args:
            duties: Single duty dict or list of duty dicts to execute
            user_id: User for context in duty execution
        """
        # Normalize duties to list format
        if isinstance(duties, dict):
            duties = [duties]

        # Execute each duty based on its action type
        for duty in duties:
            action = duty.get("action")

            if action == "log_access":
                # Audit duty: log all access attempts
                print(f"[PEP-AUDIT] Logging: User {user_id} accessed the resource.")

            elif action == "watermark_export":
                # Security duty: mark exported data with source information
                print(f"[PEP-SECURITY] Applying watermark for user {user_id}.")

            elif action == "anonymise":
                # Privacy duty: remove identifying information
                print(f"[PEP-PRIVACY] Data anonymisation applied.")

            else:
                # Unknown action type
                print(f"[PEP] Unknown duty ignored: {action}")