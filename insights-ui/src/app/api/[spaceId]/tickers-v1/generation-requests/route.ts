import { withAdminOrToken } from '@/app/api/helpers/withAdminOrToken';
import { withLoggedInAdmin } from '@/app/api/helpers/withLoggedInAdmin';
import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { LLMProvider } from '@/types/llmConstants';
import { GenerationRequestStatus, ReportType } from '@/types/ticker-typesv1';
import { upsertGenerationRequest } from '@/utils/analysis-reports/generation-request-utils';
import { calculatePendingSteps } from '@/utils/analysis-reports/report-steps-statuses';
import { AllExchanges } from '@/utils/countryExchangeUtils';
import { TickerV1GenerationRequest } from '@prisma/client';
import { NextRequest } from 'next/server';

export interface TickerIdentifier {
  symbol: string;
  exchange: AllExchanges;
}

export interface GenerationRequestPayload {
  ticker: TickerIdentifier;
  regenerateCompetition: boolean;
  regenerateFinancialAnalysis: boolean;
  regenerateBusinessAndMoat: boolean;
  regeneratePastPerformance: boolean;
  regenerateFutureGrowth: boolean;
  regenerateFairValue: boolean;
  regenerateManagementTeam: boolean;
  regenerateStability: boolean;
  regenerateFinalSummary: boolean;
  /** Optional LLM provider override chosen in the report-generation UI. */
  llmProvider?: LLMProvider;
  /** Optional provider-specific model id chosen in the report-generation UI. */
  llmModel?: string;
}

export interface TickerV1GenerationRequestWithTicker extends TickerV1GenerationRequest {
  ticker: {
    symbol: string;
    exchange: string;
    name: string;
    // Per-category + total scores, so the admin UI can apply the same score
    // filters the public /stocks pages use — client-side, with no refetch.
    cachedScoreEntry: {
      businessAndMoatScore: number;
      financialStatementAnalysisScore: number;
      pastPerformanceScore: number;
      futureGrowthScore: number;
      fairValueScore: number;
      finalScore: number;
    } | null;
    financialInfo: {
      marketCap: number | null;
      pe: number | null;
      dividendYield: number | null;
    } | null;
    /** Forward PE lifted out of the scraper summary JSON (it has no column of its own). */
    forwardPe: number | null;
    industry: {
      name: string;
      industryKey: string;
    };

    subIndustry: {
      name: string;
      subIndustryKey: string;
    };
  };
  pendingSteps?: ReportType[];
}

export interface GenerationRequestsResponse {
  inProgress: TickerV1GenerationRequestWithTicker[];
  failed: TickerV1GenerationRequestWithTicker[];
  notStarted: TickerV1GenerationRequestWithTicker[];
  completed: TickerV1GenerationRequestWithTicker[];
  counts: {
    inProgress: number;
    failed: number;
    notStarted: number;
    completed: number;
  };
  pagination: {
    inProgress: { skip: number; take: number };
    failed: { skip: number; take: number };
    notStarted: { skip: number; take: number };
    completed: { skip: number; take: number };
  };
}

/** Upper bound on a single bucket's page size, so a hand-crafted `take` can't pull the whole table. */
const MAX_TAKE = 1000;

