from conflict_resolver import ODRLConflictResolver
import operator


class LogicEvaluator:
    def __init__(self, engine_policies, odrl_policies):
        self.engine_policies = engine_policies
        self.odrl_policies = odrl_policies
        self.conflicts = ODRLConflictResolver(strategy="deny_overrides")

        self.operators = {
            "eq": operator.eq,
            "neq": operator.ne,
            "gte": operator.ge,
            "lte": operator.le,
            "gt": operator.gt,
            "lt": operator.lt
        }

    def evaluate_constraints(self, constraints, user, ctx):
        for c in constraints:
            L = c["leftOperand"]
            operator_name = c["operator"]
            R = c["rightOperand"]

            print(f"Evaluating constraint: {c}")

            if operator_name not in self.operators:
                print(f"Unknown operator: {operator_name}")
                return False

            op = self.operators[operator_name]

            # FIX: do not use user.get(L) or ctx.get(L)
            # because False / 0 / empty string are valid values
            if L in user:
                actual = user[L]
            elif L in ctx:
                actual = ctx[L]
            else:
                print(f"Constraint failed: '{L}' not found in user or context")
                return False

            print(f"Actual value for {L} = {actual}, expected = {R}")

            try:
                if not op(actual, R):
                    print("Constraint failed")
                    return False
            except Exception as e:
                print(f"Constraint evaluation error for {L}: {e}")
                return False

        return True

    def evaluate_single_policy(self, p, user, action, target, ctx):
        print(f"\nChecking policy: {p['uid']}")

        if p["role"] != user["role"]:
            print("Role mismatch")
            return None

        if p["action"] != action:
            print("Action mismatch")
            return None

        if p["target"] != target:
            print("Target mismatch")
            return None

        if not self.evaluate_constraints(p.get("constraints", []), user, ctx):
            print("Constraint check failed")
            return None

        print(f"Policy matched: {p['uid']}")

        return {
            "effect": p["effect"],
            "policy": p,
            "duties": p.get("duties", [])
        }

    def get_decision(self, user, action, target, ctx):
        matches = []

        print("\n=== EVALUATING DECISION ===")
        print(f"user={user.get('user_id', 'unknown')} role={user.get('role')}")
        print(f"action={action}, target={target}")
        print(f"context={ctx}")

        for p in self.engine_policies:
            result = self.evaluate_single_policy(p, user, action, target, ctx)
            if result:
                matches.append(result)

        print(f"\nTotal matching policies: {len(matches)}")

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

        final_decision = self.conflicts.resolve(matches)
        print(f"Final resolved decision: {final_decision}")
        return final_decision