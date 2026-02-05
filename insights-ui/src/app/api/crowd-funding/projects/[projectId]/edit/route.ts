import { GetObjectCommand } from '@aws-sdk/client-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';
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

async function getHandler(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }): Promise<any> {
  const { projectId } = await params;

  const key = `${InsightsConstants.CROWDFUND_ANALYSIS_PREFIX}/${projectId}/agent-status.json`;

  // Fetch the `agent-status.json` file from S3
  const command = new GetObjectCommand({
    Bucket: InsightsConstants.S3_BUCKET_NAME,
    Key: key,
  });
  const response = await s3Client.send(command);
  // Read the content of the file
  const body = response.Body instanceof Readable ? await streamToString(response.Body) : await new Response(response.Body as ReadableStream).text();
  const projectDetails = JSON.parse(body);

  return { projectDetails: projectDetails };
}

export const GET = withErrorHandlingV2(getHandler);
