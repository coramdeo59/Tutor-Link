import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Call the backend API
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/sign-in`,
      data
    );
    
    // Return the tokens from the backend
    return NextResponse.json({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken
    }, { status: 200 });
  } catch (error: any) {
    console.error('Login error:', error.response?.data || error.message);
    
    return NextResponse.json(
      { message: error.response?.data?.message || 'Login failed. Please check your credentials.' },
      { status: error.response?.status || 500 }
    );
  }
}
