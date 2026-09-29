import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env.js';

const s3 = new S3Client({
  region: env.S3_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY || '',
    secretAccessKey: env.S3_SECRET_KEY || '',
  },
});

export const UploadService = {
  async getPresignedUrl(fileName: string, contentType: string) {
    const key = `uploads/${Date.now()}-${fileName.replace(/\s+/g, '-')}`;
    
    const command = new PutObjectCommand({
      Bucket: env.S3_BUCKET || 'aurazone-uploads',
      Key: key,
      ContentType: contentType,
      // We could add ContentLength logic here if using specific presign mechanisms,
      // but enforcing size in the UI and checking it post-upload is standard for presigned URLs.
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    
    return {
      uploadUrl: url,
      publicUrl: `https://${env.S3_BUCKET}.s3.${env.S3_REGION}.amazonaws.com/${key}`,
    };
  }
};