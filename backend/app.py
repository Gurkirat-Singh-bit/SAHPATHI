from flask import Flask, send_from_directory
import os
import argparse
# Using direct import instead of package import
from routes import routes

def create_app():
    """Create and configure the Flask application"""
    # Create Flask app
    app = Flask(__name__, 
                template_folder='templates',
                static_folder='../static')
    
    # Register blueprints
    app.register_blueprint(routes)
    
    # Add route for serving static files
    @app.route('/static/<path:path>')
    def serve_static(path):
        return send_from_directory('../static', path)
    
    # Add route for serving uploaded files
    @app.route('/uploads/<path:filename>')
    def serve_uploads(filename):
        upload_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads')
        return send_from_directory(upload_dir, filename)
    
    return app

# Create the application instance
app = create_app()

if __name__ == '__main__':
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Run the SAHPAATHI Flask server')
    parser.add_argument('--port', type=int, default=5001, help='Port to run the server on')
    args = parser.parse_args()
    
    # Run the Flask app
    app.run(debug=True, port=args.port)