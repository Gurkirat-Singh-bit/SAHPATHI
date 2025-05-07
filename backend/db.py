# Database connection module for SAHPAATHI
# This file will handle database connections and operations

# For now, this is a simple implementation with in-memory storage
# In a production environment, you'd use MongoDB or another database

class ChatDatabase:
    def __init__(self):
        self.chat_history = []
    
    def add_message(self, role, content):
        """
        Add a new message to the chat history
        
        Args:
            role (str): 'user' or 'assistant'
            content (str): The message content
        """
        self.chat_history.append({
            'role': role,
            'content': content
        })
        return True
    
    def get_chat_history(self):
        """Get all chat messages"""
        return self.chat_history
    
    def clear_history(self):
        """Clear the chat history"""
        self.chat_history = []
        return True

# Create a singleton instance
db = ChatDatabase()