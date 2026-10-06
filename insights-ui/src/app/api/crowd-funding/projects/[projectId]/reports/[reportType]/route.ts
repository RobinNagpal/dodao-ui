import { NextRequest } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { notFoundError } from '@dodao/web-core/api/errors/notFoundError';
import { getObjectFromS3Optional } from '@/lib/koalagainsS3Utils';
import { InsightsConstants } from '@/util/insights-constants';
import { assertValidCrowdFundingApiParams } from '@/utils/crowd-funding-param-utils';

async function getHandler(req: NextRequest, { params }: { params: Promise<{ projectId: string; reportType: string }> }): Promise<any> {
  const { projectId, reportType } = await params;
  assertValidCrowdFundingApiParams({ projectId, reportType });

  // Construct the S3 object key based on the projectId and reportType
  const key = `${InsightsConstants.CROWDFUND_ANALYSIS_PREFIX}/${projectId}/${reportType}.md`;

  // Fetch the Markdown file from S3 (null when the report has not been generated)
  const markdownContent = await getObjectFromS3Optional(key);
  if (markdownContent === null) {
    throw notFoundError(`Report ${reportType} not found for project ${projectId}`);
  }

  return { reportDetail: markdownContent };
}

export const GET = withErrorHandlingV2(getHandler);