/** Forward PE only exists inside the scraper summary JSON — pull it out as a plain number. */
function extractForwardPe(summary: unknown): number | null {
  const value = (summary as { forwardPE?: unknown } | null | undefined)?.forwardPE;
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

async function getRequests(status: GenerationRequestStatus, skip: number = 0, take: number = 15): Promise<TickerV1GenerationRequestWithTicker[]> {
  // A bucket the caller opted out of (take=0) costs nothing.
  if (take <= 0) return [];

  const requests = await prisma.tickerV1GenerationRequest.findMany({
    where: {
      status: status,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    skip,
    take,
    include: {
      ticker: {
        select: {
          symbol: true,
          exchange: true,
          name: true,
          cachedScoreEntry: {
            select: {
              businessAndMoatScore: true,
              financialStatementAnalysisScore: true,
              pastPerformanceScore: true,
              futureGrowthScore: true,
              fairValueScore: true,
              finalScore: true,
            },
          },
          financialInfo: {
            select: {
              marketCap: true,
              pe: true,
              dividendYield: true,
            },
          },
          stockAnalyzerScrapperInfo: {
            select: {
              summary: true,
            },
          },
          industry: {
            select: {
              name: true,
              industryKey: true,
            },
          },
          subIndustry: {
            select: {
              name: true,
              subIndustryKey: true,
            },
          },
        },
      },
    },
  });

  // Add pending steps to each request, and flatten the scraper summary down to
  // the single number the filters need (the raw JSON is far too big to ship).
  return requests.map(({ ticker, ...request }) => {
    const { stockAnalyzerScrapperInfo, ...tickerFields } = ticker;
    return {
      ...request,
      ticker: {
        ...tickerFields,
        forwardPe: extractForwardPe(stockAnalyzerScrapperInfo?.summary),
      },
      pendingSteps: calculatePendingSteps(request),
    };
  });
}

async function getHandler(
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload,
  { params }: { params: Promise<{ spaceId: string }> }
): Promise<GenerationRequestsResponse> {
  // Parse pagination parameters from URL
  const url = new URL(req.url);

  // Get pagination parameters for each status. `take` is clamped to [0, MAX_TAKE];
  // 0 means "skip this bucket entirely" (used by the client-side-filtered tabs).
  const parseSkip = (key: string): number => {
    const parsed = parseInt(url.searchParams.get(key) || '0', 10);
    return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
  };
  const parseTake = (key: string): number => {
    const parsed = parseInt(url.searchParams.get(key) || '15', 10);
    return Number.isNaN(parsed) ? 15 : Math.min(MAX_TAKE, Math.max(0, parsed));
  };

  const inProgressSkip = parseSkip('inProgressSkip');
  const inProgressTake = parseTake('inProgressTake');

  const failedSkip = parseSkip('failedSkip');
  const failedTake = parseTake('failedTake');

  const notStartedSkip = parseSkip('notStartedSkip');
  const notStartedTake = parseTake('notStartedTake');

  const completedSkip = parseSkip('completedSkip');
  const completedTake = parseTake('completedTake');

  // Get in progress requests
  const inProgressStatus = GenerationRequestStatus.InProgress;
  const inProgressRequests = await getRequests(inProgressStatus, inProgressSkip, inProgressTake);

  // Get the failed requests
  const failedStatus = GenerationRequestStatus.Failed;
  const failedRequests = await getRequests(failedStatus, failedSkip, failedTake);

  // Get the not started requests
  const notStartedStatus = GenerationRequestStatus.NotStarted;
  const notStartedRequests = await getRequests(notStartedStatus, notStartedSkip, notStartedTake);

  // Get the completed requests
  const completedStatus = GenerationRequestStatus.Completed;
  const completedRequests = await getRequests(completedStatus, completedSkip, completedTake);

  // Get total counts for each status
  const inProgressCount = await prisma.tickerV1GenerationRequest.count({
    where: { status: inProgressStatus },
  });

  const failedCount = await prisma.tickerV1GenerationRequest.count({
    where: { status: failedStatus },
  });

  const notStartedCount = await prisma.tickerV1GenerationRequest.count({
    where: { status: notStartedStatus },
  });

  const completedCount = await prisma.tickerV1GenerationRequest.count({
    where: { status: completedStatus },
  });

  return {
    inProgress: inProgressRequests,
    failed: failedRequests,
    notStarted: notStartedRequests,
    completed: completedRequests,
    counts: {
      inProgress: inProgressCount,
      failed: failedCount,
      notStarted: notStartedCount,
      completed: completedCount,
    },
    pagination: {
      inProgress: { skip: inProgressSkip, take: inProgressTake },
      failed: { skip: failedSkip, take: failedTake },
      notStarted: { skip: notStartedSkip, take: notStartedTake },
      completed: { skip: completedSkip, take: completedTake },
    },
  };
}

async function postHandler(
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload | null,
  { params }: { params: Promise<{ spaceId: string }> }
): Promise<TickerV1GenerationRequest[]> {
  const { spaceId } = await params;
  const payloads = (await req.json()) as GenerationRequestPayload[];

  if (!Array.isArray(payloads) || payloads.length === 0) {
    throw new Error('Request body must be a non-empty array of generation requests');
  }

  const results: TickerV1GenerationRequest[] = [];

  // Process each request in the array
  for (const payload of payloads) {
    const { ticker, ...regenerateOptions } = payload;

    if (!ticker || !ticker.symbol || !ticker.exchange) {
      throw new Error('Ticker with symbol and exchange is required for each generation request');
    }

    // Find the ticker to get its ID
    const whereClause = {
      spaceId,
      symbol: ticker.symbol.toUpperCase(),
      exchange: ticker.exchange.toUpperCase(),
    };

    const tickerRecord = await prisma.tickerV1.findFirstOrThrow({
      where: whereClause,
      select: {
        id: true,
      },
    });

    // Create the NotStarted request (or OR the sections into an existing one).
    // Shared with the nightly auto-generation job via upsertGenerationRequest.
    const result = await upsertGenerationRequest({
      tickerId: tickerRecord.id,
      flags: {
        regenerateCompetition: !!regenerateOptions.regenerateCompetition,
        regenerateFinancialAnalysis: !!regenerateOptions.regenerateFinancialAnalysis,
        regenerateBusinessAndMoat: !!regenerateOptions.regenerateBusinessAndMoat,
        regeneratePastPerformance: !!regenerateOptions.regeneratePastPerformance,
        regenerateFutureGrowth: !!regenerateOptions.regenerateFutureGrowth,
        regenerateFairValue: !!regenerateOptions.regenerateFairValue,
        regenerateManagementTeam: !!regenerateOptions.regenerateManagementTeam,
        regenerateStability: !!regenerateOptions.regenerateStability,
        regenerateFinalSummary: !!regenerateOptions.regenerateFinalSummary,
      },
      llmProvider: payload.llmProvider ?? null,
      llmModel: payload.llmModel ?? null,
      // Admin path: not auto-generated (default false).
    });

    results.push(result);
  }

  return results;
}

export const POST = withAdminOrToken<TickerV1GenerationRequest[]>(postHandler);
export const GET = withLoggedInAdmin<GenerationRequestsResponse>(getHandler);
