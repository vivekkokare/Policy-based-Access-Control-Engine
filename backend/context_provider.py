# Context Provider (PIP - Policy Information Point)
# Responsible for resolving user attributes and building the evaluation context

class ContextProvider:
    """Provides user information and contextual data for policy evaluation"""
    
    def __init__(self, user_database):
        """Initialize with user database
        
        Args:
            user_database: List of user dictionaries from users.json
        """
        self.user_db = user_database

    def user_resolver(self, user_id):
        """Look up a user in the database by user_id
        
        Args:
            user_id: The identifier of the user to resolve
        
        Returns:
            User dictionary if found, None otherwise
        """
        for user in self.user_db:
            if user['user_id'] == user_id:
                return user
        return None

    def get_state_of_the_world(self, request_context):
        """Get the evaluation context (state of the world)
        
        Args:
            request_context: Optional contextual data from the request
        
        Returns:
            The request context or an empty dict if not provided
        """
        return request_context if request_context else {}