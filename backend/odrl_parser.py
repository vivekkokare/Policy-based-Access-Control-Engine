import json

class ODRLParser:
    def __init__(self, policies_path, users_path):
        self.policies_path = policies_path
        self.users_path = users_path

    def load_and_validate(self):
        with open(self.policies_path, 'r') as f:
            data = json.load(f)
        
        if data.get("@context") != "http://www.w3.org/ns/odrl.jsonld":
            print("Warning: ODRL Context mismatch!")

        return data.get('engine_policies', []), data.get('full_odrl_policies', [])

    def load_users(self):
        with open(self.users_path, 'r') as f:
            return json.load(f)