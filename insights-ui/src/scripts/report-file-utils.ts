import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
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
const s3Client = new S3Client({ region: REGION });

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

export async function readFileFromS3(key: string): Promise<string | undefined> {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
  };

  try {
    const data = await s3Client.send(new GetObjectCommand(params));
    const transformToString = data.Body?.transformToString();

    const fileData = await transformToString;

    return fileData;
  } catch (error) {}
}

export async function getJsonFromS3<T>(key: string): Promise<T | undefined> {
  const fileData = await readFileFromS3(key);

  return fileData ? (JSON.parse(fileData) as T) : undefined;
}
