import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload an image to Cloudinary
 * @param file The file to upload
 * @returns An object containing the image URL and public ID
 */
export async function uploadImage(file: File) {
  try {
    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;
    
    // Upload to Cloudinary
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        {
          folder: 'tutor-link-profiles',
          resource_type: 'image',
          transformation: [
            { width: 500, height: 500, crop: 'limit' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve({
              url: result?.secure_url,
              publicId: result?.public_id
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('Error in uploadImage:', error);
    throw error;
  }
}
