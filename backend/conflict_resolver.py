class ODRLConflictResolver:

    def __init__(self, strategy="deny_overrides"):
        self.strategy = strategy

    def resolve(self, decisions):
        """
        decisions = [
           {"effect": "permit", "policy": p1, "duties": [...]},
           {"effect": "deny", "policy": p2},
           ...
        ]
        """

        if not decisions:
            return {"effect": "deny", "reason": "No applicable policies"}

        # Strategy 1: deny-overrides (DEFAULT)
        if self.strategy == "deny_overrides":
            for d in decisions:
                if d["effect"] == "deny":
                    return d
            return decisions[-1]  # last permit

        # Strategy 2: permit-overrides
        if self.strategy == "permit_overrides":
            for d in decisions:
                if d["effect"] == "permit":
                    return d
            return decisions[-1]

        # Strategy 3: first-applicable
        return decisions[0]