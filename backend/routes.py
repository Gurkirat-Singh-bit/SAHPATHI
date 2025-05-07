from flask import Blueprint, render_template, request, jsonify, session
# Fix imports to use local modules
from utils import generate_response, is_api_key_valid
from db import db

# Create a Blueprint for our routes
routes = Blueprint('routes', __name__)

@routes.route('/')
def index():
    """Render the main chat interface"""
    return render_template('index.html')

@routes.route('/api/test-gemini')
def test_gemini():
    """Test endpoint to check if Gemini API is working"""
    if not is_api_key_valid():
        return jsonify({
            'error': 'API key not configured. Please set your Gemini API key in the .env file.'
        }), 500
    
    # Try a simple test prompt
    test_result = generate_response("Say hello and confirm you're working")
    
    return jsonify({
        'status': 'Gemini API test',
        'response': test_result,
        'api_key_valid': is_api_key_valid()
    })

@routes.route('/api/sessions', methods=['GET'])
def get_sessions():
    """Get all chat sessions"""
    return jsonify({
        'sessions': db.get_all_sessions()
    })

@routes.route('/api/sessions', methods=['POST'])
def create_session():
    """Create a new chat session"""
    data = request.json
    name = data.get('name')
    session_id = db.create_new_session(name)
    return jsonify({
        'session_id': session_id,
        'success': True
    })

@routes.route('/api/sessions/<session_id>', methods=['PUT'])
def update_session(session_id):
    """Update a chat session name"""
    data = request.json
    name = data.get('name')
    if not name:
        return jsonify({'error': 'No name provided'}), 400
    
    success = db.update_session_name(session_id, name)
    return jsonify({
        'success': success
    })

@routes.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat API requests"""
    data = request.json
    user_prompt = data.get('prompt', '')
    session_id = data.get('session_id')
    
    if not user_prompt:
        return jsonify({'error': 'No prompt provided'}), 400
    
    # Check if API key is configured
    if not is_api_key_valid():
        return jsonify({
            'error': 'API key not configured. Please set your Gemini API key in the .env file.'
        }), 500
    
    # Create a new session if none provided
    if not session_id:
        session_id = db.create_new_session("New Chat")
    
    # Store user message in the session
    db.add_message(session_id, 'user', user_prompt)
    
    # Generate response from Gemini
    ai_response = generate_response(user_prompt)
    
    # Store AI response in the session
    db.add_message(session_id, 'assistant', ai_response)
    
    return jsonify({
        'response': ai_response,
        'session_id': session_id
    })

@routes.route('/api/history', methods=['GET'])
def get_history():
    """Get chat history for all sessions or a specific session"""
    session_id = request.args.get('session_id')
    return jsonify({
        'history': db.get_chat_history(session_id),
        'session_id': session_id
    })

@routes.route('/api/clear', methods=['POST'])
def clear_history():
    """Clear chat history for all sessions or a specific session"""
    data = request.json
    session_id = data.get('session_id')
    db.clear_history(session_id)
    return jsonify({
        'success': True
    })