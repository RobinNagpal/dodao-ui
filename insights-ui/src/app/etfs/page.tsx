import EtfListingGrid from '@/components/etfs/EtfListingGrid';
import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import { EtfListingResponse } from '@/app/api/[spaceId]/etfs-v1/listing/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { getEtfListingTag } from '@/utils/etf-cache-utils';

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = 86400; // 24 hours

const WEEK = 60 * 60 * 24 * 7;

export const metadata = {
  title: 'US ETFs - Exchange Traded Funds Analysis | KoalaGains',
  description:
    'Explore US ETFs with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights. Filter by AUM, P/E ratio, payout frequency, and more.',
};

export default async function EtfsPage() {
  const baseUrl = getBaseUrlForServerSidePages();
  let data: EtfListingResponse = { etfs: [], totalCount: 0, page: 1, pageSize: 100, totalPages: 1, filtersApplied: false };

  try {
    const res = await fetch(`${baseUrl}/api/${KoalaGainsSpaceId}/etfs-v1/listing`, {
      next: { revalidate: WEEK, tags: [getEtfListingTag()] },
    });

    if (res.ok) {
      data = (await res.json()) as EtfListingResponse;
    }
  } catch (e) {
    console.error('Failed to fetch ETF listing:', e);
  }

  return (
    <EtfPageLayout
      title="US ETFs"
      description="Explore US exchange-traded funds with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights."
    >
      <EtfListingGrid data={data} />
    </EtfPageLayout>
  );
}
