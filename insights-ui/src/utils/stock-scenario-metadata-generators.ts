import { Metadata } from 'next';

const SITE_NAME = 'KoalaGains';
const BASE_URL = 'https://koalagains.com';
const LOGO_URL = `${BASE_URL}/koalagain_logo.png`;

function truncateForMeta(text: string, maxLength: number = 155): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

// ────────────────────────────────────────────────────────────────────────────────
// Stock Scenarios Listing (/stock-scenarios)
// ────────────────────────────────────────────────────────────────────────────────

export function generateStockScenarioListingMetadata(): Metadata {
  const title = `Stock Market Scenarios — Sector Shock Playbook (Global) | ${SITE_NAME}`;
  const description =
    'Recurring market scenarios that move specific stock baskets — tech corrections, oil shocks, rate-cycle moves, regional stresses. Filter by country to see winners, losers, and most-exposed tickers on that market.';
  const url = `${BASE_URL}/stock-scenarios`;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    keywords: [
      'stock scenarios',
      'sector shock analysis',
      'stock winners and losers',
      'market scenarios',
      'sector rotation',
      'stock outlook',
      'recession stocks',
      'inflation stocks',
      'rate cycle stocks',
      'global stock analysis',
      SITE_NAME,
    ],
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      images: [{ url: LOGO_URL }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [LOGO_URL],
    },
  };
}

export function generateStockScenarioListingJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Stock Market Scenarios — Sector Shock Playbook',
    description:
      'Recurring market scenarios that move specific stock baskets, with winners, losers, and dated probability outlooks across supported countries.',
    url: `${BASE_URL}/stock-scenarios`,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: BASE_URL,
      logo: { '@type': 'ImageObject', url: LOGO_URL },
    },
  };
}

export function generateStockScenarioListingBreadcrumbJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Stock Scenarios', item: `${BASE_URL}/stock-scenarios` },
    ],
  };
}

export function generateStockScenarioListingItemListJsonLd(items: Array<{ slug: string; title: string; scenarioNumber: number }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `${BASE_URL}/stock-scenarios/${item.slug}`,
      name: `${item.scenarioNumber}. ${item.title}`,
    })),
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// Stock Scenario Detail (/stock-scenarios/[slug])
// ────────────────────────────────────────────────────────────────────────────────

interface StockScenarioDetailMetadataInput {
  title: string;
  slug: string;
  probabilityBucket: string;
  outlookAsOfDate: string;
  metaDescription?: string | null;
  underlyingCause: string;
  createdTime?: string;
  updatedTime?: string;
}

export function generateStockScenarioDetailMetadata({
  title,
  slug,
  probabilityBucket,
  outlookAsOfDate,
  metaDescription,
  underlyingCause,
  createdTime,
  updatedTime,
}: StockScenarioDetailMetadataInput): Metadata {
  const year = new Date().getFullYear();
  const canonicalUrl = `${BASE_URL}/stock-scenarios/${slug}`;
  const bucketLabel = probabilityBucketLabel(probabilityBucket);

  const description =
    metaDescription?.trim() ||
    truncateForMeta(
      `${title} — stock scenario analysis: ${underlyingCause.replace(/\*\*/g, '').replace(/\n+/g, ' ')}. Probability ${bucketLabel} as of ${outlookAsOfDate}.`
    );

  return {
    title: `${title} — Stock Scenario Analysis (${year}) | ${SITE_NAME}`,
    description,
    alternates: { canonical: canonicalUrl },
    robots: { index: true, follow: true },
    keywords: [title, `${title} stocks`, `${title} winners`, `${title} losers`, 'stock scenarios', 'sector rotation', 'market scenario analysis', SITE_NAME],
    openGraph: {
      title: `${title} — Stock Scenario Analysis | ${SITE_NAME}`,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime: createdTime ?? updatedTime,
      modifiedTime: updatedTime ?? createdTime,
      authors: [SITE_NAME],
      section: 'Stock Scenarios',
      images: [{ url: LOGO_URL }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — Stock Scenario Analysis | ${SITE_NAME}`,
      description,
      images: [LOGO_URL],
    },
  };
}

export function generateStockScenarioDetailArticleJsonLd({
  title,
  slug,
  underlyingCause,
  publishedDate,
  modifiedDate,
}: {
  title: string;
  slug: string;
  underlyingCause: string;
  publishedDate: string;
  modifiedDate: string;
}) {
  const canonicalUrl = `${BASE_URL}/stock-scenarios/${slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${title} — Stock Scenario Analysis`,
    description: truncateForMeta(underlyingCause.replace(/\*\*/g, '').replace(/\n+/g, ' '), 300),
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
    articleSection: 'Stock Scenarios',
  };
}

export function generateStockScenarioDetailBreadcrumbJsonLd({ title, slug }: { title: string; slug: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Stock Scenarios', item: `${BASE_URL}/stock-scenarios` },
      { '@type': 'ListItem', position: 3, name: title, item: `${BASE_URL}/stock-scenarios/${slug}` },
    ],
  };
}

export function probabilityBucketLabel(bucket: string): string {
  switch (bucket) {
    case 'HIGH':
      return 'High (>40%)';
    case 'MEDIUM':
      return 'Medium (20–40%)';
    case 'LOW':
      return 'Low (<20%)';
    default:
      return bucket;
  }
}

export function directionLabel(direction: string): string {
  switch (direction) {
    case 'UPSIDE':
      return 'Upside';
    case 'DOWNSIDE':
      return 'Downside';
    default:
      return direction;
  }
}

export function timeframeLabel(timeframe: string): string {
  switch (timeframe) {
    case 'FUTURE':
      return 'Future';
    case 'IN_PROGRESS':
      return 'In progress';
    case 'PAST':
      return 'Already happened';
    default:
      return timeframe;
  }
}
