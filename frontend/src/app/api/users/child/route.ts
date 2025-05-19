import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// The base URL for the backend API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Make sure required fields are provided
    const requiredFields = ['firstName', 'lastName', 'username', 'password', 'parentId'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Extract the authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    
    // Define default headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add Authorization header if it exists
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Forward the request to the backend API with the appropriate headers
    const response = await axios.post(`${API_URL}/users/child`, body, {
      headers: headers
    });

    // Return the response data
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error in child creation API route:', error.response?.data || error.message);
    
    // Return appropriate error response
    return NextResponse.json(
      { 
        message: error.response?.data?.message || 'Failed to create child account' 
      },
      { 
        status: error.response?.status || 500 
      }
    );
  }
}
