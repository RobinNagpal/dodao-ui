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
import { unstable_cache } from 'next/cache';

const WEEK = 60 * 60 * 24 * 7;

async function fetchTopIndustriesWithTickers(): Promise<IndustryWithTopTickers[]> {
  const base = getBaseUrl();
  const url = `${base}/api/${KoalaGainsSpaceId}/tickers-v1/top-by-industry?country=US`;

  // Also tag the underlying fetch so any manual tag revalidation hits this too
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
      topTickers: industryTickers,
    }))
    .sort((a, b) => b.tickerCount - a.tickerCount);

  return industries;
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
