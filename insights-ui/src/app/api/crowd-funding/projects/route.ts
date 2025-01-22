import { InsightsConstants } from '@/util/insights-constants';
import { ListObjectsV2Command, ListObjectsV2CommandInput, ListObjectsV2CommandOutput, S3Client } from '@aws-sdk/client-s3';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

// Initialize the S3 client
const s3Client = new S3Client({ region: 'us-east-1' });

async function getHandler(): Promise<{ projectIds: string[] }> {
  const input: ListObjectsV2CommandInput = {
    Bucket: InsightsConstants.S3_BUCKET_NAME,
    Prefix: InsightsConstants.CROWDFUND_ANALYSIS_PREFIX,
    Delimiter: '/', // Ensures only folders are returned
  };

  const command = new ListObjectsV2Command(input);
  const response: ListObjectsV2CommandOutput = await s3Client.send(command);

  const directories: string[] = response.CommonPrefixes?.map((commonPrefix) => commonPrefix.Prefix || '') || [];

  return { projectIds: directories };
}

export const GET = withErrorHandlingV2<{ projectIds: string[] }>(getHandler);
