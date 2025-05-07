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

# Add route to serve files from uploads directory
@routes.route('/uploads/<path:filename>')
def uploaded_file(filename):
    """Serve uploaded/generated files"""
    return send_from_directory(UPLOAD_FOLDER, filename)