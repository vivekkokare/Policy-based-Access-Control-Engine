# ODRL Parser
# Parses and validates Open Digital Rights Language (ODRL) policies from JSON files

import json

class ODRLParser:
    """Parser for ODRL policy definitions and user database"""
    
    def __init__(self, policies_path, users_path):
        """Initialize parser with paths to policy and user files
        
        Args:
            policies_path: Path to policies.json file
            users_path: Path to users.json file
        """
        self.policies_path = policies_path
        self.users_path = users_path

    def load_and_validate(self):
        """Load and validate ODRL policies
        
        Returns:
            Tuple of (engine_policies, full_odrl_policies)
            - engine_policies: Optimized format for evaluation
            - full_odrl_policies: Complete ODRL representation
        """
        with open(self.policies_path, 'r') as f:
            data = json.load(f)
        
        # Validate ODRL context
        if data.get("@context") != "http://www.w3.org/ns/odrl.jsonld":
            print("Warning: ODRL Context mismatch!")

        return data.get('engine_policies', []), data.get('full_odrl_policies', [])

    def load_users(self):
        """Load user database from JSON file
        
        Returns:
            List of user dictionaries
        """
        with open(self.users_path, 'r') as f:
            return json.load(f)