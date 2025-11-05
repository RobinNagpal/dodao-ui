import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { saveCachedScore } from '@/utils/analysis-reports/save-report-utils';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<{ success: boolean }> {
  const { ticker } = await params;

  // Use the utility function to save cached score and about report
  await saveCachedScore(ticker);

  return {
    success: true,
  };
}

export const POST = withErrorHandlingV2<{ success: boolean }>(postHandler);
