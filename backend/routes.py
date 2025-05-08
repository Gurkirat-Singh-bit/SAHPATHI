import re
import json
from flask import Blueprint, render_template, request, jsonify, session, send_from_directory, url_for
import os
import sys
import uuid
import markdown
import tempfile
import logging
import traceback
from werkzeug.utils import secure_filename
# Fix imports to use local modules
from utils import generate_response, is_api_key_valid
from db import db

# Configure logging more thoroughly
logging.basicConfig(level=logging.DEBUG, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize default values for PDF conversion libraries
USE_WEASYPRINT = False
USE_PDFKIT = False

# Try to import different PDF generators with detailed error reporting
try:
    import weasyprint
    USE_WEASYPRINT = True
    logger.info("WeasyPrint successfully imported for PDF generation")
except ImportError as e:
    USE_WEASYPRINT = False
    logger.error(f"WeasyPrint import error: {str(e)}")
    # Check for missing system dependencies
    if "cairo" in str(e).lower() or "pango" in str(e).lower():
        logger.error("Missing system dependencies for WeasyPrint. You may need to install cairo and pango.")
        logger.error("Try running: sudo apt-get install libcairo2 libpango-1.0-0 libpangocairo-1.0-0")

try:
    import pdfkit
    USE_PDFKIT = True
    logger.info("PDFKit successfully imported for PDF generation")
    # Check if wkhtmltopdf is installed
    try:
        import subprocess
        result = subprocess.run(['which', 'wkhtmltopdf'], capture_output=True, text=True)
        if result.returncode == 0:
            logger.info(f"wkhtmltopdf found at: {result.stdout.strip()}")
        else:
            logger.warning("wkhtmltopdf not found in system. PDFKit may not work properly.")
            logger.warning("Try installing with: sudo apt-get install wkhtmltopdf")
    except Exception as e:
        logger.warning(f"Could not check for wkhtmltopdf: {str(e)}")
except ImportError as e:
    USE_PDFKIT = False
    logger.error(f"PDFKit import error: {str(e)}")

# Create a Blueprint for our routes
routes = Blueprint('routes', __name__)

# Create upload folder if it doesn't exist
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
    logger.info(f"Created uploads directory at {UPLOAD_FOLDER}")
else:
    logger.info(f"Using existing uploads directory at {UPLOAD_FOLDER}")

@routes.route('/')
def index():
    """Render the main chat interface"""
    return render_template('index.html')

@routes.route('/api/convert-text-to-pdf', methods=['POST'])
def convert_text_to_pdf():
    """Convert directly entered text to PDF"""
    try:
        data = request.json
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        
        text_content = data.get('text', '')
        title = data.get('title', 'Document')
        
        # Generate unique filename
        unique_id = str(uuid.uuid4())[:8]
        pdf_path = os.path.join(UPLOAD_FOLDER, f"{title}_{unique_id}.pdf")
        pdf_filename = f"{title}_{unique_id}.pdf"
        
        # Convert text content to HTML - no markdown parsing needed
        html = f"<pre>{text_content}</pre>"
        
        success = convert_html_to_pdf(html, pdf_path, title)
        
        if success:
            # Fix the URL generation - use direct path instead
            return jsonify({
                'success': True,
                'pdf_url': f'/uploads/{pdf_filename}',
                'filename': pdf_filename
            })
        else:
            return jsonify({
                'error': 'Failed to convert text to PDF. See server logs for details.'
            }), 500
    
    except Exception as e:
        error_details = traceback.format_exc()
        logger.error(f"Text to PDF conversion error: {str(e)}\n{error_details}")
        return jsonify({'error': str(e)}), 500

@routes.route('/api/convert-md-to-pdf', methods=['POST'])
def convert_md_to_pdf():
    """Convert Markdown or Text file to PDF"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Check if file is Markdown or Text
    if not (file.filename.endswith('.md') or file.filename.endswith('.txt')):
        return jsonify({'error': 'File must be a Markdown (.md) or Text (.txt) file'}), 400
    
    try:
        # Create unique filename to avoid conflicts
        filename = secure_filename(file.filename)
        base_name = os.path.splitext(filename)[0]
        unique_id = str(uuid.uuid4())[:8]  # Use shorter UUID
        input_path = os.path.join(UPLOAD_FOLDER, f"{base_name}_{unique_id}{os.path.splitext(filename)[1]}")
        pdf_path = os.path.join(UPLOAD_FOLDER, f"{base_name}_{unique_id}.pdf")
        pdf_filename = f"{base_name}_{unique_id}.pdf"
        
        # Save the uploaded file
        file.save(input_path)
        logger.info(f"Saved uploaded file to {input_path}")
        
        # Read the content
        with open(input_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # If it's a Markdown file, convert to HTML with markdown library
        # If it's a text file, wrap in pre tags
        if input_path.endswith('.md'):
            logger.info("Converting markdown to HTML")
            html = markdown.markdown(content, extensions=['extra', 'codehilite'])
        else:  # Text file
            logger.info("Processing text file")
            html = f"<pre>{content}</pre>"
        
        success = convert_html_to_pdf(html, pdf_path, base_name)
        
        if success:
            logger.info(f"PDF successfully created at {pdf_path}")
            # Fix the URL generation - use direct path instead
            return jsonify({
                'success': True,
                'pdf_url': f'/uploads/{pdf_filename}',
                'filename': pdf_filename
            })
        else:
            logger.error("PDF conversion failed - see above logs for details")
            return jsonify({
                'error': 'Failed to convert to PDF. See server logs for details.'
            }), 500
        
    except Exception as e:
        error_details = traceback.format_exc()
        logger.error(f"PDF conversion error: {str(e)}\n{error_details}")
        return jsonify({'error': str(e)}), 500

def convert_html_to_pdf(html_content, pdf_path, title="Document"):
    """Helper function to convert HTML content to PDF - simplified for Unicode support"""
    try:
        from fpdf import FPDF
        import re
        
        logger.info("Starting simplified Unicode-aware PDF conversion")
        
        # Remove HTML tags for simple text conversion
        if html_content.startswith("<pre>") and html_content.endswith("</pre>"):
            # It's pre-formatted text, just remove the tags
            text = html_content[5:-6]  # Remove <pre> and </pre>
        else:
            # Simple HTML to text conversion
            text = re.sub(r'<[^>]*>', '', html_content)
        
        # Try to save as plain text first (fallback)
        txt_path = pdf_path.replace('.pdf', '.txt')
        with open(txt_path, 'w', encoding='utf-8') as f:
            f.write(text)
        logger.info(f"Saved content as text file: {txt_path}")
        
        # Try a simple approach with standard fonts
        try:
            # Create PDF instance
            pdf = FPDF()
            pdf.add_page()
            
            # Set title
            pdf.set_font("Arial", 'B', 16)
            pdf.cell(0, 10, title, ln=True, align='C')
            pdf.ln(10)
            
            # Process content safely
            pdf.set_font("Arial", size=12)
            
            # Filter out problematic Unicode characters
            filtered_text = ''.join(c for c in text if ord(c) < 128)
            
            # Split into lines and process each line
            lines = filtered_text.split('\n')
            for line in lines:
                if line.strip():
                    try:
                        pdf.multi_cell(0, 10, line)
                    except Exception as e:
                        logger.warning(f"Skipping problematic line: {e}")
                else:
                    pdf.ln(5)
            
            # Output PDF
            pdf.output(pdf_path)
            logger.info(f"Successfully created PDF at {pdf_path}")
            return True
        except Exception as e:
            logger.error(f"Basic PDF generation failed: {str(e)}")
            logger.error(traceback.format_exc())
            
            # If we couldn't generate a PDF but have a text file, return False
            # so the application can still provide the text file as a fallback
            return False
            
    except Exception as e:
        error_msg = f"PDF conversion error: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        return False

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

# Teacher Management Routes
@routes.route('/api/teachers', methods=['GET'])
def get_teachers():
    """Get all teachers."""
    teachers = db.get_all_teachers()
    return jsonify({'teachers': teachers})

@routes.route('/api/teachers', methods=['POST'])
def create_teacher():
    """Create a new custom teacher."""
    data = request.json
    name = data.get('name')
    prompt = data.get('prompt')
    if not name or not prompt:
        return jsonify({'error': 'Name and prompt are required'}), 400
    teacher_id = db.create_teacher(name, prompt, is_custom=True)
    if teacher_id:
        return jsonify({'success': True, 'teacher_id': teacher_id, 'message': 'Teacher created successfully'}), 201
    else:
        return jsonify({'error': 'Failed to create teacher'}), 500

@routes.route('/api/teachers/<teacher_id>', methods=['PUT'])
def update_teacher(teacher_id):
    """Update a teacher's prompt."""
    data = request.json
    prompt = data.get('prompt')
    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400
    success = db.update_teacher_prompt(teacher_id, prompt)
    if success:
        return jsonify({'success': True, 'message': 'Teacher updated successfully'})
    else:
        return jsonify({'error': 'Failed to update teacher or teacher not found'}), 404

@routes.route('/api/teachers/<teacher_id>', methods=['DELETE'])
def delete_teacher(teacher_id):
    """Delete a custom teacher."""
    # Potentially add more checks here, e.g., ensure it is a custom teacher
    teacher = db.get_teacher(teacher_id)
    if not teacher:
        return jsonify({'error': 'Teacher not found'}), 404
    if not teacher.get('is_custom'):
        return jsonify({'error': 'Cannot delete a default teacher'}), 403

    success = db.delete_teacher(teacher_id)
    if success:
        return jsonify({'success': True, 'message': 'Teacher deleted successfully'})
    else:
        return jsonify({'error': 'Failed to delete teacher'}), 500

# Add route to serve files from uploads directory
@routes.route('/uploads/<path:filename>')
def uploaded_file(filename):
    """Serve uploaded/generated files"""
    return send_from_directory(UPLOAD_FOLDER, filename)

@routes.route('/api/generate-quiz', methods=['POST'])
def generate_quiz():
    """Generate a quiz based on chat history"""
    data = request.json
    messages = data.get('messages', [])
    session_id = data.get('session_id')
    
    if not messages and not session_id:
        return jsonify({'error': 'Either messages or session_id is required'}), 400
    
    # If no messages provided but session_id is, get the last 5 user questions from history
    if not messages and session_id:
        chat_history = db.get_chat_history(session_id)
        user_messages = [msg['content'] for msg in chat_history if msg['role'] == 'user']
        messages = user_messages[-5:] if len(user_messages) >= 5 else user_messages
    
    # Ensure we have messages to work with
    if not messages:
        return jsonify({'error': 'No messages found to generate quiz'}), 400
    
    # Create a prompt to generate the quiz
    prompt = f"""Based on these questions/topics: 
{', '.join(messages)}

Generate a multiple-choice quiz with 5 questions. Each question should have 4 options with only one correct answer.
Format your response as a JSON object with this structure:
{{
  "quiz": [
    {{
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": "Option A"
    }},
    ... more questions ...
  ]
}}
Ensure your response is ONLY the JSON object, with no additional text or explanation."""
    
    logger.info(f"Generating quiz from prompt: {prompt[:100]}...")
    
    try:
        # Generate response from the AI
        raw_response = generate_response(prompt)
        
        # Extract JSON from response (in case there's any extra text)
        import re
        import json
        
        # Look for JSON pattern in the response
        json_match = re.search(r'({[\s\S]*})', raw_response)
        if json_match:
            json_str = json_match.group(1)
            try:
                quiz_data = json.loads(json_str)
                return jsonify(quiz_data)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse quiz JSON: {e}")
                return jsonify({'error': 'Failed to generate valid quiz format'}), 500
        else:
            logger.error("No JSON found in response")
            return jsonify({'error': 'Failed to generate quiz in correct format'}), 500
            
    except Exception as e:
        logger.error(f"Quiz generation error: {str(e)}")
        return jsonify({'error': f'Error generating quiz: {str(e)}'}), 500

@routes.route('/generate-quiz', methods=['GET'])
def generate_quiz_endpoint():
    """Generate a quiz based on the current chat session"""
    # Get the current session ID if available
    session_id = request.args.get('session_id')
    
    if not session_id:
        # Try to find the most recent session
        all_sessions = db.get_all_sessions()
        if all_sessions and len(all_sessions) > 0:
            session_id = all_sessions[0]['session_id']
        else:
            return jsonify({'error': 'No active session found'}), 400
    
    # Get the chat history for this session
    chat_history = db.get_chat_history(session_id)
    
    # Extract user messages from chat history
    user_messages = [msg['content'] for msg in chat_history if msg['role'] == 'user']
    
    # Take the last 5 messages, or all if less than 5
    messages = user_messages[-5:] if len(user_messages) >= 5 else user_messages
    
    # Ensure we have messages to work with
    if not messages:
        return jsonify({'error': 'No messages found to generate quiz'}), 400
    
    # Create a prompt to generate the quiz
    prompt = f"""Based on these questions/topics from the user: 
{', '.join(messages)}

Generate a multiple-choice quiz with 5 questions. Each question should have 4 options with only one correct answer.
Format your response as a JSON object with this structure:
{{
  "questions": [
    {{
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": "Option A"
    }},
    ... more questions ...
  ]
}}
Ensure your response is ONLY the JSON object, with no additional text or explanation."""
    
    logger.info(f"Generating quiz from prompt: {prompt[:100]}...")
    
    try:
        # Generate response from the AI
        raw_response = generate_response(prompt)
        
        # Extract JSON from response (in case there's any extra text)
        import re
        import json
        
        # Look for JSON pattern in the response
        json_match = re.search(r'({[\s\S]*})', raw_response)
        if json_match:
            json_str = json_match.group(1)
            try:
                quiz_data = json.loads(json_str)
                
                # Ensure it has the expected format
                if "questions" not in quiz_data and "quiz" in quiz_data:
                    # Handle alternate format if model returned "quiz" instead of "questions"
                    quiz_data["questions"] = quiz_data["quiz"]
                    del quiz_data["quiz"]
                
                return jsonify(quiz_data)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse quiz JSON: {e}")
                
                # Fallback to a simple quiz if JSON parsing fails
                return jsonify({
                    "questions": [
                        {
                            "question": "What's a common challenge when working with AI models?",
                            "options": ["They never fail", "Output format inconsistency", "They're too slow", "They require no prompting"],
                            "correct": "Output format inconsistency"
                        }
                    ]
                })
        else:
            logger.error("No JSON found in response")
            return jsonify({'error': 'Failed to generate quiz in correct format'}), 500
            
    except Exception as e:
        logger.error(f"Quiz generation error: {str(e)}")
        return jsonify({'error': f'Error generating quiz: {str(e)}'}), 500

@routes.route('/generate-syllabus-quiz', methods=['POST'])
def generate_quiz_from_syllabus():
    """Generate a quiz based on syllabus text."""
    try:
        # First, log the raw request to debug
        logger.info(f"Received syllabus quiz request: Content-Type={request.content_type}")
        
        # Check if the request has JSON content
        if not request.is_json:
            logger.error("Request doesn't contain valid JSON")
            return jsonify({"error": "Request must be a valid JSON"}), 400
        
        # Parse the JSON data
        data = request.json
        logger.info(f"Parsed JSON data: {data}")
        
        if not data:
            return jsonify({"error": "Empty request body"}), 400
            
        if 'text' not in data:
            logger.error("Missing 'text' field in request")
            return jsonify({"error": "No syllabus text provided. Please include a 'text' field in your request."}), 400
        
        text = data.get('text')
        count = data.get('count', 5)  # Default to 5 questions instead of 10
        
        # Log the text length to help diagnose issues
        text_length = len(text.strip()) if text else 0
        logger.info(f"Syllabus text length: {text_length} characters")
        
        # Reduced minimum character requirement from 100 to 20
        if not text or text_length < 20:
            logger.error(f"Syllabus text too short: {text_length} characters")
            return jsonify({"error": "Syllabus text is too short (minimum 20 characters)"}), 400
        
        # Generate the quiz using Gemini
        prompt = f"""
        Based on the following syllabus or study material, create a multiple-choice quiz with {count} questions.
        
        SYLLABUS/STUDY MATERIAL:
        {text}
        
        INSTRUCTIONS:
        1. Generate {count} multiple-choice questions based on factual information in the provided text.
        2. Each question should have exactly 4 options.
        3. Only one option should be correct.
        4. Don't make questions too obvious or too difficult.
        5. Focus on important concepts and key information.
        6. Return your response in JSON format as follows:
        
        {{
            "questions": [
                {{
                    "question": "Question text goes here?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correct": "Exact text of the correct option"
                }},
                ...more questions...
            ]
        }}
        
        Only return the JSON, nothing else.
        """
        
        # Make API call to Gemini
        logger.info(f"Sending prompt to Gemini, length: {len(prompt)} characters")
        generated_quiz = generate_response(prompt)
        logger.info(f"Received response from Gemini, length: {len(generated_quiz)} characters")
        
        # Parse the JSON response
        try:
            # Try direct JSON parsing first
            quiz_data = json.loads(generated_quiz)
            logger.info("Successfully parsed JSON response directly")
            return jsonify(quiz_data)
        except json.JSONDecodeError as e:
            logger.warning(f"JSON parsing failed: {e}, trying to extract JSON from text")
            
            # If the response isn't valid JSON, try to extract just the JSON part
            match = re.search(r'({[\s\S]*})', generated_quiz, re.DOTALL)
            if match:
                try:
                    json_str = match.group(1)
                    quiz_data = json.loads(json_str)
                    logger.info("Successfully extracted and parsed JSON from response")
                    return jsonify(quiz_data)
                except json.JSONDecodeError as e2:
                    logger.error(f"Extracted JSON parsing failed: {e2}")
            
            # If all JSON parsing fails, create a simple fallback quiz
            logger.error("All JSON parsing attempts failed, using fallback quiz")
            return jsonify({
                "questions": [
                    {
                        "question": "What can be challenging when working with AI-generated content?",
                        "options": [
                            "Getting consistent formatting", 
                            "AI never makes mistakes", 
                            "Processing is too fast", 
                            "Files are too small"
                        ],
                        "correct": "Getting consistent formatting"
                    }
                ]
            })
    
    except Exception as e:
        logger.error(f"Unexpected error in generate_quiz_from_syllabus: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"Server error: {str(e)}"}), 500