import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export const UploadService = {
  async getPresignedUrl(fileName: string, contentType: string) {
    const key = `uploads/${Date.now()}-${fileName.replace(/\s+/g, '-')}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || 'aurazone-uploads',
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    
    return {
      uploadUrl: url,
      // Construct the final public URL based on bucket and region
      publicUrl: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    };
  }
};