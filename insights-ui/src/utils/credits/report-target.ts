import { prisma } from '@/prisma';
import { ReportTargetRequest } from '@/types/credits';
import { EtfGenerationRequestStatus } from '@/types/etf/etf-analysis-types';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { GenerationRequestStatus } from '@/types/ticker-typesv1';
import { ALL_SECTIONS_REGENERATE_FLAGS } from '@/utils/analysis-reports/generation-request-utils';
import { ALL_ETF_SECTIONS_REGENERATE_FLAGS } from '@/utils/etf-analysis-reports/etf-generation-request-utils';
import { CreditReportKind, Prisma } from '@prisma/client';

/**
 * A stock or ETF resolved from the `(kind, symbol, exchange)` a user asked to
 * regenerate. Keeps the two report families behind one shape so the credits
 * route and the regenerate UI don't need a branch per family.
 */
export interface ResolvedReportTarget {
  kind: CreditReportKind;
  id: string;
  label: string;
  lastReportGeneratedAt: Date | null;
  /** True while a generation request for this target is queued or running. */
  generationInProgress: boolean;
  /** Creates a full-report generation request inside an open DB transaction. */
  createGenerationRequest: (tx: Prisma.TransactionClient) => Promise<{ id: string }>;
}

const OPEN_STATUSES = [GenerationRequestStatus.NotStarted, GenerationRequestStatus.InProgress];
const OPEN_ETF_STATUSES = [EtfGenerationRequestStatus.NotStarted, EtfGenerationRequestStatus.InProgress];

export function parseReportTargetRequest(kind: unknown, symbol: unknown, exchange: unknown): ReportTargetRequest {
  if (kind !== CreditReportKind.Stock && kind !== CreditReportKind.Etf) {
    throw new Error(`Unsupported report kind: ${String(kind)}`);
  }
  if (typeof symbol !== 'string' || !symbol.trim() || typeof exchange !== 'string' || !exchange.trim()) {
    throw new Error('Both symbol and exchange are required');
  }
  return { kind, symbol: symbol.trim().toUpperCase(), exchange: exchange.trim().toUpperCase() };
}

export async function resolveReportTarget(target: ReportTargetRequest): Promise<ResolvedReportTarget> {
  const { kind, symbol, exchange } = target;
  const label = `${symbol} (${exchange})`;

  if (kind === CreditReportKind.Stock) {
    const ticker = await prisma.tickerV1.findFirstOrThrow({
      where: { spaceId: KoalaGainsSpaceId, symbol, exchange },
      select: { id: true, lastReportGeneratedAt: true },
    });

    const openRequests = await prisma.tickerV1GenerationRequest.count({
      where: { tickerId: ticker.id, status: { in: OPEN_STATUSES } },
    });

    return {
      kind,
      id: ticker.id,
      label,
      lastReportGeneratedAt: ticker.lastReportGeneratedAt,
      generationInProgress: openRequests > 0,
      createGenerationRequest: (tx) =>
        tx.tickerV1GenerationRequest.create({
          data: { tickerId: ticker.id, spaceId: KoalaGainsSpaceId, ...ALL_SECTIONS_REGENERATE_FLAGS },
          select: { id: true },
        }),
    };
  }

  const etf = await prisma.etf.findFirstOrThrow({
    where: { spaceId: KoalaGainsSpaceId, symbol, exchange },
    select: { id: true, lastReportGeneratedAt: true },
  });

  const openEtfRequests = await prisma.etfGenerationRequest.count({
    where: { etfId: etf.id, status: { in: OPEN_ETF_STATUSES } },
  });

  return {
    kind,
    id: etf.id,
    label,
    lastReportGeneratedAt: etf.lastReportGeneratedAt,
    generationInProgress: openEtfRequests > 0,
    createGenerationRequest: (tx) =>
      tx.etfGenerationRequest.create({
        data: { etfId: etf.id, spaceId: KoalaGainsSpaceId, ...ALL_ETF_SECTIONS_REGENERATE_FLAGS },
        select: { id: true },
      }),
  };
}
