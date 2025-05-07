from flask import Blueprint, render_template, request, jsonify
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

@routes.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat API requests"""
    data = request.json
    user_prompt = data.get('prompt', '')
    
    if not user_prompt:
        return jsonify({'error': 'No prompt provided'}), 400
    
    # Check if API key is configured
    if not is_api_key_valid():
        return jsonify({
            'error': 'API key not configured. Please set your Gemini API key in the .env file.'
        }), 500
    
    # Store user message
    db.add_message('user', user_prompt)
    
    # Generate response from Gemini
    ai_response = generate_response(user_prompt)
    
    # Store AI response
    db.add_message('assistant', ai_response)
    
    return jsonify({
        'response': ai_response
    })

@routes.route('/api/history', methods=['GET'])
def get_history():
    """Get chat history"""
    return jsonify({
        'history': db.get_chat_history()
    })

@routes.route('/api/clear', methods=['POST'])
def clear_history():
    """Clear chat history"""
    db.clear_history()
    return jsonify({
        'success': True
    })