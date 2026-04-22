import { prisma } from '@/prisma';
import { AllExchanges, toExchange, USExchanges } from '@/utils/countryExchangeUtils';

export type MorKind = 'quote' | 'risk' | 'people' | 'portfolio';

export interface TriggerMorScrapeParams {
  spaceId: string;
  exchange: string;
  symbol: string;
  kind: MorKind;
}

export interface TriggerMorScrapeResult {
  success: boolean;
  message: string;
  url: string;
  kind: MorKind;
}

type MorEtfExchangeSegment = 'xnys' | 'xnas' | 'arcx' | 'bats';

function toMorEtfExchangeSegment(exchange: AllExchanges): MorEtfExchangeSegment {
  switch (exchange) {
    case USExchanges.NYSE:
      return 'xnys';
    case USExchanges.NASDAQ:
      return 'xnas';
    case USExchanges.NYSEARCA:
      return 'arcx';
    case USExchanges.BATS:
      return 'bats';
    default:
      throw new Error(`Unsupported exchange: ${exchange}`);
  }
}

function joinUrl(base: string, path: string): string {
  const b = (base ?? '').replace(/\/+$/, '');
  const p = (path ?? '').replace(/^\/+/, '');
  return `${b}/${p}`;
}

function buildMorEtfRelativePath(params: { exchange: string; symbol: string; kind: MorKind }): string {
  const ex = toExchange(params.exchange);
  const seg = toMorEtfExchangeSegment(ex);
  const sym = (params.symbol ?? '').trim().toLowerCase();
  if (!sym) throw new Error('Invalid ETF symbol');
  return `/${seg}/${encodeURIComponent(sym)}/${params.kind}`;
}

function normalizeUpperTrim(v: string | null | undefined): string {
  return (v ?? '').toUpperCase().trim();
}

export async function triggerMorScrape(params: TriggerMorScrapeParams): Promise<TriggerMorScrapeResult> {
  const lambdaUrl = process.env.ETF_MORN_LAMBDA_URL || '';
  const callbackBaseUrl = process.env.REPORT_GENERATION_CALLBACK_BASE_URL || 'https://koalagains.com';

  if (!lambdaUrl) {
    throw new Error('ETF_MORN_LAMBDA_URL environment variable is not set');
  }
  if (!callbackBaseUrl) {
    throw new Error('REPORT_GENERATION_CALLBACK_BASE_URL environment variable is not set');
  }

  const ex = normalizeUpperTrim(params.exchange);
  const symbol = normalizeUpperTrim(params.symbol);
  const morRelativePath = buildMorEtfRelativePath({ exchange: ex, symbol, kind: params.kind });
  const callbackUrl = joinUrl(
    callbackBaseUrl,
    `/api/${encodeURIComponent(params.spaceId)}/etfs-v1/exchange/${encodeURIComponent(ex)}/${encodeURIComponent(symbol)}/mor-info-callback`
  );

  const lambdaBase = lambdaUrl.replace(/\/+$/, '');
  const resp = await fetch(lambdaBase, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: morRelativePath, callbackUrl }),
  });

  if (!resp.ok) {
    throw new Error(`Lambda request failed: ${resp.status} ${resp.statusText}`);
  }

  const json = (await resp.json().catch(() => null)) as { message?: string } | null;
  const message = json?.message ?? 'Default Message';

  return { success: true, message, url: morRelativePath, kind: params.kind };
}

export interface EnsureMorDataParams {
  etfId: string;
  spaceId: string;
  exchange: string;
  symbol: string;
}

/**
 * Fire-and-forget: for any of the 4 MOR tables that does not yet have a row for this ETF,
 * trigger the scraping lambda to populate it. Lambda callbacks arrive asynchronously and
 * upsert the tables, so by the time a worker picks up the generation request the data
 * should be present. Failures to trigger any individual kind are logged but do not throw,
 * so request creation is never blocked by a transient lambda outage.
 */
export async function ensureMorDataForAnalysis(params: EnsureMorDataParams): Promise<MorKind[]> {
  const [analyzerCount, riskCount, peopleCount, portfolioCount] = await Promise.all([
    prisma.etfMorAnalyzerInfo.count({ where: { etfId: params.etfId } }),
    prisma.etfMorRiskInfo.count({ where: { etfId: params.etfId } }),
    prisma.etfMorPeopleInfo.count({ where: { etfId: params.etfId } }),
    prisma.etfMorPortfolioInfo.count({ where: { etfId: params.etfId } }),
  ]);

  const missingKinds: MorKind[] = [];
  if (analyzerCount === 0) missingKinds.push('quote');
  if (riskCount === 0) missingKinds.push('risk');
  if (peopleCount === 0) missingKinds.push('people');
  if (portfolioCount === 0) missingKinds.push('portfolio');

  if (missingKinds.length === 0) return [];

  await Promise.all(
    missingKinds.map(async (kind) => {
      try {
        await triggerMorScrape({ spaceId: params.spaceId, exchange: params.exchange, symbol: params.symbol, kind });
      } catch (err) {
        console.error(`[ensureMorDataForAnalysis] Failed to trigger ${kind} scrape for ${params.symbol}:`, err);
      }
    })
  );

  return missingKinds;
}
