import { Metadata } from 'next';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { TickerV1Industry } from '@prisma/client';

// ────────────────────────────────────────────────────────────────────────────────
// Country stocks metadata generator
// ────────────────────────────────────────────────────────────────────────────────

export const generateCountryStocksMetadata = (countryName: string): Metadata => {
  const isUS = countryName === 'US';
  const url = isUS ? 'https://koalagains.com/stocks' : `https://koalagains.com/stocks/countries/${encodeURIComponent(countryName)}`;

  const description = `Discover ${countryName} stocks grouped by industry and sub-industry. See top tickers with detailed reports and AI insights.`;

  const keywords = [
    `${countryName} stocks`,
    'stocks by industry',
    'stock analysis',
    'AI stock insights',
    'investment research',
    'top performing stocks',
    'KoalaGains',
  ];

  const openGraphDescription = `Discover ${countryName} stocks grouped by industry and sub-industry. See top tickers with detailed reports and AI insights.`;

  return {
    title: `${countryName} Stocks by Industry | KoalaGains`,
    description,
    keywords,
    openGraph: {
      title: `${countryName} Stocks by Industry | KoalaGains`,
      description: openGraphDescription,
      url,
      siteName: 'KoalaGains',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${countryName} Stocks by Industry | KoalaGains`,
      description: openGraphDescription,
    },
    alternates: {
      canonical: url,
    },
  };
};

// ────────────────────────────────────────────────────────────────────────────────
// Country industry stocks metadata generator
// ────────────────────────────────────────────────────────────────────────────────

export const generateCountryIndustryStocksMetadata = async (countryName: string, industryKey: string): Promise<Metadata> => {
  const isUS = countryName === 'US';

  // Fetch industry data to get name and summary
  let industryName = industryKey; // fallback to key
  let industrySummary = `Browse ${industryKey} stocks and sub-industries across ${countryName} exchanges. View reports, metrics, and AI-driven insights to guide your investments.`;

  try {
    const response = await fetch(`${getBaseUrl()}/api/industries/${industryKey}`, { next: { revalidate: 3600 } });
    const industryData: TickerV1Industry = await response.json();
    industryName = industryData.name ?? industryKey;
    industrySummary = industryData.summary ?? industrySummary;
  } catch (error) {
    console.log('Error fetching industry data for metadata:', error);
  }

  const base = isUS
    ? `https://koalagains.com/stocks/industries/${encodeURIComponent(industryKey)}`
    : `https://koalagains.com/stocks/countries/${encodeURIComponent(countryName)}/industries/${industryKey}`;

  const title = `${industryName} Stocks in ${countryName} | KoalaGains`;

  const keywords = [
    `${industryName} stocks`,
    `${industryName} companies`,
    `${industryName} sub-industries`,
    `${countryName} stocks`,
    'KoalaGains',
    'Stock analysis',
    'Financial reports',
    'Investment research',
  ];

  return {
    title,
    description: industrySummary,
    alternates: {
      canonical: base,
    },
    keywords,
    openGraph: {
      title,
      description: industrySummary,
      url: base,
      siteName: 'KoalaGains',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: industrySummary,
    },
  };
};

// ────────────────────────────────────────────────────────────────────────────────
// Common viewport configuration
// ────────────────────────────────────────────────────────────────────────────────

export const commonViewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};
