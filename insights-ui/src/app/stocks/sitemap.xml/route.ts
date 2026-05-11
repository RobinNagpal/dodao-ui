import { NextRequest, NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ALL_SUPPORTED_COUNTRIES, SupportedCountries } from '@/utils/countryExchangeUtils';

interface Industry {
  industryKey: string;
  name: string;
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
  movedExchange: string | null;
  movedSymbol: string | null;
  updatedAt: Date;
}

// Fetch all tickers eligible for the sitemap. We query Prisma directly (rather
// than going through /api/.../tickers-v1) for two reasons: the listing API now
// hides moved/deleted tickers — but the sitemap still needs to see the moved
// fields so it can emit the *canonical destination* URL instead of an old URL
// that would 308 to it. Deleted tickers are still excluded outright.
async function getAllTickers(): Promise<SitemapTicker[]> {
  return prisma.tickerV1.findMany({
    where: {
      spaceId: KoalaGainsSpaceId,
      isDeleted: false,
    },
    select: {
      symbol: true,
      exchange: true,
      movedExchange: true,
      movedSymbol: true,
      updatedAt: true,
    },
  });
}

// Generate all /stocks-related URLs for this sitemap
async function generateTickerUrls(): Promise<SiteMapUrl[]> {
  const urls: SiteMapUrl[] = [];

  // Main stocks pages
  urls.push(
    {
      url: '/stocks',
      changefreq: 'daily',
      priority: 0.8,
    },
    {
      url: '/stocks/comparison',
      changefreq: 'weekly',
      priority: 0.7,
    }
  );

  // Country pages - /stocks/countries/{country} (excluding US as it's the default)
  for (const country of ALL_SUPPORTED_COUNTRIES) {
    if (country !== SupportedCountries.US) {
      urls.push({
        url: `/stocks/countries/${country}`,
        changefreq: 'weekly',
        priority: 0.7,
      });
    }
  }

  // Industry pages - /stocks/industries/{industryKey}
  const industries = await getAllIndustries();
  for (const industry of industries) {
    urls.push({
      url: `/stocks/industries/${industry.industryKey}`,
      changefreq: 'weekly',
      priority: 0.7,
    });
  }

  // Country-specific industry pages - /stocks/countries/{country}/industries/{industryKey} (excluding US as it's the default)
  for (const country of ALL_SUPPORTED_COUNTRIES) {
    if (country !== SupportedCountries.US) {
      const countryIndustries = await getAllIndustriesByCountry(country);
      for (const industry of countryIndustries) {
        urls.push({
          url: `/stocks/countries/${country}/industries/${industry.industryKey}`,
          changefreq: 'weekly',
          priority: 0.7,
        });
      }
    }
  }

  // Individual ticker pages - /stocks/{exchange}/{symbol}. For tickers with
  // movedExchange/movedSymbol set we emit the canonical destination URL — not
  // the old URL that would 308 away. Mirrors enforceMovedRedirect's fallback
  // (only one of the two fields can be set; the other is taken from the row).
  const tickers = await getAllTickers();

  const addedUrls = new Set<string>();

  for (const ticker of tickers) {
    const destExchange = (ticker.movedExchange ?? ticker.exchange).toUpperCase();
    const destSymbol = (ticker.movedSymbol ?? ticker.symbol).toUpperCase();
    const tickerUrl = `/stocks/${destExchange}/${destSymbol}`;

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
