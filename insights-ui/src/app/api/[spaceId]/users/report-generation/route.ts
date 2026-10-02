import { prisma } from '@/prisma';
import { CREDITS_PER_REPORT, LastRegeneration, ReportGenerationStatusResponse, ReportTargetRequest, TriggerReportGenerationResponse } from '@/types/credits';
import { spendCreditForReport } from '@/utils/credits/credit-service';
import { parseReportTargetRequest, ResolvedReportTarget, resolveReportTarget } from '@/utils/credits/report-target';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { CreditTransactionType } from '@prisma/client';
import { NextRequest } from 'next/server';

/**
 * Everything the regenerate UI needs about this user and this report. Only the
 * user's own paid runs count: admin and nightly runs are invisible to users.
 */
async function getStatus(userId: string, target: ResolvedReportTarget): Promise<ReportGenerationStatusResponse> {
  const spendWhere = { userId, reportTargetId: target.id, type: CreditTransactionType.ReportSpend };

  const [user, openSpend, lastSettledSpend] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { credits: true } }),
    prisma.creditTransaction.findFirst({ where: { ...spendWhere, settledAt: null }, select: { id: true } }),
    prisma.creditTransaction.findFirst({
      where: { ...spendWhere, settledAt: { not: null } },
      orderBy: { settledAt: 'desc' },
      select: { settledAt: true, generationRequestId: true },
    }),
  ]);

  let lastRegeneration: LastRegeneration | null = null;
  if (lastSettledSpend?.settledAt) {
    // A failed run is settled by writing a Refund row with the same request id.
    const refund = await prisma.creditTransaction.findFirst({
      where: { userId, type: CreditTransactionType.Refund, generationRequestId: lastSettledSpend.generationRequestId },
      select: { id: true },
    });
    lastRegeneration = { finishedAt: lastSettledSpend.settledAt.toISOString(), succeeded: !refund };
  }

  return {
    credits: user.credits,
    creditsPerReport: CREDITS_PER_REPORT,
    lastReportGeneratedAt: target.lastReportGeneratedAt?.toISOString() ?? null,
    generationInProgress: !!openSpend,
    lastRegeneration,
  };
}

// GET /api/[spaceId]/users/report-generation?kind=Stock&symbol=AAPL&exchange=NASDAQ
// The user's balance, the date shown on the page, and their own regeneration
// history for this report, in one round trip.
async function getHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<ReportGenerationStatusResponse> {
  const params = req.nextUrl.searchParams;
  const request = parseReportTargetRequest(params.get('kind'), params.get('symbol'), params.get('exchange'));
  const target = await resolveReportTarget(request);
  return getStatus(userContext.userId, target);
}

// POST /api/[spaceId]/users/report-generation — spends one credit and queues a
// full regeneration of the report, even if an admin or nightly run is already
// going.
//
// "Not enough credits" and "your run is already going" are normal outcomes, not
// errors: they come back as data so the UI can offer the next step instead of
// showing a failure.
async function postHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<TriggerReportGenerationResponse> {
  const body = (await req.json()) as ReportTargetRequest;
  const request = parseReportTargetRequest(body.kind, body.symbol, body.exchange);
  const target = await resolveReportTarget(request);

  const spend = await spendCreditForReport(
    {
      userId: userContext.userId,
      reportKind: target.kind,
      reportTargetId: target.id,
      reportLabel: target.label,
    },
    target
  );

  return { ...(await getStatus(userContext.userId, target)), outcome: spend.outcome };
}

export const GET = withLoggedInUser<ReportGenerationStatusResponse>(getHandler);
export const POST = withLoggedInUser<TriggerReportGenerationResponse>(postHandler);
