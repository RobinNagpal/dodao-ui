import { InsightsConstants } from './../../../../util/insights-constants';
import { ListObjectsV2Command, ListObjectsV2CommandInput, ListObjectsV2CommandOutput, S3Client } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

const s3Client = new S3Client({ region: 'us-east-1' });

async function getHandler(): Promise<{ projectIds: string[] }> {
  const input: ListObjectsV2CommandInput = {
    Bucket: InsightsConstants.S3_BUCKET_NAME,
    Prefix: InsightsConstants.CROWDFUND_ANALYSIS_PREFIX,
    Delimiter: 'crowd-fund-analysis/', // Ensures only folders are returned
  };

  const command = new ListObjectsV2Command(input);
  const response: ListObjectsV2CommandOutput = await s3Client.send(command);
  const projectDirectories: string[] = response.Contents?.map((content) => content.Key?.split('/')[1] || '') || [];

  return { projectIds: projectDirectories };
}

export const GET = withErrorHandlingV2<{ projectIds: string[] }>(getHandler);
