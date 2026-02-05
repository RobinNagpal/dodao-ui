import { GetObjectCommand } from '@aws-sdk/client-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { NextRequest } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { InsightsConstants } from '@/util/insights-constants';
import { Readable } from 'stream';

const s3Client = new S3Client({
  region: process.env.DEFAULT_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function streamToString(stream: Readable): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf-8');
}

async function getHandler(req: NextRequest, { params }: { params: Promise<{ projectId: string; reportType: string }> }): Promise<any> {
  const { projectId, reportType } = await params;

  // Construct the S3 object key based on the projectId and reportType
  const key = `${InsightsConstants.CROWDFUND_ANALYSIS_PREFIX}/${projectId}/${reportType}.md`;

  // Fetch the Markdown file from S3
  const command = new GetObjectCommand({
    Bucket: InsightsConstants.S3_BUCKET_NAME,
    Key: key,
  });
  const response = await s3Client.send(command);

  // Convert the S3 object stream to a string
  const markdownContent = response.Body instanceof Readable ? await streamToString(response.Body) : await new Response(response.Body as ReadableStream).text();

  return { reportDetail: markdownContent };
}

export const GET = withErrorHandlingV2(getHandler);
