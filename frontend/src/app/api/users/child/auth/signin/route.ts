import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// The base URL for the backend API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Destructure the username and password from the body
    const { username, password } = body;
    
    // Make sure username and password are provided
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Set headers to avoid CORS issues
    const headers = {
      'Content-Type': 'application/json',
    };

    // Forward the request to the backend API
    const response = await axios.post(`${API_URL}/users/child/auth/signin`, {
      username,
      password,
    }, { headers });

    // Return the response data
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error in child signin API route:', error.response?.data || error.message);
    
    // Return appropriate error response
    return NextResponse.json(
      { 
        message: error.response?.data?.message || 'An error occurred during sign in' 
      },
      { 
        status: error.response?.status || 500 
      }
    );
  }
}
