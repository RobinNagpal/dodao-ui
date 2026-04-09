import { withLoggedInAdmin } from '@/app/api/helpers/withLoggedInAdmin';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { NextRequest } from 'next/server';

export type MorKind = 'quote' | 'risk' | 'people';

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
const MORN_BASE_URL = process.env.NEXT_PUBLIC_ETF_MORN_BASE_URL || '';
const CALLBACK_BASE_URL = process.env.REPORT_GENERATION_CALLBACK_BASE_URL || '';

function normalizeUpperTrim(v: string | null | undefined): string {
  return (v ?? '').toUpperCase().trim();
}

function toKind(v: unknown): MorKind {
  if (v === 'quote' || v === 'risk' || v === 'people') return v;
  throw new Error('Invalid kind. Expected quote, risk, or people.');
}

function joinUrl(base: string, path: string): string {
  const b = (base ?? '').replace(/\/+$/, '');
  const p = (path ?? '').replace(/^\/+/, '');
  return `${b}/${p}`;
}

async function postHandler(
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload,
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

  const morUrl = joinUrl(MORN_BASE_URL, `${encodeURIComponent(ex)}/${encodeURIComponent(symbol)}/${kind}`);
  const callbackUrl = joinUrl(
    CALLBACK_BASE_URL,
    `/api/${encodeURIComponent(spaceId)}/etfs-v1/exchange/${encodeURIComponent(ex)}/${encodeURIComponent(symbol)}/mor-info-callback`
  );

  const lambdaBase = (LAMBDA_URL ?? '').replace(/\/+$/, '');
  const resp = await fetch(lambdaBase, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: morUrl, callbackUrl }),
  });

  if (!resp.ok) {
    throw new Error(`Lambda request failed: ${resp.status} ${resp.statusText}`);
  }

  // Lambda returns immediately with "Request accepted..." when callbackUrl is provided.
  const json = (await resp.json().catch(() => null)) as any;
  const message = (json?.message as string) || 'Request accepted. Processing in background.';

  return { success: true, message, url: morUrl, kind };
}

export const POST = withLoggedInAdmin<TriggerMorScrapeResponse>(postHandler);
