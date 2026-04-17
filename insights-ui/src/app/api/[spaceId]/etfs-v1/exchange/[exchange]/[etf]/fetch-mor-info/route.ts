import { withAdminOrToken } from '@/app/api/helpers/withAdminOrToken';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { AllExchanges, toExchange, USExchanges } from '@/utils/countryExchangeUtils';
import { NextRequest } from 'next/server';

export type MorKind = 'quote' | 'risk' | 'people' | 'portfolio';

export interface TriggerMorScrapeRequest {
  kind: MorKind;
}

export interface TriggerMorScrapeResponse {
  success: boolean;
  message: string;
  url: string;
  kind: MorKind;
}

const LAMBDA_URL = process.env.ETF_MORN_LAMBDA_URL || '';
const CALLBACK_BASE_URL = process.env.REPORT_GENERATION_CALLBACK_BASE_URL || 'https://koalagains.com';

function normalizeUpperTrim(v: string | null | undefined): string {
  return (v ?? '').toUpperCase().trim();
}

function toKind(v: unknown): MorKind {
  if (v === 'quote' || v === 'risk' || v === 'people' || v === 'portfolio') return v;
  throw new Error('Invalid kind. Expected quote, risk, people, or portfolio.');
}

function joinUrl(base: string, path: string): string {
  const b = (base ?? '').replace(/\/+$/, '');
  const p = (path ?? '').replace(/^\/+/, '');
  return `${b}/${p}`;
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

function buildMorEtfRelativePath(params: { exchange: string; symbol: string; kind: MorKind }): string {
  const ex = toExchange(params.exchange);
  const seg = toMorEtfExchangeSegment(ex);
  const sym = (params.symbol ?? '').trim().toLowerCase();
  if (!sym) throw new Error('Invalid ETF symbol');
  return `/${seg}/${encodeURIComponent(sym)}/${params.kind}`;
}

async function postHandler(
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload | null,
  { params }: { params: Promise<{ spaceId: string; exchange: string; etf: string }> }
): Promise<TriggerMorScrapeResponse> {
  if (!LAMBDA_URL) {
    throw new Error('ETF_MORN_LAMBDA_URL environment variable is not set');
  }
  if (!CALLBACK_BASE_URL) {
    throw new Error('REPORT_GENERATION_CALLBACK_BASE_URL environment variable is not set');
  }

  const body = (await req.json().catch(() => ({}))) as Partial<TriggerMorScrapeRequest>;
  const kind = toKind(body.kind);

  const { spaceId, exchange, etf } = await params;
  const ex = normalizeUpperTrim(exchange);
  const symbol = normalizeUpperTrim(etf);
  const morRelativePath = buildMorEtfRelativePath({ exchange: ex, symbol, kind });
  const callbackUrl = joinUrl(
    CALLBACK_BASE_URL,
    `/api/${encodeURIComponent(spaceId)}/etfs-v1/exchange/${encodeURIComponent(ex)}/${encodeURIComponent(symbol)}/mor-info-callback`
  );

  const lambdaBase = (LAMBDA_URL ?? '').replace(/\/+$/, '');
  const resp = await fetch(lambdaBase, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: morRelativePath, callbackUrl }),
  });

  if (!resp.ok) {
    throw new Error(`Lambda request failed: ${resp.status} ${resp.statusText}`);
  }

  // Lambda returns immediately with "Request accepted..." when callbackUrl is provided.
  const json = (await resp.json().catch(() => null)) as any;
  const message = (json?.message as string) || 'Default Message';

  return { success: true, message, url: morRelativePath, kind };
}

export const POST = withAdminOrToken<TriggerMorScrapeResponse>(postHandler);
