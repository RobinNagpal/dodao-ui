import { NextRequest, NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ALL_SUPPORTED_COUNTRIES, SupportedCountries } from '@/utils/countryExchangeUtils';

// Countries with no live tickers — skip in sitemap to avoid orphan pages that Google
// flags as "Crawled — currently not indexed" and Ahrefs reports as "Orphan page".
// US is the default (no /stocks/countries/US route); the rest currently have no
// listed tickers, so their per-country pages would render empty. Re-add a country
// here once it has at least one ticker.
const COUNTRIES_EXCLUDED_FROM_SITEMAP: ReadonlySet<SupportedCountries> = new Set([
  SupportedCountries.US,
  SupportedCountries.Japan,
  SupportedCountries.Taiwan,
  SupportedCountries.HongKong,
]);

interface Industry {
  industryKey: string;
  name: string;
  tickerCount?: number;
}

interface SiteMapUrl {
  url: string;
  changefreq: string;
  priority?: number;
  lastmod?: string;
}

// Fetch all industries
async function getAllIndustries(): Promise<Industry[]> {
  const response = await fetch(`${getBaseUrl()}/api/industries`);
  const industries = await response.json();
  return industries || [];
}

// Fetch all industries for a specific country
async function getAllIndustriesByCountry(country: string): Promise<Industry[]> {
  const response = await fetch(`${getBaseUrl()}/api/industries?country=${country}`);
  const industries = await response.json();
  return industries || [];
}

interface SitemapTicker {
  symbol: string;
  exchange: string;
  updatedAt: Date;
}

// Fetch tickers eligible for the sitemap: live rows only. Deleted tickers
// 404, and tickers with movedExchange/movedSymbol set 308 away — neither
// should appear in the sitemap. The destination of a move is a separate row
// (created when the move is applied) and lands in the sitemap on its own.
async function getAllTickers(): Promise<SitemapTicker[]> {
  return prisma.tickerV1.findMany({
    where: {
      spaceId: KoalaGainsSpaceId,
      isDeleted: false,
      movedExchange: null,
      movedSymbol: null,
    },
    select: {
      symbol: true,
      exchange: true,
      updatedAt: true,
    },
  });
}

// Generate all /stocks-related URLs for this sitemap
async function generateTickerUrls(): Promise<SiteMapUrl[]> {
  const urls: SiteMapUrl[] = [];

  // Main stocks pages
  urls.push({
    url: '/stocks',
    changefreq: 'daily',
    priority: 0.8,
  });

  // Country pages - /stocks/countries/{country} (skipping countries with no live tickers)
  for (const country of ALL_SUPPORTED_COUNTRIES) {
    if (!COUNTRIES_EXCLUDED_FROM_SITEMAP.has(country)) {
      urls.push({
        url: `/stocks/countries/${country}`,
        changefreq: 'weekly',
        priority: 0.7,
      });
    }
  }

  // Industry pages - /stocks/industries/{industryKey} (only industries that have at
  // least one ticker; empty industries render as thin pages and end up orphaned).
  const industries = await getAllIndustries();
  for (const industry of industries) {
    if ((industry.tickerCount ?? 0) > 0) {
      urls.push({
        url: `/stocks/industries/${industry.industryKey}`,
        changefreq: 'weekly',
        priority: 0.7,
      });
    }
  }

  // Country-specific industry pages - /stocks/countries/{country}/industries/{industryKey}
  for (const country of ALL_SUPPORTED_COUNTRIES) {
    if (!COUNTRIES_EXCLUDED_FROM_SITEMAP.has(country)) {
      const countryIndustries = await getAllIndustriesByCountry(country);
      for (const industry of countryIndustries) {
        if ((industry.tickerCount ?? 0) > 0) {
          urls.push({
            url: `/stocks/countries/${country}/industries/${industry.industryKey}`,
            changefreq: 'weekly',
            priority: 0.7,
          });
        }
      }
    }
  }

  // Individual ticker pages - /stocks/{exchange}/{symbol}.
  const tickers = await getAllTickers();

  const addedUrls = new Set<string>();

  for (const ticker of tickers) {
    const tickerUrl = `/stocks/${ticker.exchange}/${ticker.symbol}`;

    if (!addedUrls.has(tickerUrl)) {
      urls.push({
        url: tickerUrl,
        changefreq: 'weekly',
        priority: 0.6,
        lastmod: ticker.updatedAt ? ticker.updatedAt.toISOString().split('T')[0] : undefined,
      });
      addedUrls.add(tickerUrl);
    }
  }

  return urls;
}

async function GET(req: NextRequest): Promise<NextResponse<Buffer>> {
  const host = req.headers.get('host') as string;

  try {
    const urls = await generateTickerUrls();
    const smStream = new SitemapStream({ hostname: 'https://' + host });

    for (const url of urls) {
      smStream.write(url);
    }

    smStream.end();
    const response: Buffer = await streamToPromise(smStream);

    return new NextResponse(response as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error generating stocks sitemap:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export { GET };
