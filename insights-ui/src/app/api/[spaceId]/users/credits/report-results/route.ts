import { prisma } from '@/prisma';
import { ReportResultsResponse } from '@/types/credits';
import { getReportHrefs } from '@/utils/credits/report-target';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { ReportSpendStatus } from '@prisma/client';
import { NextRequest } from 'next/server';

// POST /api/[spaceId]/users/credits/report-results — returns the user's paid
// regenerations that finished (or failed) since they last looked, and marks
// them as seen so each result is announced once. POST because it changes state.
async function postHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<ReportResultsResponse> {
  const { userId } = userContext;

  const finished = await prisma.reportSpend.findMany({
    where: { userId, settledAt: { not: null }, resultSeenAt: null },
    orderBy: { settledAt: 'desc' },
    take: 10,
  });
  if (finished.length === 0) {
    return { results: [] };
  }

  const reportHrefs = await getReportHrefs(finished);
  // Marked seen only after the reads above succeeded, so a failure here can't
  // swallow a result before the user is shown it.
  await prisma.reportSpend.updateMany({
    where: { id: { in: finished.map((spend) => spend.id) }, resultSeenAt: null },
    data: { resultSeenAt: new Date() },
  });

  return {
    results: finished.map((spend) => ({
      id: spend.id,
      reportLabel: spend.reportLabel,
      reportHref: reportHrefs.get(spend.reportTargetId) ?? null,
      succeeded: spend.status === ReportSpendStatus.Completed,
    })),
  };
}

export const POST = withLoggedInUser<ReportResultsResponse>(postHandler);
