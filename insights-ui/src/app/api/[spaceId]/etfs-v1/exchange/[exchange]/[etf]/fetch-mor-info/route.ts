import { withAdminOrToken } from '@/app/api/helpers/withAdminOrToken';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { MorKind, triggerMorScrape } from '@/utils/etf-analysis-reports/mor-scrape-utils';
import { NextRequest } from 'next/server';

export type { MorKind } from '@/utils/etf-analysis-reports/mor-scrape-utils';

export interface TriggerMorScrapeRequest {
  kind: MorKind;
}

export interface TriggerMorScrapeResponse {
  success: boolean;
  message: string;
  url: string;
  kind: MorKind;
}

function toKind(v: unknown): MorKind {
  if (v === 'quote' || v === 'risk' || v === 'people' || v === 'portfolio') return v;
  throw new Error('Invalid kind. Expected quote, risk, people, or portfolio.');
}

async function postHandler(
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload | null,
  { params }: { params: Promise<{ spaceId: string; exchange: string; etf: string }> }
): Promise<TriggerMorScrapeResponse> {
  const body = (await req.json().catch(() => ({}))) as Partial<TriggerMorScrapeRequest>;
  const kind = toKind(body.kind);

  const { spaceId, exchange, etf } = await params;
  return triggerMorScrape({ spaceId, exchange, symbol: etf, kind });
}

export const POST = withAdminOrToken<TriggerMorScrapeResponse>(postHandler);
