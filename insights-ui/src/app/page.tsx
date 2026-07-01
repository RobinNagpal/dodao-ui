import BlogsGrid from '@/components/blogs/BlogsGrid';
import Contact from '@/components/home-page/Contact';
import { Footer } from '@/components/home-page/Footer';
import { Hero } from '@/components/home-page/Hero';
import KoalagainsOfferings from '@/components/home-page/KoalagainsOfferings';
import KoalaGainsPlatform from '@/components/home-page/KoalaGainsPlatform';
import ServiceNavigation from '@/components/home-page/ServiceNavigation';
import TopEtfAssetClassesShowcase from '@/components/home-page/TopEtfAssetClassesShowcase';
import type { EtfAssetClassesIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/asset-classes-index/route';
import { IndustryWithTopTickers } from '@/types/api/ticker-industries';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getPostsData } from '@/util/blog-utils';
import { themeColors } from '@/util/theme-colors';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { getEtfAssetClassesIndexTag } from '@/utils/etf-cache-utils';
import { getTopEtfAssetClasses } from '@/utils/home-page/top-etf-asset-classes';
import { getTopIndustriesWithTickers } from '@/utils/home-page/top-industries';
import { getStocksPageTag, getHomePagePostsTag } from '@/utils/ticker-v1-cache-utils';
import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';

export const metadata: Metadata = {
  title: 'Global Stocks by Industry — Deep Value Insights | KoalaGains',
  description:
    'Get deep value-based investment insights across all major global exchanges and leading stocks. We deliver research once limited to select investors due to high costs—now free for retail investors worldwide.',
  keywords: [
    // Core intent
    'global stocks',
    'world stocks',
    'stocks by industry',
    'deep value investing',
    'value investing',
    'fundamental analysis',
    'intrinsic value',
    'AI stock insights',
    'investment research',
    'free investment research',
    'retail investors',
    'KoalaGains',

    // Americas
    'NYSE',
    'NASDAQ',
    'NYSE American',
    'AMEX',
    'TSX',
    'TSX Venture',
    'B3',
    'BM&FBOVESPA',
    'BMV',

    // Europe
    'London Stock Exchange',
    'LSE',
    'AIM',
    'Euronext',
    'Deutsche Börse',
    'Xetra',
    'Frankfurt Stock Exchange',
    'SIX Swiss Exchange',
    'Borsa Italiana',
    'BME',
    'Bolsa de Madrid',
    'Nasdaq Nordic',
    'OMX',
    'Oslo Børs',
    'WSE',
    'Borsa Istanbul',

    // Asia-Pacific
    'Tokyo Stock Exchange',
    'TSE',
    'JPX',
    'Hong Kong Stock Exchange',
    'HKEX',
    'Shanghai Stock Exchange',
    'SSE',
    'Shenzhen Stock Exchange',
    'SZSE',
    'NSE India',
    'BSE',
    'Singapore Exchange',
    'SGX',
    'Korea Exchange',
    'KRX',
    'ASX',
    'NZX',
    'TWSE',
    'Bursa Malaysia',
    'IDX',
    'SET',
    'PSE',
    'HOSE',

    // Middle East & Africa
    'Saudi Exchange',
    'Tadawul',
    'Abu Dhabi Securities Exchange',
    'ADX',
    'Dubai Financial Market',
    'DFM',
    'Qatar Stock Exchange',
    'QSE',
    'Tel Aviv Stock Exchange',
    'TASE',
    'Johannesburg Stock Exchange',
    'JSE',
  ],
  openGraph: {
    title: 'Global Stocks by Industry — Deep Value Insights | KoalaGains',
    description:
      'Deep value-based insights for stocks across major exchanges worldwide (NYSE, NASDAQ, LSE, HKEX, TSE/JPX, SSE, SZSE, NSE India, BSE, ASX, TSX, SIX, Deutsche Börse/Xetra, Euronext, SGX, KRX, JSE, B3, and more). Research once reserved for select investors—now free for retail.',
    url: 'https://koalagains.com',
    siteName: 'KoalaGains',
    type: 'website',
    images: ['https://koalagains.com/koalagain_logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Global Stocks by Industry — Deep Value Insights | KoalaGains',
    description: 'Global deep value insights across all major exchanges—research once limited to select investors, now free for retail.',
    images: ['https://koalagains.com/koalagain_logo.png'],
  },
  alternates: { canonical: 'https://koalagains.com' },
};

const WEEK = 60 * 60 * 24 * 7;

async function fetchTopIndustriesWithTickers(): Promise<IndustryWithTopTickers[]> {
  // Read the DB directly (server-only) instead of self-fetching our own /api over HTTP. During
  // `next build` that self-fetch resolved to the public canonical origin (https://koalagains.com,
  // now CloudFront→AWS), which could return an HTML error page and crash `res.json()`, aborting the
  // static export of "/". A direct query always returns fresh data on every platform.
  const { industries } = await getTopIndustriesWithTickers(KoalaGainsSpaceId, SupportedCountries.US);
  return industries;
}

async function fetchTopEtfAssetClasses(): Promise<EtfAssetClassesIndexResponse> {
  // Same build-safe, direct-DB approach as the industries fetch above (no HTTP self-fetch) so the
  // ETF showcase never breaks the static export of "/". See getTopEtfAssetClasses.
  return getTopEtfAssetClasses(KoalaGainsSpaceId, SupportedCountries.US);
}

// Cache + tag BOTH data sources for 7 days
// Industries use stocks page tag so revalidateStocksPageTag() can invalidate it
const getIndustriesCached = unstable_cache(async () => fetchTopIndustriesWithTickers(), ['home-page-industries'], {
  revalidate: WEEK,
  tags: [getStocksPageTag(SupportedCountries.US)],
});

// Posts have their own tag for independent revalidation
const getPostsCached = unstable_cache(async () => getPostsData(6), ['home-page-posts'], { revalidate: WEEK, tags: [getHomePagePostsTag()] });

// ETF asset classes reuse the US asset-classes-index tag so revalidating the ETF listings also refreshes the home-page showcase
const getEtfAssetClassesCached = unstable_cache(async () => fetchTopEtfAssetClasses(), ['home-page-etf-asset-classes'], {
  revalidate: WEEK,
  tags: [getEtfAssetClassesIndexTag(SupportedCountries.US)],
});

export default async function Home() {
  const [industries, posts, etfAssetClasses] = await Promise.all([getIndustriesCached(), getPostsCached(), getEtfAssetClassesCached()]);

  return (
    <div style={{ ...themeColors }}>
      <Hero industries={industries} />
      <TopEtfAssetClassesShowcase country={SupportedCountries.US} data={etfAssetClasses} />
      <ServiceNavigation />
      <KoalagainsOfferings />
      <KoalaGainsPlatform />
      <BlogsGrid posts={posts} showViewAllButton={true} showCategoryButtons={false} />
      <Contact />
      <Footer />
    </div>
  );
}
