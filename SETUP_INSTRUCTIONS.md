# Setup Instructions for Case Status Feature

## Option 1: Using Docker (recommended)

Using Docker is the most reliable way to run the application, especially for the backend which requires Chrome.

1. Make sure you have Docker and Docker Compose installed
2. In the project root directory, run:
```
docker-compose up
```
3. Access the application at http://localhost:3000/case-status

## Option 2: Manual Setup

### Requirements
- Python 3.8 or higher
- Chrome browser installed
- Node.js and npm

### Setup Backend (FastAPI)

1. Navigate to the backend directory
```
cd backend
```

2. Create a Python virtual environment
```
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python -m venv venv
source venv/bin/activate
```

3. Install required packages
```
pip install -r requirements.txt
```

4. Start the FastAPI server
```
# Windows
uvicorn app:app --host 0.0.0.0 --port 8000 --reload

# Linux/Mac
chmod +x run.sh
./run.sh
```

### Start the Frontend

In a new terminal window:

```
npm run dev
```

## Using the Application

1. Open your browser and go to http://localhost:3000/case-status
2. You should see the Case Status page with a working CAPTCHA
3. Enter a CNR number (e.g., DLHC01-000123-2023) and the CAPTCHA
4. Click "Search Case Status" to see the results

## Troubleshooting

- If you encounter issues with the ChromeDriver, the application will automatically fall back to generating a simple captcha.
- If using Docker, make sure ports 3000 and 8000 are not already in use on your machine.
- In manual setup, make sure all dependencies are properly installed and Chrome is available. 