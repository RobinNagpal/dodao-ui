import { NextRequest, NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
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

// Fetch all tickers
async function getAllTickers(): Promise<Array<{ symbol: string; exchange: string; industryKey: string; updatedAt: string }>> {
  const response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1`);
  const tickers = await response.json();
  return tickers || [];
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

  // Individual ticker pages - /stocks/{exchange}/{symbol}
  const tickers = await getAllTickers();

  // Avoid duplicates in case the same ticker appears multiple times
  const addedUrls = new Set<string>();

  for (const ticker of tickers) {
    const tickerUrl = `/stocks/${ticker.exchange}/${ticker.symbol}`;

    if (!addedUrls.has(tickerUrl)) {
      urls.push({
        url: tickerUrl,
        changefreq: 'weekly',
        priority: 0.6,
        lastmod: ticker.updatedAt ? new Date(ticker.updatedAt).toISOString().split('T')[0] : undefined,
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
