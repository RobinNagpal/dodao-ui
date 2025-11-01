import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import fs from 'fs';
import { revalidateTariffReport } from '@/utils/tariff-report-cache-utils';
import { readLastModifiedDatesFromS3, writeLastModifiedDatesToS3 } from './industry-tariff-reports/tariff-report-read-write';
import { TariffIndustryId } from './industry-tariff-reports/tariff-industries';

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

export async function uploadJsonTariffFileToS3(data: Uint8Array, key: string, industry: TariffIndustryId): Promise<string> {
  console.log(`Uploading tariff JSON file to S3: ${key}`);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: data,
      ContentType: 'application/json',
      ACL: 'public-read',
    })
  );
  console.log(`Uploaded tariff JSON file to S3: ${key}`);

  // Update the centralized last modified dates file
  console.log(`Updating centralized last modified dates for ${industry}...`);
  const existingLastModifiedDates = (await readLastModifiedDatesFromS3()) || {};
  existingLastModifiedDates[industry] = new Date().toISOString();
  await writeLastModifiedDatesToS3(existingLastModifiedDates);
  console.log(`Updated centralized last modified dates for ${industry}`);

  // Revalidate cache for this industry
  console.log(`Revalidating cache for industry: ${industry}`);
  revalidateTariffReport(industry);

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
  } catch (error) {
    console.error(`Got error reading file from S3 for key: ${key}`);
    console.error(error);
    throw error;
  }
}

export async function readFileAndLastModifiedFromS3(key: string): Promise<{ fileData?: string; lastModified?: string } | undefined> {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
  };

  try {
    const data = await s3Client.send(new GetObjectCommand(params));
    const transformToString = data.Body?.transformToString();

    const fileData = await transformToString;

    return { fileData: fileData, lastModified: data.LastModified?.toISOString() };
  } catch (error) {}
}

export async function getJsonFromS3<T>(key: string): Promise<T | undefined> {
  const fileData = await readFileFromS3(key);

  return fileData ? (JSON.parse(fileData) as T) : undefined;
}

export async function getJsonWithLastModifiedFromS3<T>(key: string): Promise<{ json: T; lastModified: string } | undefined> {
  const data = await readFileAndLastModifiedFromS3(key);

  return data?.fileData && data?.lastModified ? { json: JSON.parse(data.fileData) as T, lastModified: data.lastModified } : undefined;
}

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
