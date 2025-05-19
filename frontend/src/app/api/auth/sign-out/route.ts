import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    // Get the access token from the request
    const accessToken = request.headers.get("Authorization")?.split(" ")[1];
    
    if (!accessToken) {
      return NextResponse.json(
        { message: "No access token provided" },
        { status: 401 }
      );
    }

    // Get the backend URL from environment variables or use a default
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    
    // Call the backend sign-out endpoint
    await axios.delete(`${backendUrl}/auth/sign-out`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    // Return success response
    return NextResponse.json({ message: "Successfully signed out" });
  } catch (error: any) {
    console.error("Sign out error:", error.response?.data || error.message);
    
    // Forward the error from the backend if available
    if (error.response) {
      return NextResponse.json(
        { message: error.response.data.message || "An error occurred during sign out" },
        { status: error.response.status || 500 }
      );
    }

    return NextResponse.json(
      { message: "An error occurred during sign out" },
      { status: 500 }
    );
  }
}
