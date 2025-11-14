import { Metadata } from 'next';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { TickerV1Industry } from '@prisma/client';

// ────────────────────────────────────────────────────────────────────────────────
// Base metadata for US stocks page
// ────────────────────────────────────────────────────────────────────────────────

export const generateUSStocksMetadata = (): Metadata => {
  return {
    title: 'US Stocks by Industry | KoalaGains',
    description: 'Discover US stocks grouped by industry and sub-industry across NASDAQ, NYSE, and NYSEAMERICAN. See top tickers with detailed reports.',
    keywords: [
      'US stocks',
      'stocks by industry',
      'NASDAQ',
      'NYSE',
      'AMEX',
      'NYSEAMERICAN',
      'stock analysis',
      'AI stock insights',
      'investment research',
      'top performing stocks',
      'KoalaGains',
    ],
    openGraph: {
      title: 'US Stocks by Industry | KoalaGains',
      description: 'Discover US stocks grouped by industry and sub-industry across NASDAQ, NYSE, and AMEX. See top tickers with detailed reports.',
      url: 'https://koalagains.com/stocks',
      siteName: 'KoalaGains',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'US Stocks by Industry | KoalaGains',
      description: 'Discover US stocks grouped by industry and sub-industry across NASDAQ, NYSE, and AMEX. See top tickers with detailed reports.',
    },
    alternates: { canonical: 'https://koalagains.com/stocks' },
  };
};

// ────────────────────────────────────────────────────────────────────────────────
// Country stocks metadata generator
// ────────────────────────────────────────────────────────────────────────────────

export const generateCountryStocksMetadata = (countryName: string): Metadata => {
  return {
    title: `${countryName} Stocks by Industry | KoalaGains`,
    description: `Discover ${countryName} stocks grouped by industry and sub-industry. See top tickers with detailed reports and AI insights.`,
    keywords: [
      `${countryName} stocks`,
      'stocks by industry',
      'stock analysis',
      'AI stock insights',
      'investment research',
      'top performing stocks',
      'KoalaGains',
    ],
    openGraph: {
      title: `${countryName} Stocks by Industry | KoalaGains`,
      description: `Discover ${countryName} stocks grouped by industry and sub-industry. See top tickers with detailed reports and AI insights.`,
      url: `https://koalagains.com/stocks/countries/${encodeURIComponent(countryName)}`,
      siteName: 'KoalaGains',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${countryName} Stocks by Industry | KoalaGains`,
      description: `Discover ${countryName} stocks grouped by industry and sub-industry. See top tickers with detailed reports and AI insights.`,
    },
    alternates: {
      canonical: `https://koalagains.com/stocks/countries/${encodeURIComponent(countryName)}`,
    },
  };
};

// ────────────────────────────────────────────────────────────────────────────────
// Industry stocks metadata generator (US)
// ────────────────────────────────────────────────────────────────────────────────

export const generateIndustryStocksMetadata = async (industryKey: string): Promise<Metadata> => {
  let industryName = industryKey;
  let industrySummary = `Browse ${industryKey} stocks and sub-industries across US exchanges. View reports, metrics, and AI-driven insights.`;

  try {
    const res = await fetch(`${getBaseUrl()}/api/industries/${industryKey}`, { next: { revalidate: 3600 } });
    const data = (await res.json()) as TickerV1Industry;
    industryName = data.name ?? industryKey;
    industrySummary = data.summary ?? industrySummary;
  } catch {
    // fallbacks already set
  }

  const base = `${getBaseUrlForServerSidePages()}/stocks/industries/${encodeURIComponent(industryKey)}`;
  return {
    title: `${industryName} Stocks | KoalaGains`,
    description: industrySummary,
    keywords: [
      `${industryName} stocks`,
      `${industryName} companies`,
      `${industryName} sub-industries`,
      'US stocks',
      'NASDAQ',
      'NYSE',
      'AMEX',
      'Stock analysis',
      'Financial reports',
      'Investment research',
      'KoalaGains',
    ],
    openGraph: {
      title: `${industryName} Stocks | KoalaGains`,
      description: industrySummary,
      url: base,
      siteName: 'KoalaGains',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${industryName} Stocks | KoalaGains`,
      description: industrySummary,
    },
    alternates: { canonical: base },
  };
};

// ────────────────────────────────────────────────────────────────────────────────
// Country industry stocks metadata generator
// ────────────────────────────────────────────────────────────────────────────────

export const generateCountryIndustryStocksMetadata = async (countryName: string, industryKey: string): Promise<Metadata> => {
  // Fetch industry data to get name and summary
  let industryName = industryKey; // fallback to key
  let industrySummary = `Browse ${industryKey} stocks and sub-industries across ${countryName} exchanges. View reports, metrics, and AI-driven insights to guide your investments.`; // fallback description

  try {
    const response = await fetch(`${getBaseUrl()}/api/industries/${industryKey}`);
    const industryData: TickerV1Industry = await response.json();
    industryName = industryData.name;
    industrySummary = industryData.summary;
  } catch (error) {
    console.log('Error fetching industry data for metadata:', error);
  }

  const base = `https://koalagains.com/stocks/countries/${encodeURIComponent(countryName)}/industries/${industryKey}`;
  return {
    title: `${industryName} Stocks in ${countryName} | KoalaGains`,
    description: industrySummary,
    alternates: {
      canonical: base,
    },
    keywords: [
      `${industryName} stocks`,
      `${industryName} companies`,
      `${industryName} sub-industries`,
      `${countryName} stocks`,
      'KoalaGains',
      'Stock analysis',
      'Financial reports',
      'Investment research',
    ],
    openGraph: {
      title: `${industryName} Stocks in ${countryName} | KoalaGains`,
      description: industrySummary,
      url: base,
      siteName: 'KoalaGains',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${industryName} Stocks in ${countryName} | KoalaGains`,
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
