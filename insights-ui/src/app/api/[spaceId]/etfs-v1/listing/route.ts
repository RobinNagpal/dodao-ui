import { getEtfListingData } from '@/app/api/[spaceId]/etfs-v1/listing/listing-prisma';
import { shouldIncludeUnpopulatedForRequest } from '@/utils/etf-listing-visibility';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export interface EtfListingItem {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  inception: string | null;
  aum: string | null;
  expenseRatio: number | null;
  pe: number | null;
  sharesOut: string | null;
  dividendTtm: number | null;
  dividendYield: number | null;
  payoutFrequency: string | null;
  holdings: number | null;
  beta: number | null;
  finalScore: number | null;
  category: string | null;
  hasMorAnalyzerInfo: boolean;
  hasMorRiskInfo: boolean;
  hasMorPeopleInfo: boolean;
}

export interface EtfListingResponse {
  etfs: EtfListingItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filtersApplied: boolean;
}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<EtfListingResponse> {
  const { spaceId } = await context.params;
  const { searchParams } = new URL(req.url);
  const includeUnpopulated = await shouldIncludeUnpopulatedForRequest(req);
  return getEtfListingData(spaceId, searchParams, includeUnpopulated);
}

export const GET = withErrorHandlingV2<EtfListingResponse>(getHandler);
