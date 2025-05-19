import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token) {
      return NextResponse.json(
        { message: "Token is required" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { message: "Password is required" },
        { status: 400 }
      );
    }

    // Get the backend URL from environment variables or use a default
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    
    // Forward the request to the backend
    const response = await axios.post(
      `${backendUrl}/auth/password/reset`,
      { token, password }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Reset password error:", error.response?.data || error.message);
    
    // Forward the error from the backend if available
    if (error.response) {
      return NextResponse.json(
        { message: error.response.data.message || "An error occurred" },
        { status: error.response.status || 500 }
      );
    }

    return NextResponse.json(
      { message: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
