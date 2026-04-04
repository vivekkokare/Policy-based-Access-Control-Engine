class PolicyEnforcer:
    def __init__(self, pip, pdp):
        self.pip = pip
        self.pdp = pdp

    def enforce(self, user_id, action, target, context=None):
        user = self.pip.user_resolver(user_id)
        if not user:
            return {"decision": "DENY", "reason": "Unknown user"}

        ctx = self.pip.get_state_of_the_world(context)

        result = self.pdp.get_decision(user, action, target, ctx)

        if result["effect"] == "permit":
            for duty in result["duties"]:
                self.execute_duties(duty, user_id)

            return {
                "decision": "PERMIT",
                "policy": result["policy"]["uid"],
                "duties": result["duties"],
                "context": ctx
            }

        else:
            # If prohibition has remedies
            if "remedy" in result["policy"]:
                for remedy in result["policy"]["remedy"]:
                    self.execute_duties(remedy, user_id)

            return {
                "decision": "DENY",
                "policy": result["policy"]["uid"],
                "reason": "Conflicting prohibition applied"
            }
    
    def execute_duties(self, duties, user_id):
        """Handles post-decision obligations like logging or masking."""
        # duties may be a list OR a single duty object
        if isinstance(duties, dict):
            duties = [duties]

        for duty in duties:
            action = duty.get('action')

            if action == "log_access":
                print(f"[PEP-AUDIT] Logging: User {user_id} accessed the resource.")

            elif action == "watermark_export":
                print(f"[PEP-SECURITY] Applying watermark for user {user_id}.")

            elif action == "anonymise":
                print(f"[PEP-PRIVACY] Data anonymisation applied.")

            else:
                print(f"[PEP] Unknown duty ignored: {action}")