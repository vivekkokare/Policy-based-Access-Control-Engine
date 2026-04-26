import time
import json


class DecisionCache:
    def __init__(self, ttl_seconds=300):
        self.ttl_seconds = ttl_seconds
        self.store = {}

    def _make_key(self, user_id, action, target, context):
        normalized_context = json.dumps(context or {}, sort_keys=True)
        return f"{user_id}:{action}:{target}:{normalized_context}"

    def get(self, user_id, action, target, context):
        key = self._make_key(user_id, action, target, context)
        entry = self.store.get(key)

        if not entry:
            return None

        if time.time() > entry["expires_at"]:
            del self.store[key]
            return None

        return entry["value"]

    def set(self, user_id, action, target, context, value):
        key = self._make_key(user_id, action, target, context)
        self.store[key] = {
            "value": value,
            "expires_at": time.time() + self.ttl_seconds
        }

    def clear(self):
        self.store.clear()