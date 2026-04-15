import { Metadata } from 'next';

const SITE_NAME = 'KoalaGains';
const BASE_URL = 'https://koalagains.com';
const LOGO_URL = `${BASE_URL}/koalagain_logo.png`;

function truncateForMeta(text: string, maxLength: number = 155): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

// ────────────────────────────────────────────────────────────────────────────────
// ETF Listing Page (/etfs)
// ────────────────────────────────────────────────────────────────────────────────

export function generateEtfListingMetadata(): Metadata {
  const title = `US ETFs — Exchange Traded Funds Analysis & Insights | ${SITE_NAME}`;
  const description =
    'Browse and compare US exchange-traded funds with AI-driven analysis on performance, risk, cost efficiency, expense ratios, dividends, and portfolio holdings. Filter by AUM, P/E, beta, and more.';
  const url = `${BASE_URL}/etfs`;

  return {
    title,
    description,
    alternates: { canonical: url },
    keywords: [
      'US ETFs',
      'ETF analysis',
      'ETF comparison',
      'exchange-traded funds',
      'ETF performance',
      'ETF expense ratio',
      'ETF risk analysis',
      'ETF dividend yield',
      'best ETFs',
      'ETF screener',
      SITE_NAME,
    ],
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export function generateEtfListingJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `US ETFs — Exchange Traded Funds Analysis`,
    description: 'Browse and compare US exchange-traded funds with AI-driven analysis on performance, risk, and cost efficiency.',
    url: `${BASE_URL}/etfs`,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: BASE_URL,
      logo: { '@type': 'ImageObject', url: LOGO_URL },
    },
  };
}

export function generateEtfListingBreadcrumbJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'US ETFs', item: `${BASE_URL}/etfs` },
    ],
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// ETF Detail Page (/etfs/[exchange]/[etf])
// ────────────────────────────────────────────────────────────────────────────────

interface EtfDetailMetadataInput {
  etfName: string;
  symbol: string;
  exchange: string;
  createdTime?: string;
  updatedTime?: string;
}

