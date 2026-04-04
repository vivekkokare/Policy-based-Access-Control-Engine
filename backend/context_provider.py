class ContextProvider:
    def __init__(self, user_database):
        self.user_db = user_database

    def user_resolver(self, user_id):
        for user in self.user_db:
            if user['user_id'] == user_id:
                return user
        return None

    def get_state_of_the_world(self, request_context):
        return request_context if request_context else {}