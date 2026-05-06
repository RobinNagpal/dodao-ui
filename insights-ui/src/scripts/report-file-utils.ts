import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import fs from 'fs';

export const reportsOutDir = 'reports-out';

export function addDirectoryIfNotPresent(dirPath: string) {
  // Create the directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

const REGION = process.env.AWS_REGION || 'us-east-1';
const BUCKET_NAME = 'dodao-ai-insights-agent';

const AWS_ACCESS_KEY_ID = process.env.KOALA_AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.KOALA_AWS_SECRET_ACCESS_KEY;

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
  throw new Error('KOALA_AWS_ACCESS_KEY_ID and KOALA_AWS_SECRET_ACCESS_KEY must be set in the environment');
}

const s3Client = new S3Client({ region: REGION, credentials: { accessKeyId: AWS_ACCESS_KEY_ID!, secretAccessKey: AWS_SECRET_ACCESS_KEY! } });

export async function uploadFileToS3(data: Uint8Array, key: string, contentType = 'image/png'): Promise<string> {
  console.log(`Uploading file to S3: ${key}`);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: data,
      ContentType: contentType,
      ACL: 'public-read',
    })
  );
  console.log(`Uploaded file to S3: ${key}`);
  return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
}