export function generateEtfDetailMetadata({ etfName, symbol, exchange, createdTime, updatedTime }: EtfDetailMetadataInput): Metadata {
  const year = new Date().getFullYear();
  const canonicalUrl = `${BASE_URL}/etfs/${exchange}/${symbol}`;

  const description = truncateForMeta(
    `${etfName} (${symbol}) analysis — performance returns, risk assessment, cost efficiency, expense ratio, and portfolio insights on ${exchange}.`
  );

  const keywords = [
    etfName,
    `${symbol} ETF`,
    `${etfName} analysis`,
    `${symbol} ETF performance`,
    `${symbol} ETF risk analysis`,
    `${symbol} expense ratio`,
    `${symbol} dividend yield`,
    `${exchange} ETFs`,
    'ETF performance analysis',
    'ETF risk assessment',
    'ETF cost efficiency',
    'exchange-traded funds',
    SITE_NAME,
  ];

  return {
    title: `${etfName} (${symbol}) ETF Analysis & Key Metrics (${year}) | ${SITE_NAME}`,
    description,
    alternates: { canonical: canonicalUrl },
    keywords,
    openGraph: {
      title: `${etfName} (${symbol}) ETF Analysis & Key Metrics | ${SITE_NAME}`,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime: createdTime ?? updatedTime,
      modifiedTime: updatedTime ?? createdTime,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${etfName} (${symbol}) ETF Analysis & Key Metrics | ${SITE_NAME}`,
      description,
    },
  };
}

export function generateEtfDetailArticleJsonLd({
  etfName,
  symbol,
  exchange,
  publishedDate,
  modifiedDate,
}: {
  etfName: string;
  symbol: string;
  exchange: string;
  publishedDate: string;
  modifiedDate: string;
}) {
  const canonicalUrl = `${BASE_URL}/etfs/${exchange}/${symbol}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${etfName} (${symbol}) ETF Analysis — Performance, Risk & Cost`,
    description: `In-depth analysis of ${etfName} ETF covering performance returns, risk metrics, cost efficiency, and portfolio composition on ${exchange}.`,
    image: [LOGO_URL],
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: { '@type': 'Organization', name: SITE_NAME, url: BASE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: BASE_URL,
      logo: { '@type': 'ImageObject', url: LOGO_URL, width: 600, height: 60 },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    articleSection: 'ETF Analysis',
    keywords: [
      etfName,
      `${symbol} ETF`,
      `${etfName} analysis`,
      `${symbol} performance`,
      `${symbol} risk`,
      `${symbol} expense ratio`,
      'ETF analysis',
      SITE_NAME,
    ],
  };
}

export function generateEtfDetailBreadcrumbJsonLd({ etfName, symbol, exchange }: { etfName: string; symbol: string; exchange: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'US ETFs', item: `${BASE_URL}/etfs` },
      { '@type': 'ListItem', position: 3, name: `${etfName} (${symbol})`, item: `${BASE_URL}/etfs/${exchange}/${symbol}` },
    ],
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// ETF Category Detail Pages (/etfs/[exchange]/[etf]/[category])
// ────────────────────────────────────────────────────────────────────────────────

interface EtfCategoryMetadataInput {
  etfName: string;
  symbol: string;
  exchange: string;
  categoryName: string;
  categorySlug: string;
  description: string;
  keywords: string[];
  createdTime?: string;
  updatedTime?: string;
}

export function generateEtfCategoryMetadata(input: EtfCategoryMetadataInput): Metadata {
  const { etfName, symbol, exchange, categoryName, categorySlug, description, keywords, createdTime, updatedTime } = input;
  const year = new Date().getFullYear();
  const canonicalUrl = `${BASE_URL}/etfs/${exchange}/${symbol}/${categorySlug}`;
  const shortDesc = truncateForMeta(description);

  return {
    title: `${etfName} (${symbol}) ${categoryName} Analysis (${year}) | ${SITE_NAME}`,
    description: shortDesc,
    alternates: { canonical: canonicalUrl },
    keywords,
    openGraph: {
      title: `${etfName} (${symbol}) ${categoryName} Analysis | ${SITE_NAME}`,
      description: shortDesc,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime: createdTime,
      modifiedTime: updatedTime,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${etfName} (${symbol}) ${categoryName} Analysis | ${SITE_NAME}`,
      description: shortDesc,
    },
  };
}

export function generateEtfCategoryArticleJsonLd(input: {
  etfName: string;
  symbol: string;
  exchange: string;
  categoryName: string;
  categorySlug: string;
  publishedDate: string;
  modifiedDate: string;
}) {
  const { etfName, symbol, exchange, categoryName, categorySlug, publishedDate, modifiedDate } = input;
  const canonicalUrl = `${BASE_URL}/etfs/${exchange}/${symbol}/${categorySlug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${etfName} (${symbol}) ${categoryName} Analysis`,
    description: `${categoryName} analysis for ${etfName} (${symbol}) ETF on ${exchange}.`,
    image: [LOGO_URL],
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: { '@type': 'Organization', name: SITE_NAME, url: BASE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: BASE_URL,
      logo: { '@type': 'ImageObject', url: LOGO_URL, width: 600, height: 60 },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    articleSection: 'ETF Analysis',
  };
}

export function generateEtfCategoryBreadcrumbJsonLd(input: { etfName: string; symbol: string; exchange: string; categoryName: string; categorySlug: string }) {
  const { etfName, symbol, exchange, categoryName, categorySlug } = input;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'US ETFs', item: `${BASE_URL}/etfs` },
      { '@type': 'ListItem', position: 3, name: `${etfName} (${symbol})`, item: `${BASE_URL}/etfs/${exchange}/${symbol}` },
      { '@type': 'ListItem', position: 4, name: categoryName, item: `${BASE_URL}/etfs/${exchange}/${symbol}/${categorySlug}` },
    ],
  };
}
