import { Metadata } from 'next';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { TickerV1Industry } from '@prisma/client';
import { TopGainerWithTicker, TopLoserWithTicker } from '@/types/daily-stock-movers';
import { DailyMoverType } from '@/utils/daily-movers-generation-utils';

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
// Daily stock movers list metadata generator
// ────────────────────────────────────────────────────────────────────────────────

export const generateDailyMoversListMetadata = (country: string, type: DailyMoverType): Metadata => {
  const countryUpper = country.toUpperCase();
  const isGainer = type === DailyMoverType.GAINER;

  const title = isGainer ? `Daily Top Gainers in ${countryUpper} | KoalaGains` : `Daily Top Losers in ${countryUpper} | KoalaGains`;

  const description = isGainer
    ? `Discover today's top-performing stocks in ${countryUpper} with the highest percentage gains. Comprehensive analysis and insights on the best performing stocks in ${countryUpper} markets.`
    : `Track today's worst-performing stocks in ${countryUpper} with the highest percentage losses. Comprehensive analysis and insights on the declining stocks in ${countryUpper} markets.`;

  const canonicalUrl = isGainer
    ? `https://koalagains.com/daily-top-movers/top-gainers/country/${country}`
    : `https://koalagains.com/daily-top-movers/top-losers/country/${country}`;

  const keywords = isGainer
    ? [
        `${countryUpper} top gainers`,
        `${countryUpper} best performing stocks`,
        `${countryUpper} stocks up today`,
        'daily top gainers',
        'stock gainers',
        'market gainers',
        'best stocks today',
        'top performing stocks',
        'stock market analysis',
        'KoalaGains',
      ]
    : [
        `${countryUpper} top losers`,
        `${countryUpper} worst performing stocks`,
        `${countryUpper} stocks down today`,
        'daily top losers',
        'stock losers',
        'market losers',
        'worst stocks today',
        'declining stocks',
        'stock market analysis',
        'KoalaGains',
      ];

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    keywords,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
};

// ────────────────────────────────────────────────────────────────────────────────
// Daily stock mover details metadata generator
// ────────────────────────────────────────────────────────────────────────────────

export const generateStockMoverMetadata = (mover: TopGainerWithTicker | TopLoserWithTicker, type: DailyMoverType, moverId: string): Metadata => {
  const isGainer = type === DailyMoverType.GAINER;
  const typeLabel = isGainer ? 'Gainer' : 'Loser';
  const changeVerb = isGainer ? 'gained' : 'lost';
  const changeDirection = isGainer ? 'up' : 'down';
  const absPercentage = Math.abs(mover.percentageChange).toFixed(2);

  const title = mover.title || `${mover.name} (${mover.symbol}) - Top ${typeLabel} Analysis`;
  const description =
    mover.metaDescription || mover.oneLineExplanation || `${mover.name} ${changeVerb} ${absPercentage}% - Comprehensive analysis and insights`;

  const canonicalUrl = `https://koalagains.com/daily-top-movers/top-${type}s/details/${moverId}`;

  const createdIso = new Date(mover.createdAt).toISOString();

  const keywords = [
    mover.name,
    `${mover.symbol} stock`,
    `${mover.symbol} analysis`,
    `${mover.name} stock analysis`,
    `${mover.name} ${mover.symbol}`,
    `${mover.symbol} ${changeDirection} ${absPercentage}%`,
    `${mover.name} ${changeVerb} ${absPercentage}%`,
    `top ${type}`,
    `stock ${type}`,
    isGainer ? 'best performing stocks' : 'worst performing stocks',
    `daily top ${type}s`,
    'stock movers',
    `market ${type}s`,
    'stock market analysis',
    `${mover.ticker.exchange} stocks`,
    'KoalaGains',
  ];

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'article',
      publishedTime: createdIso,
      modifiedTime: createdIso,
      authors: ['KoalaGains'],
      section: 'Stock Market Analysis',
      tags: keywords,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@koalagains',
      creator: '@koalagains',
    },
    keywords,
  };
};

