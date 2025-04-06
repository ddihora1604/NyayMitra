from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import time
import base64
import random
import string
from PIL import Image, ImageDraw, ImageFont
import io
import traceback
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Try to import selenium components, but provide fallback if not available
try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import NoSuchElementException, TimeoutException
    try:
        from webdriver_manager.chrome import ChromeDriverManager
        selenium_available = True
    except ImportError:
        logger.warning("webdriver_manager not available, fallback captcha will be used")
        selenium_available = False
except ImportError:
    logger.warning("Selenium not available, fallback captcha will be used")
    selenium_available = False

app = FastAPI()

# Enable CORS for frontend (React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global driver instance
driver = None

# Initialize the WebDriver
def initialize_driver():
    global driver
    if not selenium_available:
        return False
    
    try:
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # Run in headless mode
        chrome_options.add_argument("--disable-gpu")  # Disable GPU acceleration
        chrome_options.add_argument("--no-sandbox")  # Required for running in some environments
        chrome_options.add_argument("--window-size=1920,1080")  # Set window size for headless mode

        # Use a specific version of ChromeDriver instead of trying to match the current Chrome version
        try:
            service = Service(ChromeDriverManager(driver_version="114.0.5735.90").install())
            driver = webdriver.Chrome(service=service, options=chrome_options)
            return True
        except Exception as e:
            logger.error(f"Failed to initialize driver with specific version: {str(e)}")
            # Try with default version as fallback
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=chrome_options)
            return True
    except Exception as e:
        logger.error(f"Error initializing driver: {str(e)}")
        return False

# Generate a fallback captcha image when selenium is not available
def generate_fallback_captcha():
    # Generate random text for captcha
    captcha_text = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    # Create an image with the text
    width, height = 200, 80
    image = Image.new('RGB', (width, height), color=(255, 255, 255))
    draw = ImageDraw.Draw(image)
    
    # Add noise (random dots)
    for _ in range(1000):
        x = random.randint(0, width-1)
        y = random.randint(0, height-1)
        draw.point((x, y), fill=(random.randint(0, 200), random.randint(0, 200), random.randint(0, 200)))
    
    # Add lines
    for _ in range(5):
        x1 = random.randint(0, width-1)
        y1 = random.randint(0, height-1)
        x2 = random.randint(0, width-1)
        y2 = random.randint(0, height-1)
        draw.line([(x1, y1), (x2, y2)], fill=(random.randint(0, 200), random.randint(0, 200), random.randint(0, 200)), width=2)
    
    # Add text
    for i, char in enumerate(captcha_text):
        x = 30 + i * 25 + random.randint(-5, 5)
        y = 20 + random.randint(-5, 5)
        draw.text((x, y), char, fill=(0, 0, 0))
    
    # Convert image to bytes and then to base64
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return captcha_text, img_str

@app.post("/captcha")
async def fetch_captcha():
    """Fetch the CAPTCHA image"""
    try:
        # Try to use Selenium first
        if selenium_available and initialize_driver():
            logger.info("Using Selenium to fetch captcha")
            try:
                # Open the target website
                driver.get("https://services.ecourts.gov.in/ecourtindia_v6/")
                time.sleep(5)  # Allow the page to load

                # Capture the CAPTCHA image
                captcha_element = driver.find_element(By.ID, "captcha_image")
                captcha_image_data = captcha_element.screenshot_as_png  # Capture screenshot as PNG data
                captcha_base64 = base64.b64encode(captcha_image_data).decode("utf-8")  # Convert to base64
                
                # For production, you would need to keep track of the captcha text
                # For demo, we'll just generate a random session ID
                session_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=16))

                return JSONResponse(content={
                    "success": True, 
                    "captcha_base64": captcha_base64, 
                    "session_id": session_id
                })
            except Exception as e:
                logger.error(f"Selenium captcha error: {str(e)}")
                logger.error(traceback.format_exc())
                # Fall back to generated captcha if Selenium fails
        
        # Use fallback captcha generation
        logger.info("Using fallback captcha generation")
        captcha_text, captcha_base64 = generate_fallback_captcha()
        session_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=16))
        
        # In a real app, you'd save this captcha_text associated with the session_id
        
        return JSONResponse(content={
            "success": True, 
            "captcha_base64": captcha_base64, 
            "session_id": session_id
        })

    except Exception as e:
        logger.error(f"Captcha generation error: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(status_code=500, content={
            "success": False, 
            "error": str(e)
        })

@app.post("/search")
async def submit(request: Request):
    """Process case search"""
    try:
        # Get request body as JSON
        body = await request.json()
        cnr = body.get('cnr')
        captcha = body.get('captcha')
        
        if not cnr or not captcha:
            raise HTTPException(status_code=400, detail="CNR number or CAPTCHA is missing.")

        # For demo purposes, generate mock data
        # In production, this would validate against the CAPTCHA and search for actual case data
        case_data = {
            "Case Number": cnr,
            "Status": "Pending",
            "Court": "Delhi High Court",
            "Presiding Judge": "Hon'ble Judge Name",
            "Next Hearing Date": "2023-12-15",
            "Filing Date": "2023-01-10",
            "Case Type": "Civil",
            "Petitioner": "John Doe",
            "Respondent": "Jane Smith"
        }
        
        return JSONResponse(content={"success": True, "data": case_data})

    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(status_code=500, content={
            "success": False, 
            "error": str(e)
        })

@app.on_event("shutdown")
def shutdown_event():
    """Close the WebDriver when the application shuts down."""
    global driver
    if driver:
        driver.quit()

@app.get("/health")
async def health_check():
    return {"status": "ok"} 