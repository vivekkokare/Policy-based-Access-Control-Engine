# Conflict Resolver
# Handles conflicts when multiple policies match a request with different effects

class ODRLConflictResolver:
    """Resolves conflicts when multiple policies match a request
    
    When a user-action-target combination matches multiple policies with different
    effects (permit vs deny), a conflict resolution strategy must be applied.
    """

    def __init__(self, strategy="deny_overrides"):
        """Initialize with conflict resolution strategy
        
        Args:
            strategy: One of:
                - "deny_overrides" (default): Any deny wins (fail-closed, secure)
                - "permit_overrides": Any permit wins (permissive)
                - "first_applicable": First matching policy wins
        """
        self.strategy = strategy

    def resolve(self, decisions):
        """Resolve conflicts among multiple matching policies
        
        Args:
            decisions: List of decision dicts, each with:
                {"effect": "permit"|"deny", "policy": {...}, "duties": [...]}
        
        Returns:
            The resolved decision (one of the input decisions or default deny)
        """
        # No policies match = default deny (fail-closed)
        if not decisions:
            return {"effect": "deny", "reason": "No applicable policies"}

        # Strategy 1: deny-overrides (DEFAULT - most secure)
        # Security principle: if any policy denies, the request is denied
        if self.strategy == "deny_overrides":
            for d in decisions:
                if d["effect"] == "deny":
                    return d
            return decisions[-1]  # No denies found, use last permit

        # Strategy 2: permit-overrides (permissive)
        # Any permit allows the request, only denied if all policies deny
        if self.strategy == "permit_overrides":
            for d in decisions:
                if d["effect"] == "permit":
                    return d
            return decisions[-1]  # No permits found, use last decision

        # Strategy 3: first-applicable
        # Use the first matching policy regardless of effect
        return decisions[0]