import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ message: 'No image URL provided' }, { status: 400 });
    }

    // Extract public_id from Cloudinary URL
    // Example: https://res.cloudinary.com/dc2bwfpk3/image/upload/v1234567890/crypto-blogs/abc123.jpg
    // public_id would be: crypto-blogs/abc123
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex === -1) {
      return NextResponse.json({ message: 'Invalid Cloudinary URL' }, { status: 400 });
    }

    // Get everything after 'upload/v{version}/' (skip version number)
    const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join('/');
    // Remove file extension
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok' || result.result === 'not found') {
      return NextResponse.json({
        success: true,
        message: 'Image deleted successfully',
        result: result.result,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to delete image',
        result: result.result,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return NextResponse.json(
      { message: 'Error deleting image', error: String(error) },
      { status: 500 }
    );
  }
}
