# Logic Evaluator (PDP - Policy Decision Point)
# Evaluates policies against user requests and makes access control decisions

from conflict_resolver import ODRLConflictResolver
import operator


class LogicEvaluator:
    """Evaluates policies and determines access control decisions"""
    
    def __init__(self, engine_policies, odrl_policies):
        """Initialize the PDP with policies and conflict resolution strategy
        
        Args:
            engine_policies: Optimized policy format for evaluation
            odrl_policies: Full ODRL policy representations
        """
        self.engine_policies = engine_policies
        self.odrl_policies = odrl_policies
        # Use deny-overrides strategy: if any policy denies, access is denied
        self.conflicts = ODRLConflictResolver(strategy="deny_overrides")

        # Mapping of constraint operators to Python comparison functions
        self.operators = {
            "eq": operator.eq,      # Equal
            "neq": operator.ne,     # Not equal
            "gte": operator.ge,     # Greater than or equal
            "lte": operator.le,     # Less than or equal
            "gt": operator.gt,      # Greater than
            "lt": operator.lt       # Less than
        }

    def evaluate_constraints(self, constraints, user, ctx):
        """Evaluate all constraints in a policy
        
        Constraints define conditions that must be met (e.g., department == "HR").
        All constraints must be true for the policy to match.
        
        Args:
            constraints: List of constraint objects to evaluate
            user: User attributes dictionary
            ctx: Contextual information dictionary
        
        Returns:
            True if all constraints are satisfied, False otherwise
        """
        for c in constraints:
            L = c["leftOperand"]      # Attribute to check
            operator_name = c["operator"]  # Comparison operator
            R = c["rightOperand"]     # Expected value

            print(f"Evaluating constraint: {c}")

            # Validate operator exists
            if operator_name not in self.operators:
                print(f"Unknown operator: {operator_name}")
                return False

            op = self.operators[operator_name]

            # Resolve the actual value from user or context
            # Note: Use 'in' operator rather than .get() to preserve falsy values
            # (False, 0, empty string are valid constraint values)
            if L in user:
                actual = user[L]
            elif L in ctx:
                actual = ctx[L]
            else:
                print(f"Constraint failed: '{L}' not found in user or context")
                return False

            print(f"Actual value for {L} = {actual}, expected = {R}")

            # Perform the comparison
            try:
                if not op(actual, R):
                    print("Constraint failed")
                    return False
            except Exception as e:
                print(f"Constraint evaluation error for {L}: {e}")
                return False

        # All constraints satisfied
        return True

    def evaluate_single_policy(self, p, user, action, target, ctx):
        """Check if a single policy matches the request
        
        Args:
            p: Policy object to evaluate
            user: User attributes
            action: Requested action
            target: Target resource
            ctx: Request context
        
        Returns:
            Match result dict with effect/policy/duties if matched, None otherwise
        """
        print(f"\nChecking policy: {p['uid']}")

        # All of these conditions must match for the policy to apply
        if p["role"] != user["role"]:
            print("Role mismatch")
            return None

        if p["action"] != action:
            print("Action mismatch")
            return None

        if p["target"] != target:
            print("Target mismatch")
            return None

        # Evaluate dynamic constraints if present
        if not self.evaluate_constraints(p.get("constraints", []), user, ctx):
            print("Constraint check failed")
            return None

        # Policy matches all criteria
        print(f"Policy matched: {p['uid']}")

        return {
            "effect": p["effect"],  # "permit" or "deny"
            "policy": p,
            "duties": p.get("duties", [])  # Post-decision obligations
        }

    def get_decision(self, user, action, target, ctx):
        """Make an access control decision
        
        Evaluates all applicable policies and resolves conflicts using the
        configured strategy (deny-overrides by default).
        
        Args:
            user: User attributes
            action: Requested action
            target: Target resource
            ctx: Request context
        
        Returns:
            Decision dict with effect (permit/deny), applicable policy, and duties
        """
        matches = []

        print("\n=== EVALUATING DECISION ===")
        print(f"user={user.get('user_id', 'unknown')} role={user.get('role')}")
        print(f"action={action}, target={target}")
        print(f"context={ctx}")

        # Find all policies that match this request
        for p in self.engine_policies:
            result = self.evaluate_single_policy(p, user, action, target, ctx)
            if result:
                matches.append(result)

        print(f"\nTotal matching policies: {len(matches)}")

        # No matching policies = default deny (fail-closed)
        if not matches:
            print("No matching policies found → default DENY")
            return {
                "effect": "deny",
                "policy": {
                    "uid": "default_deny",
                    "scenario": "No matching policy found"
                },
                "duties": []
            }

        # Resolve conflicts if multiple policies match
        final_decision = self.conflicts.resolve(matches)
        print(f"Final resolved decision: {final_decision}")
        return final_decision