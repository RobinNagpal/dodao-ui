import Contact from '@/components/home-page/Contact';
import { Footer } from '@/components/home-page/Footer';
import BlogsGrid from '@/components/blogs/BlogsGrid';
import { Hero } from '@/components/home-page/Hero';
import KoalagainsOfferings from '@/components/home-page/KoalagainsOfferings';
import KoalaGainsPlatform from '@/components/home-page/KoalaGainsPlatform';
import { ReportsNavBar } from '@/components/home-page/ReportsNavBar';
import { AnalysisFramework } from '@/components/home-page/AnalysisFramework';
import Crowdfunding from '@/components/home-page/Crowdfunding';
import REIT from '@/components/home-page/Reit';
import Tariff from '@/components/home-page/Tariff';
import { IndustryWithTopTickers } from '@/components/home-page/TopIndustriesShowcase';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TickerWithIndustryNames } from '@/types/ticker-typesv1';
import { getPostsData } from '@/util/blog-utils';
import { themeColors } from '@/util/theme-colors';
import { TICKERS_TAG } from '@/utils/ticker-v1-cache-utils';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Global Stocks by Industry — Deep Value Insights | KoalaGains',
    description: 'Global deep value insights across all major exchanges—research once limited to select investors, now free for retail.',
  },
  alternates: { canonical: 'https://koalagains.com' },
};

const WEEK = 60 * 60 * 24 * 7;

async function fetchTopIndustriesWithTickers(): Promise<IndustryWithTopTickers[]> {
  const base = getBaseUrl() || 'https://koalagains.com';
  const url = `${base}/api/${KoalaGainsSpaceId}/tickers-v1/top-by-industry?country=US`;

  // Also tag the underlying fetch so any manual tag revalidation hits this too
  try {
    const res = await fetch(url, { next: { tags: ['home-page', TICKERS_TAG] } });
    if (!res.ok) return [];

    const tickers: TickerWithIndustryNames[] = await res.json();

    const byIndustry = new Map<string, TickerWithIndustryNames[]>();
    for (const ticker of tickers) {
      const key = ticker.industryKey;
      if (!byIndustry.has(key)) byIndustry.set(key, []);
      byIndustry.get(key)!.push(ticker);
    }

    const industries: IndustryWithTopTickers[] = Array.from(byIndustry.entries())
      .map(([industryKey, industryTickers]) => ({
        industryKey,
        industryName: industryTickers[0]?.industryName || industryKey,
        tickerCount: industryTickers.length,
        topTickers: industryTickers.sort((t) => -(t.cachedScoreEntry?.finalScore || 0)),
      }))
      .sort((a, b) => b.tickerCount - a.tickerCount);

    return industries;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

// Cache + tag BOTH data sources for 7 days
const getIndustriesCached = unstable_cache(async () => fetchTopIndustriesWithTickers(), ['home-page-industries'], {
  revalidate: WEEK,
  tags: ['home-page', TICKERS_TAG],
});

const getPostsCached = unstable_cache(async () => getPostsData(6), ['home-page-posts'], { revalidate: WEEK, tags: ['home-page'] });

export default async function Home() {
  const [industries, posts] = await Promise.all([getIndustriesCached(), getPostsCached()]);

  return (
    <div style={{ ...themeColors }}>
      <Hero industries={industries} />
      <KoalagainsOfferings />
      <KoalaGainsPlatform />
      <ReportsNavBar />
      <AnalysisFramework />
      <Crowdfunding />
      <REIT />
      <Tariff />
      <BlogsGrid posts={posts} showViewAllButton={true} />
      <Contact />
      <Footer />
    </div>
  );
}
