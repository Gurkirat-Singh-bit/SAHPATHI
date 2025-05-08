# Database connection module for SAHPAATHI
# This file will handle database connections and operations
import pymongo
from datetime import datetime
import uuid

class ChatDatabase:
    def __init__(self):
        # Connect to MongoDB - we'll use a database named sahpaathi
        # Note: This assumes MongoDB is running on the default localhost:27017
        # In production, you would use environment variables for the connection string
        try:
            # Set a server timeout to avoid hanging on connection issues
            self.client = pymongo.MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=5000)
            # Test the connection
            self.client.server_info()
            self.db = self.client["sahpaathi"]
            self.chats = self.db["chats"]
            self.chat_sessions = self.db["chat_sessions"]  # New collection for chat sessions
            self.teachers = self.db["teachers"] # New collection for teachers
            print("MongoDB connection successful")
            self.use_mongodb = True
        except Exception as e:
            print(f"MongoDB connection error: {e}")
            # Fallback to in-memory if MongoDB connection fails
            self.client = None
            self.chat_history = []
            self.current_session_id = str(uuid.uuid4())
            self.sessions = {}
            self.use_mongodb = False
            self._initialize_default_teachers()

    def _initialize_default_teachers(self):
        """Initialize default teachers if they don't exist."""
        if self.use_mongodb:
            try:
                if self.teachers.count_documents({}) == 0:
                    default_teachers = [
                        {"teacher_id": str(uuid.uuid4()), "name": "General Assistant", "prompt": "You are a helpful general assistant.", "is_custom": False, "created_at": datetime.now(), "updated_at": datetime.now()},
                        {"teacher_id": str(uuid.uuid4()), "name": "Math Tutor", "prompt": "You are an expert math tutor. Explain concepts clearly and help solve problems step-by-step.", "is_custom": False, "created_at": datetime.now(), "updated_at": datetime.now()},
                        {"teacher_id": str(uuid.uuid4()), "name": "History Buff", "prompt": "You are a history enthusiast. Provide detailed historical context and answer questions about historical events and figures.", "is_custom": False, "created_at": datetime.now(), "updated_at": datetime.now()}
                    ]
                    self.teachers.insert_many(default_teachers)
                    print("Initialized default teachers.")
            except Exception as e:
                print(f"Error initializing default teachers: {e}")
        # In-memory default teachers can be handled if needed, but primary focus is MongoDB

    def create_teacher(self, name, prompt, is_custom=True):
        """Create a new teacher."""
        teacher_id = str(uuid.uuid4())
        teacher = {
            'teacher_id': teacher_id,
            'name': name,
            'prompt': prompt,
            'is_custom': is_custom,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        if self.use_mongodb:
            try:
                self.teachers.insert_one(teacher)
                print(f"Created new teacher: {name} ({teacher_id})")
                return teacher_id
            except Exception as e:
                print(f"Error creating teacher: {e}")
                return None
        else:
            # In-memory implementation (simplified)
            if not hasattr(self, 'in_memory_teachers'):
                self.in_memory_teachers = {}
            self.in_memory_teachers[teacher_id] = teacher
            print(f"Created new teacher (in-memory): {name} ({teacher_id})")
            return teacher_id

    def get_teacher(self, teacher_id):
        """Get a specific teacher by ID."""
        if self.use_mongodb:
            try:
                teacher = self.teachers.find_one({'teacher_id': teacher_id})
                if teacher:
                    teacher['_id'] = str(teacher['_id']) # Convert ObjectId
                    teacher['created_at'] = teacher['created_at'].isoformat()
                    teacher['updated_at'] = teacher['updated_at'].isoformat()
                return teacher
            except Exception as e:
                print(f"Error getting teacher {teacher_id}: {e}")
                return None
        else:
            return self.in_memory_teachers.get(teacher_id)

    def get_all_teachers(self):
        """Get all teachers."""
        if self.use_mongodb:
            try:
                cursor = self.teachers.find({}).sort('name', 1)
                teachers_list = []
                for teacher in cursor:
                    teacher['_id'] = str(teacher['_id'])
                    teacher['created_at'] = teacher['created_at'].isoformat()
                    teacher['updated_at'] = teacher['updated_at'].isoformat()
                    teachers_list.append(teacher)
                return teachers_list
            except Exception as e:
                print(f"Error getting all teachers: {e}")
                return []
        else:
            return list(self.in_memory_teachers.values()) if hasattr(self, 'in_memory_teachers') else []

    def update_teacher_prompt(self, teacher_id, prompt):
        """Update a teacher's prompt."""
        if self.use_mongodb:
            try:
                result = self.teachers.update_one(
                    {'teacher_id': teacher_id},
                    {'$set': {'prompt': prompt, 'updated_at': datetime.now()}}
                )
                return result.modified_count > 0
            except Exception as e:
                print(f"Error updating teacher {teacher_id}: {e}")
                return False
        else:
            if hasattr(self, 'in_memory_teachers') and teacher_id in self.in_memory_teachers:
                self.in_memory_teachers[teacher_id]['prompt'] = prompt
                self.in_memory_teachers[teacher_id]['updated_at'] = datetime.now()
                return True
            return False

    def delete_teacher(self, teacher_id):
        """Delete a custom teacher."""
        if self.use_mongodb:
            try:
                # Ensure we only delete custom teachers for safety, or allow deleting any if needed
                result = self.teachers.delete_one({'teacher_id': teacher_id, 'is_custom': True})
                return result.deleted_count > 0
            except Exception as e:
                print(f"Error deleting teacher {teacher_id}: {e}")
                return False
        else:
            if hasattr(self, 'in_memory_teachers') and teacher_id in self.in_memory_teachers and self.in_memory_teachers[teacher_id]['is_custom']:
                del self.in_memory_teachers[teacher_id]
                return True
            return False

    def create_new_session(self, name=None):
        """Create a new chat session and return its ID"""
        session_id = str(uuid.uuid4())
        session = {
            'session_id': session_id,
            'name': name or "New Chat",
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        
        if self.use_mongodb:
            try:
                self.chat_sessions.insert_one(session)
                print(f"Created new chat session: {session_id}")
                return session_id
            except Exception as e:
                print(f"Error creating chat session: {e}")
                # Fall back to in-memory
                self.use_mongodb = False
                self.sessions[session_id] = session
                return session_id
        else:
            # In-memory implementation
            self.sessions[session_id] = session
            return session_id
    
    def get_all_sessions(self):
        """Get all chat sessions"""
        if self.use_mongodb:
            try:
                # Get all sessions sorted by update time (newest first)
                cursor = self.chat_sessions.find({}).sort('updated_at', -1)
                sessions = list(cursor)
                # Convert ObjectId to string for JSON serialization
                for session in sessions:
                    session['_id'] = str(session['_id'])
                    # Format timestamps as strings
                    session['created_at'] = session['created_at'].isoformat()
                    session['updated_at'] = session['updated_at'].isoformat()
                return sessions
            except Exception as e:
                print(f"Error getting chat sessions: {e}")
                self.use_mongodb = False
                return list(self.sessions.values())
        else:
            return list(self.sessions.values())
    
    def update_session_name(self, session_id, name):
        """Update the name of a chat session"""
        if self.use_mongodb:
            try:
                self.chat_sessions.update_one(
                    {'session_id': session_id},
                    {'$set': {'name': name, 'updated_at': datetime.now()}}
                )
                return True
            except Exception as e:
                print(f"Error updating session name: {e}")
                return False
        else:
            if session_id in self.sessions:
                self.sessions[session_id]['name'] = name
                self.sessions[session_id]['updated_at'] = datetime.now()
                return True
            return False
    
    def add_message(self, session_id, role, content):
        """
        Add a new message to a specific chat session
        
        Args:
            session_id (str): The session ID
            role (str): 'user' or 'assistant'
            content (str): The message content
        """
        message = {
            'session_id': session_id,
            'role': role,
            'content': content,
            'timestamp': datetime.now()
        }
        
        # Update the session's updated_at timestamp
        if self.use_mongodb:
            try:
                # Insert the message
                self.chats.insert_one(message)
                
                # Update the session's last update time
                self.chat_sessions.update_one(
                    {'session_id': session_id},
                    {'$set': {'updated_at': datetime.now()}}
                )
                
                print(f"Message added to MongoDB session {session_id}: {role}")
                return True
            except Exception as e:
                print(f"Error adding message to MongoDB: {e}")
                # Fall back to in-memory if MongoDB operation fails
                self.use_mongodb = False
                if session_id not in self.sessions:
                    self.sessions[session_id] = {
                        'session_id': session_id,
                        'name': "New Chat",
                        'created_at': datetime.now(),
                        'updated_at': datetime.now()
                    }
                if session_id not in self.chat_history:
                    self.chat_history[session_id] = []
                self.chat_history[session_id].append(message)
                return True
        else:
            # In-memory implementation
            if session_id not in self.sessions:
                self.sessions[session_id] = {
                    'session_id': session_id,
                    'name': "New Chat",
                    'created_at': datetime.now(),
                    'updated_at': datetime.now()
                }
            if not hasattr(self, 'chat_history') or not isinstance(self.chat_history, dict):
                self.chat_history = {}
            if session_id not in self.chat_history:
                self.chat_history[session_id] = []
            
            self.chat_history[session_id].append(message)
            self.sessions[session_id]['updated_at'] = datetime.now()
            
            print(f"Message added to in-memory storage for session {session_id}: {role}")    
            return True
    
    def get_chat_history(self, session_id=None):
        """Get chat messages for a specific session or all messages if no session specified"""
        if self.use_mongodb:
            try:
                # MongoDB implementation
                # Get messages sorted by timestamp
                query = {'session_id': session_id} if session_id else {}
                cursor = self.chats.find(query, {'_id': 0, 'session_id': 0}).sort('timestamp', 1)
                history = list(cursor)
                # Remove timestamps from the output
                for msg in history:
                    if 'timestamp' in msg:
                        del msg['timestamp']
                print(f"Retrieved {len(history)} messages from MongoDB" + 
                      (f" for session {session_id}" if session_id else ""))
                return history
            except Exception as e:
                print(f"Error getting chat history from MongoDB: {e}")
                # Fall back to in-memory if MongoDB operation fails
                self.use_mongodb = False
                return self._get_in_memory_history(session_id)
        else:
            return self._get_in_memory_history(session_id)
    
    def _get_in_memory_history(self, session_id=None):
        """Helper method to get history from in-memory storage"""
        if not hasattr(self, 'chat_history') or not isinstance(self.chat_history, dict):
            return []
        
        # If session_id provided, return just that session's messages
        if session_id:
            if session_id not in self.chat_history:
                return []
            # Remove timestamps and session_id for consistency with the MongoDB output
            cleaned_history = []
            for msg in self.chat_history[session_id]:
                cleaned_msg = {'role': msg['role'], 'content': msg['content']}
                cleaned_history.append(cleaned_msg)
            print(f"Retrieved {len(cleaned_history)} messages from in-memory storage for session {session_id}")
            return cleaned_history
        
        # If no session_id, return all messages
        all_messages = []
        for session_messages in self.chat_history.values():
            for msg in session_messages:
                cleaned_msg = {'role': msg['role'], 'content': msg['content']}
                all_messages.append(cleaned_msg)
        
        print(f"Retrieved {len(all_messages)} total messages from in-memory storage")
        return all_messages
    
    def clear_history(self, session_id=None):
        """Clear chat history for a specific session or all if no session specified"""
        if self.use_mongodb:
            try:
                if session_id:
                    # Delete messages for this session
                    result = self.chats.delete_many({'session_id': session_id})
                    # Delete the session itself
                    self.chat_sessions.delete_one({'session_id': session_id})
                    print(f"Cleared session {session_id}: {result.deleted_count} messages")
                else:
                    # Delete all messages
                    result = self.chats.delete_many({})
                    # Delete all sessions
                    self.chat_sessions.delete_many({})
                    print(f"Cleared all chat history: {result.deleted_count} messages")
                return True
            except Exception as e:
                print(f"Error clearing chat history from MongoDB: {e}")
                # Fall back to in-memory if MongoDB operation fails
                self.use_mongodb = False
                self._clear_in_memory_history(session_id)
                return True
        else:
            return self._clear_in_memory_history(session_id)
    
    def _clear_in_memory_history(self, session_id=None):
        """Helper method to clear history from in-memory storage"""
        if session_id:
            if hasattr(self, 'chat_history') and isinstance(self.chat_history, dict):
                if session_id in self.chat_history:
                    del self.chat_history[session_id]
            if hasattr(self, 'sessions') and session_id in self.sessions:
                del self.sessions[session_id]
            print(f"Cleared in-memory chat history for session {session_id}")
        else:
            self.chat_history = {}
            self.sessions = {}
            print("Cleared all in-memory chat history")
        return True

# Create a singleton instance
db = ChatDatabase()