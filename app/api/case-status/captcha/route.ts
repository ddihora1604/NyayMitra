import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// In-memory storage for captchas
const captchaStore: Record<string, string> = {};

// Helper to generate captcha text
function generateCaptcha(length = 6) {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Export captcha store for use in other routes
export { captchaStore };

// GET endpoint to fetch a new captcha
export async function GET(request: NextRequest) {
  try {
    // Call the FastAPI backend
    const response = await axios.post(`${BACKEND_URL}/captcha`);
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error generating captcha:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate captcha' },
      { status: 500 }
    );
  }
} 