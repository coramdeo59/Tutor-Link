import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Call the backend API with the tutor-specific endpoint
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/sign-up/tutor`,
      data
    );
    
    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    console.error('Tutor registration error:', error.response?.data || error.message);
    
    return NextResponse.json(
      { message: error.response?.data?.message || 'An error occurred during tutor registration' },
      { status: error.response?.status || 500 }
    );
  }
}
