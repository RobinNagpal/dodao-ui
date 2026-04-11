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
  const res = await fetch(`${baseUrl}/api/${KoalaGainsSpaceId}/etfs-v1/listing`, {
    next: { revalidate: WEEK, tags: [getEtfListingTag()] },
  });

  const data = (await res.json()) as EtfListingResponse;

  return (
    <EtfPageLayout
      title="US ETFs"
      description="Explore US exchange-traded funds with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights."
    >
      <EtfListingGrid data={data} />
    </EtfPageLayout>
  );
}
