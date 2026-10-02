import { prisma } from '@/prisma';
import { ReportResultsResponse } from '@/types/credits';
import { getReportHrefs } from '@/utils/credits/report-target';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { CreditTransactionType } from '@prisma/client';
import { NextRequest } from 'next/server';

// POST /api/[spaceId]/users/credits/report-results — returns the user's paid
// regenerations that finished (or failed) since they last looked, and marks
// them as seen so each result is announced once. POST because it changes state.
async function postHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<ReportResultsResponse> {
  const { userId } = userContext;

  const finished = await prisma.creditTransaction.findMany({
    where: { userId, type: CreditTransactionType.ReportSpend, settledAt: { not: null }, resultSeenAt: null },
    orderBy: { settledAt: 'desc' },
    take: 10,
  });
  if (finished.length === 0) {
    return { results: [] };
  }

  const requestIds = finished.map((spend) => spend.generationRequestId).filter((id): id is string => !!id);
  const [refunds, reportHrefs] = await Promise.all([
    prisma.creditTransaction.findMany({
      where: { userId, type: CreditTransactionType.Refund, generationRequestId: { in: requestIds } },
      select: { generationRequestId: true },
    }),
    getReportHrefs(finished),
    prisma.creditTransaction.updateMany({
      where: { id: { in: finished.map((spend) => spend.id) } },
      data: { resultSeenAt: new Date() },
    }),
  ]);
  const refundedRequestIds = new Set(refunds.map((refund) => refund.generationRequestId));

  return {
    results: finished.map((spend) => ({
      id: spend.id,
      reportLabel: spend.reportLabel ?? 'Your report',
      reportHref: spend.reportTargetId ? reportHrefs.get(spend.reportTargetId) ?? null : null,
      succeeded: !refundedRequestIds.has(spend.generationRequestId),
    })),
  };
}

export const POST = withLoggedInUser<ReportResultsResponse>(postHandler);
