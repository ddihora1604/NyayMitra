import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// POST endpoint to search for case status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cnr, captcha, session_id } = body;

    // Basic validation
    if (!cnr || !captcha || !session_id) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Forward the request to the FastAPI backend
    const response = await axios.post(`${BACKEND_URL}/search`, {
      cnr,
      captcha,
      session_id
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error searching case status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.response?.data?.error || 'Failed to search case status' 
      },
      { status: error.response?.status || 500 }
    );
  }
} 