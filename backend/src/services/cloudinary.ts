import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import crypto from 'crypto';

// Initialize Cloudinary with environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isConfigured = Boolean(
  cloudName &&
  apiKey &&
  apiSecret &&
  !cloudName.includes('placeholder') &&
  !apiKey.includes('placeholder')
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export interface UploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width?: number;
  height?: number;
  bytes?: number;
}

export function isCloudinaryConfigured(): boolean {
  return isConfigured;
}

/**
 * Uploads an image buffer directly to Cloudinary CDN.
 * Falls back gracefully to a simulated CDN URL in local dev / test suites if credentials are unset.
 */
export async function uploadImageBuffer(
  buffer: Buffer,
  originalFilename = 'garment.jpg',
  folder = 'waak_occasionwear/products'
): Promise<UploadResult> {
  if (isConfigured) {
    return new Promise((resolve, reject) => {
      const sanitizedName = originalFilename
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '_')
        .replace(/\.[^/.]+$/, '');
      const uniqueSuffix = crypto.randomBytes(4).toString('hex');
      const publicId = `${sanitizedName}_${Date.now()}_${uniqueSuffix}`;

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: 'image',
          allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
            { width: 1600, crop: 'limit' }
          ],
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            return reject(error || new Error('Cloudinary stream upload failed'));
          }
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
          });
        }
      );

      uploadStream.end(buffer);
    });
  }

  // Graceful local test / offline development fallback
  const hash = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 10);
  const simulatedUrl = `https://res.cloudinary.com/waak-atelier/image/upload/v${Date.now()}/${folder}/garment_${hash}.webp`;
  
  return {
    secure_url: simulatedUrl,
    public_id: `${folder}/garment_${hash}`,
    format: 'webp',
    width: 1200,
    height: 1500,
    bytes: buffer.length,
  };
}

/**
 * Removes an image from Cloudinary by public ID.
 */
export async function deleteCloudinaryImage(publicId: string): Promise<boolean> {
  if (!isConfigured || !publicId) return true;
  try {
    const res = await cloudinary.uploader.destroy(publicId);
    return res.result === 'ok';
  } catch (err) {
    console.warn(`Failed to delete Cloudinary asset ${publicId}:`, err);
    return false;
  }
}
