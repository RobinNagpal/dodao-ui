import { ProjectDetails } from '@/types/project/project';
import { InsightsConstants } from '@/util/insights-constants';
import { getObjectFromS3Optional } from '@/lib/koalagainsS3Utils';
import { notFoundError } from '@dodao/web-core/api/errors/notFoundError';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }): Promise<{ projectDetails: ProjectDetails }> {
  const { projectId } = await params;

  const key = `${InsightsConstants.CROWDFUND_ANALYSIS_PREFIX}/${projectId}/agent-status.json`;

  // Fetch the `agent-status.json` file from S3
  const body = await getObjectFromS3Optional(key);
  if (body === null) {
    throw notFoundError(`Project ${projectId} not found`);
  }
  const projectDetails = JSON.parse(body);

  return {
    projectDetails: projectDetails,
  };
}

export const GET = withErrorHandlingV2<{ projectDetails: ProjectDetails }>(getHandler);
