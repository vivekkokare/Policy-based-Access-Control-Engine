class PolicyEnforcer:
    def __init__(self, pip, pdp, cache=None):
        self.pip = pip
        self.pdp = pdp
        self.cache = cache

    def enforce(self, user_id, action, target, context=None):
        print("\n=== NEW REQUEST ===")
        print(f"user_id={user_id}, action={action}, target={target}")
        print(f"context={context}")

        user = self.pip.user_resolver(user_id)
        if not user:
            return {"decision": "DENY", "reason": "Unknown user"}

        ctx = self.pip.get_state_of_the_world(context)
        print(f"resolved user={user}")
        print(f"resolved context={ctx}")

        # 1. Check cache first
        if self.cache:
            cached_result = self.cache.get(user_id, action, target, ctx)
            if cached_result:
                print("Cache hit: returning cached decision")
                response = dict(cached_result)
                response["cache_hit"] = True
                return response

        # 2. Evaluate normally
        print("Cache miss: evaluating policies")
        result = self.pdp.get_decision(user, action, target, ctx)
        print(f"decision result={result}")

        if result["effect"] == "permit":
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
            if "remedy" in result["policy"]:
                for remedy in result["policy"]["remedy"]:
                    self.execute_duties(remedy, user_id)

            response = {
                "decision": "DENY",
                "policy": result["policy"]["uid"],
                "reason": "Conflicting prohibition applied",
                "cache_hit": False
            }

        # 3. Store result in cache
        if self.cache:
            self.cache.set(user_id, action, target, ctx, response)
            print("Stored decision in cache")

        return response

    def execute_duties(self, duties, user_id):
        """Handles post-decision obligations like logging or masking."""
        if isinstance(duties, dict):
            duties = [duties]

        for duty in duties:
            action = duty.get("action")

            if action == "log_access":
                print(f"[PEP-AUDIT] Logging: User {user_id} accessed the resource.")

            elif action == "watermark_export":
                print(f"[PEP-SECURITY] Applying watermark for user {user_id}.")

            elif action == "anonymise":
                print(f"[PEP-PRIVACY] Data anonymisation applied.")

            else:
                print(f"[PEP] Unknown duty ignored: {action}")