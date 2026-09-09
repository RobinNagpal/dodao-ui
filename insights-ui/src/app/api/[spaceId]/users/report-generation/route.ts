import { prisma } from '@/prisma';
import { CREDITS_PER_REPORT, ReportGenerationStatusResponse, ReportTargetRequest, TriggerReportGenerationResponse } from '@/types/credits';
import { spendCreditForReport } from '@/utils/credits/credit-service';
import { parseReportTargetRequest, ResolvedReportTarget, resolveReportTarget } from '@/utils/credits/report-target';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';

function toStatus(target: ResolvedReportTarget, credits: number, generationInProgress: boolean): ReportGenerationStatusResponse {
  return {
    credits,
    creditsPerReport: CREDITS_PER_REPORT,
    lastReportGeneratedAt: target.lastReportGeneratedAt?.toISOString() ?? null,
    generationInProgress,
  };
}

async function getCredits(userId: string): Promise<number> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { credits: true } });
  return user.credits;
}

// GET /api/[spaceId]/users/report-generation?kind=Stock&symbol=AAPL&exchange=NASDAQ
// Everything the regenerate UI needs in one round trip: the user's balance, the
// date shown on the page, and whether a generation is already running.
async function getHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<ReportGenerationStatusResponse> {
  const params = req.nextUrl.searchParams;
  const request = parseReportTargetRequest(params.get('kind'), params.get('symbol'), params.get('exchange'));

  const [target, credits] = await Promise.all([resolveReportTarget(request), getCredits(userContext.userId)]);

  return toStatus(target, credits, target.generationInProgress);
}

// POST /api/[spaceId]/users/report-generation — spends one credit and queues a
// full regeneration of the report.
//
// "Not enough credits" and "already regenerating" are normal outcomes, not
// errors: they come back as data so the UI can offer the next step instead of
// showing a failure.
async function postHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<TriggerReportGenerationResponse> {
  const body = (await req.json()) as ReportTargetRequest;
  const request = parseReportTargetRequest(body.kind, body.symbol, body.exchange);
  const target = await resolveReportTarget(request);

  // A queued or running generation already produces a fresh report, so charging
  // for a second one would take a credit for work the user is about to get.
  if (target.generationInProgress) {
    const credits = await getCredits(userContext.userId);
    return { ...toStatus(target, credits, true), outcome: 'AlreadyInProgress' };
  }

  const spend = await spendCreditForReport(
    {
      userId: userContext.userId,
      reportKind: target.kind,
      reportTargetId: target.id,
      reportLabel: target.label,
    },
    target.createGenerationRequest
  );

  if (!spend) {
    const credits = await getCredits(userContext.userId);
    return { ...toStatus(target, credits, false), outcome: 'InsufficientCredits' };
  }

  return { ...toStatus(target, spend.credits, true), outcome: 'Started' };
}

export const GET = withLoggedInUser<ReportGenerationStatusResponse>(getHandler);
export const POST = withLoggedInUser<TriggerReportGenerationResponse>(postHandler);
