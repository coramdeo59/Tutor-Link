import { NextResponse } from 'next/server';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';

// Configure Cloudinary with direct values for testing
// Note: In production, you would want to use a more secure approach
cloudinary.config({
  cloud_name: 'dvviccqdv',
  api_key: '129548223523729',
  api_secret: '9dPabuGFCdQTbKKcXFkaGLVBohs',
});

// Log configuration to verify it's working
console.log('Cloudinary configuration:', {
  cloud_name: 'dvviccqdv',
  api_key: '129548223523729', // Logging for debugging purposes
});

export async function POST(request: Request) {
  try {
    // Get the FormData from the request
    const formData = await request.formData();
    
    // Extract the profile photo and user data
    const profilePhoto = formData.get('profilePhoto') as File;
    const dataString = formData.get('data') as string;
    const userData = JSON.parse(dataString);
    
    let photoUrl = null;
    
    if (profilePhoto) {
      // Upload the photo to Cloudinary
      const buffer = Buffer.from(await profilePhoto.arrayBuffer());
      const base64Image = buffer.toString('base64');
      const dataURI = `data:${profilePhoto.type};base64,${base64Image}`;

      // Upload to Cloudinary with better error handling
      try {
        console.log('Uploading to Cloudinary...');
        console.log('Cloud name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
        
        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
          cloudinary.uploader.upload(
            dataURI,
            {
              folder: 'tutor-link/profiles',
              resource_type: 'image',
            },
            (error, callResult) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                reject(error);
              } else if (callResult) {
                console.log('Cloudinary upload success');
                resolve(callResult);
              } else {
                reject(new Error('Failed to upload image'));
              }
            }
          );
        });
      
        // Get the photo URL
        photoUrl = result.secure_url;
      } catch (error) {
        console.error('Error in Cloudinary upload:', error);
        throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    // Add the photo URL to the user data
    const dataWithPhoto = {
      ...userData,
      photo: photoUrl,
    };
    
    // Call the backend API
    // Choose the appropriate endpoint based on user role
    const endpoint = dataWithPhoto.role === 'TUTOR' ? '/auth/sign-up/tutor' : '/auth/sign-up/parent';
    
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${endpoint}`,
      dataWithPhoto
    );
    
    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    console.error('Registration with photo error:', error.response?.data || error.message);
    
    return NextResponse.json(
      { message: error.response?.data?.message || 'An error occurred during registration' },
      { status: error.response?.status || 500 }
    );
  }
}
