import { prisma } from '@/prisma';
import { CREDITS_PER_REPORT, LastRegeneration, ReportGenerationStatusResponse, ReportTargetRequest, TriggerReportGenerationResponse } from '@/types/credits';
import { getUserCredits, spendCreditForReport } from '@/utils/credits/credit-service';
import { parseReportTargetRequest, ResolvedReportTarget, resolveReportTarget } from '@/utils/credits/report-target';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { ReportSpendStatus } from '@prisma/client';
import { NextRequest } from 'next/server';

/**
 * Everything the regenerate UI needs about this user and this report. Only the
 * user's own paid runs count: admin and nightly runs are invisible to users.
 */
async function getStatus(userId: string, target: ResolvedReportTarget): Promise<ReportGenerationStatusResponse> {
  const [{ credits }, openSpend, lastSettledSpend] = await Promise.all([
    getUserCredits(userId),
    prisma.reportSpend.findFirst({ where: { userId, reportTargetId: target.id, status: ReportSpendStatus.InProgress }, select: { id: true } }),
    prisma.reportSpend.findFirst({
      where: { userId, reportTargetId: target.id, settledAt: { not: null } },
      orderBy: { settledAt: 'desc' },
      select: { settledAt: true, status: true },
    }),
  ]);

  const lastRegeneration: LastRegeneration | null = lastSettledSpend?.settledAt
    ? { finishedAt: lastSettledSpend.settledAt.toISOString(), succeeded: lastSettledSpend.status === ReportSpendStatus.Completed }
    : null;

  return {
    credits,
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

// POST /api/[spaceId]/users/report-generation — reserves one credit (taken in
// Stripe only once the report is generated) and queues
// a full regeneration of the report, even if an admin or nightly run is already
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
      symbol: target.symbol,
      exchange: target.exchange,
      reportLabel: target.label,
    },
    target
  );

  return { ...(await getStatus(userContext.userId, target)), outcome: spend.outcome };
}

export const GET = withLoggedInUser<ReportGenerationStatusResponse>(getHandler);
export const POST = withLoggedInUser<TriggerReportGenerationResponse>(postHandler);
