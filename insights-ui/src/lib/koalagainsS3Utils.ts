import { OutputType } from '@/types/public-equity/criteria-types';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { Readable } from 'stream';

export const BUCKET_NAME = process.env.S3_BUCKET_NAME!;
const REGION = process.env.AWS_DEFAULT_REGION || 'us-east-1';

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function streamToString(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
}

export async function uploadToS3(content: string, fullKey: string, contentType: string = 'text/plain'): Promise<string> {
  console.log(`Uploading to S3 at https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${fullKey} with content type ${contentType}`);
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fullKey,
      Body: content,
      ContentType: contentType,
      ACL: 'public-read',
    })
  );
  return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${fullKey}`;
}

export async function getObjectFromS3(s3Key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  });
  const response = await s3Client.send(command);
  return await streamToString(response.Body as Readable);
}

export async function getObjectFromS3Optional(s3Key: string): Promise<string | null> {
  try {
    return await getObjectFromS3(s3Key);
  } catch (err: any) {
    if (err.name === 'NoSuchKey') return null;
    throw err;
  }
}

export async function uploadToS3PublicEquities(content: string, s3Key: string, contentType: string = 'text/plain'): Promise<string> {
  const fullKey = `public-equities/US/${s3Key}`;
  console.log(`Uploading to S3 at https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${fullKey} with content type ${contentType}`);
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fullKey,
      Body: content,
      ContentType: contentType,
      ACL: 'public-read',
    })
  );
  return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${fullKey}`;
}

export function getCriteriaFileKey(sectorName: string, industryGroupName: string): string {
  return `public-equities/US/gics/${slugify(sectorName)}/${slugify(industryGroupName)}/custom-criteria.json`;
}

export function getTickerFileKey(ticker: string): string {
  return `public-equities/US/tickers/${ticker}/latest-10q-report.json`;
}

export function getCriterionReportKey(ticker: string, criterionKey: string, reportKey: string, reportType: OutputType): string {
  if (reportType === 'Text') {
    return `public-equities/US/tickers/${ticker}/criterion-reports/${criterionKey}/${reportKey}.md`;
  } else {
    return `public-equities/US/tickers/${ticker}/criterion-reports/${criterionKey}/${reportKey}.json`;
  }
}

export function getCriterionPerformanceChecklistKey(ticker: string, criterionKey: string): string {
  return `public-equities/US/tickers/${ticker}/criterion-reports/${criterionKey}/performance_checklist.json`;
}
