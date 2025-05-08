import os
import google.generativeai as genai
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

# Get the API key from environment variables
api_key = os.getenv("GOOGLE_API_KEY")  # Changed from gemini_api_key to GOOGLE_API_KEY
logger.info(f"API key loaded: {'Successfully loaded' if api_key else 'Failed to load'}")

# Set up Gemini API
genai.configure(api_key=api_key)

# Try to read instruction file if it exists
instruction = "You are SAHPAATHI, an AI assistant designed to help students with their studies."
try:
    # Use the correct relative path to instruction.txt
    instruction_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "instruction.txt")
    with open(instruction_path, "r") as f:
        instruction = f.read()
        logger.info(f"Loaded instructions from {instruction_path}")
except FileNotFoundError:
    logger.info("Using default instructions (instruction.txt not found)")

# Initialize the model (1.5 flash is fast and efficient)
try:
    model = genai.GenerativeModel("gemini-1.5-flash", system_instruction=instruction)
    logger.info("Model initialized successfully")
except Exception as e:
    logger.error(f"Error initializing model: {str(e)}")
    model = None

def generate_response(prompt):
    """
    Generate a response from the Gemini model based on the provided prompt.
    """
    try:
        # Generate a response using the model
        response = model.generate_content(prompt)
        logger.info("Response generated successfully")
        return response.text
    except Exception as e:
        logger.error(f"Error generating response: {str(e)}")
        return f"Error generating response: {str(e)}"

def is_api_key_valid():
    """Check if the API key is valid and configured properly"""
    return api_key is not None and model is not None