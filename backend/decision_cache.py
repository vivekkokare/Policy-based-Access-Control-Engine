# Decision Cache
# Caches access control decisions with TTL to improve performance

import time
import json


class DecisionCache:
    """In-memory cache for access control decisions
    
    Caches decisions based on (user_id, action, target, context) tuples.
    Each cached entry has a Time-To-Live (TTL) after which it expires.
    """
    
    def __init__(self, ttl_seconds=300):
        """Initialize cache with TTL configuration
        
        Args:
            ttl_seconds: Time-To-Live for cached entries in seconds (default: 5 min)
        """
        self.ttl_seconds = ttl_seconds
        self.store = {}  # In-memory dictionary storage

    def _make_key(self, user_id, action, target, context):
        """Generate a cache key from request parameters
        
        Normalizes context to JSON to ensure consistent keys for identical requests.
        
        Args:
            user_id: User identifier
            action: Requested action
            target: Target resource
            context: Contextual information
        
        Returns:
            String cache key
        """
        # Normalize context to ensure consistent key generation
        normalized_context = json.dumps(context or {}, sort_keys=True)
        return f"{user_id}:{action}:{target}:{normalized_context}"

    def get(self, user_id, action, target, context):
        """Retrieve a cached decision if it exists and hasn't expired
        
        Args:
            user_id: User identifier
            action: Requested action
            target: Target resource
            context: Contextual information
        
        Returns:
            Cached decision value if found and valid, None otherwise
        """
        key = self._make_key(user_id, action, target, context)
        entry = self.store.get(key)

        # Cache miss
        if not entry:
            return None

        # Check if cache entry has expired
        if time.time() > entry["expires_at"]:
            # Remove expired entry
            del self.store[key]
            return None

        # Cache hit: return the cached value
        return entry["value"]

    def set(self, user_id, action, target, context, value):
        """Store a decision in the cache
        
        Args:
            user_id: User identifier
            action: Requested action
            target: Target resource
            context: Contextual information
            value: Decision result to cache
        """
        key = self._make_key(user_id, action, target, context)
        self.store[key] = {
            "value": value,
            "expires_at": time.time() + self.ttl_seconds  # Set expiration time
        }

    def clear(self):
        """Clear all cached entries"""
        self.store.clear()