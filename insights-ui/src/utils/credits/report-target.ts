import { prisma } from '@/prisma';
import { ReportTargetRequest } from '@/types/credits';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
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
  symbol: string;
  exchange: string;
  label: string;
  lastReportGeneratedAt: Date | null;
  /** Creates a full-report generation request inside an open DB transaction. */
  createGenerationRequest: (tx: Prisma.TransactionClient) => Promise<{ id: string }>;
}

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
      // Soft-deleted tickers can't be paid for.
      where: { spaceId: KoalaGainsSpaceId, symbol, exchange, isDeleted: false },
      select: { id: true, lastReportGeneratedAt: true },
    });

    return {
      kind,
      id: ticker.id,
      symbol,
      exchange,
      label,
      lastReportGeneratedAt: ticker.lastReportGeneratedAt,
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

  return {
    kind,
    id: etf.id,
    symbol,
    exchange,
    label,
    lastReportGeneratedAt: etf.lastReportGeneratedAt,
    createGenerationRequest: (tx) =>
      tx.etfGenerationRequest.create({
        data: { etfId: etf.id, spaceId: KoalaGainsSpaceId, ...ALL_ETF_SECTIONS_REGENERATE_FLAGS },
        select: { id: true },
      }),
  };
}

/**
 * Report page links for report spends, keyed by `reportTargetId`. Looked up by id
 * rather than parsed from the stored label, so a ticker that has since moved
 * exchange still links to its current page. Deleted targets get no link.
 */
export async function getReportHrefs(rows: { reportKind: CreditReportKind | null; reportTargetId: string | null }[]): Promise<Map<string, string>> {
  const idsOf = (kind: CreditReportKind) => rows.filter((r) => r.reportKind === kind && r.reportTargetId).map((r) => r.reportTargetId as string);

  const [tickers, etfs] = await Promise.all([
    prisma.tickerV1.findMany({ where: { id: { in: idsOf(CreditReportKind.Stock) }, isDeleted: false }, select: { id: true, symbol: true, exchange: true } }),
    prisma.etf.findMany({ where: { id: { in: idsOf(CreditReportKind.Etf) } }, select: { id: true, symbol: true, exchange: true } }),
  ]);

  const hrefs = new Map<string, string>();
  tickers.forEach((t) => hrefs.set(t.id, `/stocks/${t.exchange}/${t.symbol}`));
  etfs.forEach((e) => hrefs.set(e.id, `/etfs/${e.exchange}/${e.symbol}`));
  return hrefs;
}
