from flask import Flask, send_from_directory
import os
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
    
    return app

# Create the application instance
app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Changed from default port 5000 to 5001