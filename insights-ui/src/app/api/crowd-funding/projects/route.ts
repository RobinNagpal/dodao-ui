import { InsightsConstants } from './../../../../util/insights-constants';
import { ListObjectsV2Command, ListObjectsV2CommandInput, ListObjectsV2CommandOutput, S3Client } from '@aws-sdk/client-s3';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

const s3Client = new S3Client({
  region: process.env.DEFAULT_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function getHandler(): Promise<{ projectIds: string[] }> {
  // First call to fetch folders directly under `crowd-fund-analysis/`
  const input: ListObjectsV2CommandInput = {
    Bucket: InsightsConstants.S3_BUCKET_NAME,
    Prefix: `${InsightsConstants.CROWDFUND_ANALYSIS_PREFIX}/`, // Ensure the correct prefix
    Delimiter: '/', // Group by folders
  };

  const command = new ListObjectsV2Command(input);
  const response: ListObjectsV2CommandOutput = await s3Client.send(command);

  const projectDirectories: string[] =
    response.CommonPrefixes?.map((commonPrefix) => {
      if (commonPrefix.Prefix) {
        // Extract folder name after `crowd-fund-analysis/`
        return commonPrefix.Prefix.replace(`${InsightsConstants.CROWDFUND_ANALYSIS_PREFIX}/`, '').replace('/', '');
      }
      return null;
    }).filter((prefix): prefix is string => !!prefix) || [];

  return { projectIds: projectDirectories };
}

export const GET = withErrorHandlingV2<{ projectIds: string[] }>(getHandler);
