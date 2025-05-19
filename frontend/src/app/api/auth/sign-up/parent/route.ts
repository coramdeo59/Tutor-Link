import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Call the backend API with the parent-specific endpoint
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/sign-up/parent`,
      data
    );
    
    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    console.error('Parent registration error:', error.response?.data || error.message);
    
    return NextResponse.json(
      { message: error.response?.data?.message || 'An error occurred during parent registration' },
      { status: error.response?.status || 500 }
    );
  }
}
