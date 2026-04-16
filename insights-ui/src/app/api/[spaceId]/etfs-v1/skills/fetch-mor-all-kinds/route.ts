import { withAdminOrToken } from '@/app/api/helpers/withAdminOrToken';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { AllExchanges, toExchange, USExchanges } from '@/utils/countryExchangeUtils';
import { NextRequest } from 'next/server';

type MorKind = 'quote' | 'risk' | 'people' | 'portfolio';
const ALL_KINDS: MorKind[] = ['quote', 'risk', 'people', 'portfolio'];

type MorEtfExchangeSegment = 'xnys' | 'xnas' | 'arcx' | 'bats';

interface KindResult {
  kind: MorKind;
  success: boolean;
  message: string;
}

export interface FetchMorAllKindsRequest {
  /** ETF symbol, e.g. "VOO" */
  symbol: string;
  /** Exchange, e.g. "NYSEARCA" */
  exchange: string;
}

export interface FetchMorAllKindsResponse {
  symbol: string;
  exchange: string;
  results: KindResult[];
}

const LAMBDA_URL = process.env.ETF_MORN_LAMBDA_URL || '';
const CALLBACK_BASE_URL = process.env.REPORT_GENERATION_CALLBACK_BASE_URL || 'https://koalagains.com';

function normalizeUpperTrim(v: string | null | undefined): string {
  return (v ?? '').toUpperCase().trim();
}

function joinUrl(base: string, path: string): string {
  const b = (base ?? '').replace(/\/+$/, '');
  const p = (path ?? '').replace(/^\/+/, '');
  return `${b}/${p}`;
}

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
  { params }: { params: Promise<{ spaceId: string }> }
): Promise<FetchMorAllKindsResponse> {
  if (!LAMBDA_URL) {
    throw new Error('ETF_MORN_LAMBDA_URL environment variable is not set');
  }
  if (!CALLBACK_BASE_URL) {
    throw new Error('REPORT_GENERATION_CALLBACK_BASE_URL environment variable is not set');
  }

  const { spaceId } = await params;
  const body = (await req.json().catch(() => ({}))) as Partial<FetchMorAllKindsRequest>;
  const symbol = normalizeUpperTrim(body.symbol);
  const exchange = normalizeUpperTrim(body.exchange);

  if (!symbol) throw new Error('Missing required field: symbol');
  if (!exchange) throw new Error('Missing required field: exchange');

  const lambdaBase = (LAMBDA_URL ?? '').replace(/\/+$/, '');

  const results: KindResult[] = await Promise.all(
    ALL_KINDS.map(async (kind): Promise<KindResult> => {
      try {
        const morRelativePath = buildMorEtfRelativePath({ exchange, symbol, kind });
        const callbackUrl = joinUrl(
          CALLBACK_BASE_URL,
          `/api/${encodeURIComponent(spaceId)}/etfs-v1/exchange/${encodeURIComponent(exchange)}/${encodeURIComponent(symbol)}/mor-info-callback`
        );

        const resp = await fetch(lambdaBase, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: morRelativePath, callbackUrl }),
        });

        if (!resp.ok) {
          return { kind, success: false, message: `Lambda returned ${resp.status} ${resp.statusText}` };
        }

        const json = (await resp.json().catch(() => null)) as any;
        return { kind, success: true, message: (json?.message as string) || 'Request accepted' };
      } catch (err) {
        return { kind, success: false, message: (err as Error).message };
      }
    })
  );

  return { symbol, exchange, results };
}

export const POST = withAdminOrToken<FetchMorAllKindsResponse>(postHandler);
