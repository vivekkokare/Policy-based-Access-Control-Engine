from conflict_resolver import ODRLConflictResolver
import operator

class LogicEvaluator:
    def __init__(self, engine_policies, odrl_policies):
        self.engine_policies = engine_policies
        self.odrl_policies = odrl_policies
        self.conflicts = ODRLConflictResolver(strategy="deny_overrides")

        self.operators = {
            "eq": operator.eq,
            "gte": operator.ge,
            "lte": operator.le,
            "gt": operator.gt,
            "lt": operator.lt
        }

    def evaluate_constraints(self, constraints, user, ctx):
        for c in constraints:
            L = c["leftOperand"]
            op = self.operators[c["operator"]]
            R = c["rightOperand"]

            actual = user.get(L) or ctx.get(L)
            if actual is None:
                return False

            if not op(actual, R):
                return False
        return True

    def evaluate_single_policy(self, p, user, action, target, ctx):
        if p["role"] != user["role"]:
            return None
        if p["action"] != action:
            return None
        if p["target"] != target:
            return None

        if not self.evaluate_constraints(p.get("constraints", []), user, ctx):
            return None

        # Return standardized decision object
        return {
            "effect": p["effect"],
            "policy": p,
            "duties": p.get("duties", [])
        }

    def get_decision(self, user, action, target, ctx):
        matches = []

        for p in self.engine_policies:
            result = self.evaluate_single_policy(p, user, action, target, ctx)
            if result:
                matches.append(result)

        return self.conflicts.resolve(matches)