# SAHPAATHI - Your AI Study Companion

SAHPAATHI is a web application that provides students with an AI-powered study companion. Users can ask questions and receive informative responses powered by Google's Gemini AI model.

## Features

- Clean, modern chat interface
- Real-time AI-powered responses using Google's Gemini model
- Markdown formatting support in responses
- Responsive design for all devices
- Loading animations to indicate processing

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Flask (Python)
- **AI Integration**: Google's Gemini API

## Setup Instructions

### Prerequisites

- Python 3.8+
- A Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Gurkirat-Singh-bit/SAHPATHI.git
cd SAHPATHI
```

2. Create a virtual environment and install dependencies:
```bash
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up your environment variables:
   - Create a `.env` file in the root directory
   - Add your Gemini API key: `GOOGLE_API_KEY=your_gemini_api_key_here`

### Running the Application

1. Start the Flask server:
```bash
cd backend
python app.py
```

2. Open your browser and navigate to `http://127.0.0.1:5000/`

## Project Structure

```
sahpaathi/
├── backend/
│   ├── app.py           # Main Flask application
│   ├── db.py            # Database module 
│   ├── routes.py        # API routes
│   ├── utils.py         # Utility functions for Gemini API
│   └── templates/
│       └── index.html   # Main HTML template
├── static/
│   ├── script.js        # Frontend JavaScript
│   └── style.css        # CSS styles
├── .env                 # Environment variables (not in repo)
├── .gitignore           # Git ignore file
├── README.md            # Project documentation
└── requirements.txt     # Python dependencies
```

## Future Enhancements

- User authentication
- Persistent chat history with MongoDB
- Voice input/output capabilities
- File upload for contextual responses
- More personalized learning recommendations

## License

This Project is Licensed under CC BY-NC 4.0.

## Acknowledgments

- Google Gemini API for powering the AI responses
- Flask team for the excellent web framework