// ────────────────────────────────────────────────────────────────────────────────
// JSON-LD Structured Data Generators
// ────────────────────────────────────────────────────────────────────────────────

// Generate Article/NewsArticle schema for stock mover details
export const generateStockMoverArticleSchema = (mover: TopGainerWithTicker | TopLoserWithTicker, type: DailyMoverType, moverId: string) => {
  const isGainer = type === DailyMoverType.GAINER;
  const typeLabel = isGainer ? 'Gainer' : 'Loser';
  const absPercentage = Math.abs(mover.percentageChange).toFixed(2);

  const canonicalUrl = `https://koalagains.com/daily-top-movers/top-${type}s/details/${moverId}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: mover.title || `${mover.ticker.name} (${mover.ticker.symbol}) - Top ${typeLabel} Analysis`,
    description:
      mover.metaDescription ||
      mover.oneLineExplanation ||
      `${mover.ticker.name} ${isGainer ? 'gained' : 'lost'} ${absPercentage}% - Comprehensive analysis and insights`,
    image: ['https://koalagains.com/koalagain_logo.png'],
    datePublished: mover.createdAt,
    dateModified: mover.createdAt,
    author: {
      '@type': 'Organization',
      name: 'KoalaGains',
      url: 'https://koalagains.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://koalagains.com/koalagain_logo.png',
      },
    },
    publisher: {
      '@type': 'Organization',
      name: 'KoalaGains',
      url: 'https://koalagains.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://koalagains.com/koalagain_logo.png',
        width: 600,
        height: 60,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    articleSection: 'Stock Market Analysis',
    keywords: [
      mover.ticker.name,
      `${mover.ticker.symbol} stock`,
      `${mover.ticker.symbol} analysis`,
      `${mover.ticker.name} stock analysis`,
      `${mover.ticker.name} ${mover.ticker.symbol}`,
      `${mover.ticker.symbol} ${isGainer ? 'up' : 'down'} ${absPercentage}%`,
      `${mover.ticker.name} ${isGainer ? 'gained' : 'lost'} ${absPercentage}%`,
      `top ${type}`,
      `stock ${type}`,
      isGainer ? 'best performing stocks' : 'worst performing stocks',
      `daily top ${type}s`,
      'stock movers',
      `market ${type}s`,
      'stock market analysis',
      `${mover.ticker.exchange} stocks`,
      'KoalaGains',
      'investment analysis',
      'market insights',
    ].join(', '),
    about: {
      '@type': 'Corporation',
      name: mover.ticker.name,
      tickerSymbol: mover.ticker.symbol,
      exchange: mover.ticker.exchange,
    },
  };
};

export const generateStockMoverBreadcrumbSchema = (mover: TopGainerWithTicker | TopLoserWithTicker, type: DailyMoverType, moverId: string) => {
  const isGainer = type === DailyMoverType.GAINER;
  const slug = isGainer ? 'gainers' : 'losers';
  const canonicalUrl = `https://koalagains.com/daily-top-movers/top-${slug}/details/${moverId}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://koalagains.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: isGainer ? 'Daily Top Gainers' : 'Daily Top Losers',
        item: `https://koalagains.com/daily-top-movers/top-${slug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${mover.ticker.name} (${mover.ticker.symbol})`,
        item: canonicalUrl,
      },
    ],
  };
};

export const generateCountryMoversBreadcrumbSchema = (country: string, type: DailyMoverType) => {
  const isGainer = type === DailyMoverType.GAINER;
  const slug = isGainer ? 'gainers' : 'losers';
  const canonicalUrl = `https://koalagains.com/daily-top-movers/top-${slug}/country/${country}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://koalagains.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: isGainer ? `Top Performing Stocks in ${country.toUpperCase()} Today` : `Worst Performing Stocks in ${country.toUpperCase()} Today`,
        item: canonicalUrl,
      },
    ],
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
