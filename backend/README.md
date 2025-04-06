# Case Status Backend

This is a FastAPI backend for the Case Status feature.

## Setup

1. Create a virtual environment:
```
python -m venv venv
```

2. Activate the virtual environment:
```
# On Windows
venv\Scripts\activate

# On Linux/Mac
source venv/bin/activate
```

3. Install dependencies:
```
pip install -r requirements.txt
```

4. Run the server:
```
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```
Or use the run script:
```
# On Linux/Mac (may need to make executable first with chmod +x run.sh)
./run.sh

# On Windows
# Create a run.bat file with: uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

- `POST /captcha` - Fetch a captcha image
- `POST /search` - Submit CNR number and captcha for search
- `GET /health` - Health check

## Requirements

- Python 3.8+
- Chrome browser installed (for Selenium) 