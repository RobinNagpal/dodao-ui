import CompactSubIndustriesGrid from '@/components/stocks/CompactSubIndustriesGrid';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { IndustriesResponse } from '@/types/api/ticker-industries';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { getStocksPageTag } from '@/utils/ticker-v1-cache-utils';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import Link from 'next/link';

const TWO_WEEKS_IN_SECONDS = 14 * 24 * 60 * 60;

export const metadata: Metadata = {
  title: 'Stock Not Found | KoalaGains',
  description: 'The stock you are looking for could not be found. Browse US stocks by industry to discover other companies.',
  robots: { index: false, follow: true },
};

async function fetchIndustries(): Promise<IndustriesResponse | null> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/tickers-v1/country/${SupportedCountries.US}/tickers/industries`;
  try {
    const res = await fetch(url, { next: { revalidate: TWO_WEEKS_IN_SECONDS, tags: [getStocksPageTag(SupportedCountries.US)] } });
    if (!res.ok) return null;
    return (await res.json()) as IndustriesResponse;
  } catch {
    return null;
  }
}

export default async function StockTickerNotFound() {
  const industriesData = await fetchIndustries();

  const breadcrumbs: BreadcrumbsOjbect[] = [
    { name: 'US Stocks', href: '/stocks', current: false },
    { name: 'Not Found', href: '#', current: true },
  ];

  return (
    <PageWrapper>
      <div className="overflow-x-auto">
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>

      <section className="w-full mb-8 text-center py-10 sm:py-14">
        <p className="inline-block rounded-full px-4 py-1 text-sm font-semibold tracking-wider text-heading bg-surface ring-1 ring-border">404</p>
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-heading">Stock not found</h1>
        <p className="mt-3 text-base text-body max-w-2xl mx-auto">
          We couldn&apos;t find a stock matching this URL. It may have been delisted, the ticker may have changed, or the link may be mistyped. Browse our list
          of US stocks by industry below to find what you&apos;re looking for.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/stocks"
            className="text-sm bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] hover:from-[#F97316] hover:to-[#F59E0B] text-black font-medium px-4 py-2 rounded-lg shadow-md"
          >
            Browse All US Stocks
          </Link>
          <Link href="/" className="text-sm link-color hover:underline">
            Back to home →
          </Link>
        </div>
      </section>

      <div className="w-full mb-8">
        <h2 className="text-xl font-bold text-heading mb-2">Explore US Stocks by Industry</h2>
        <p className="text-body text-md mb-4">
          Top companies across NASDAQ, NYSE, and AMEX organized by industry. Pick an industry to dive into detailed financial reports and AI-driven analysis.
        </p>
      </div>

      <CompactSubIndustriesGrid data={industriesData} />
    </PageWrapper>
  );
}
