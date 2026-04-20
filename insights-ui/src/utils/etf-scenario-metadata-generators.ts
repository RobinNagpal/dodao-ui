import { Metadata } from 'next';

const SITE_NAME = 'KoalaGains';
const BASE_URL = 'https://koalagains.com';
const LOGO_URL = `${BASE_URL}/koalagain_logo.png`;

function truncateForMeta(text: string, maxLength: number = 155): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

// ────────────────────────────────────────────────────────────────────────────────
// ETF Scenarios Listing (/etf-scenarios)
// ────────────────────────────────────────────────────────────────────────────────

export function generateEtfScenarioListingMetadata(): Metadata {
  const title = `ETF Market Scenarios — Sector & Asset-Class Shock Playbook | ${SITE_NAME}`;
  const description =
    'Browse recurring market scenarios that move specific ETF categories — tech corrections, oil shocks, utilities booms, rate-cycle moves. Each scenario lists winners, losers, historical analogs, and a dated probability outlook.';
  const url = `${BASE_URL}/etf-scenarios`;

  return {
    title,
    description,
    alternates: { canonical: url },
    keywords: [
      'ETF scenarios',
      'sector shock analysis',
      'ETF winners and losers',
      'market scenarios',
      'sector rotation ETFs',
      'ETF outlook',
      'recession ETFs',
      'inflation ETFs',
      'rate cycle ETFs',
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

export function generateEtfScenarioListingJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `ETF Market Scenarios — Sector & Asset-Class Shock Playbook`,
    description: 'Recurring market scenarios that move specific ETF categories, with winners, losers, and dated probability outlooks.',
    url: `${BASE_URL}/etf-scenarios`,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: BASE_URL,
      logo: { '@type': 'ImageObject', url: LOGO_URL },
    },
  };
}

export function generateEtfScenarioListingBreadcrumbJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'ETF Scenarios', item: `${BASE_URL}/etf-scenarios` },
    ],
  };
}

export function generateEtfScenarioListingItemListJsonLd(items: Array<{ slug: string; title: string; scenarioNumber: number }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `${BASE_URL}/etf-scenarios/${item.slug}`,
      name: `${item.scenarioNumber}. ${item.title}`,
    })),
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// ETF Scenario Detail (/etf-scenarios/[slug])
// ────────────────────────────────────────────────────────────────────────────────

interface EtfScenarioDetailMetadataInput {
  title: string;
  slug: string;
  probabilityBucket: string;
  outlookAsOfDate: string;
  metaDescription?: string | null;
  underlyingCause: string;
  createdTime?: string;
  updatedTime?: string;
}

export function generateEtfScenarioDetailMetadata({
  title,
  slug,
  probabilityBucket,
  outlookAsOfDate,
  metaDescription,
  underlyingCause,
  createdTime,
  updatedTime,
}: EtfScenarioDetailMetadataInput): Metadata {
  const year = new Date().getFullYear();
  const canonicalUrl = `${BASE_URL}/etf-scenarios/${slug}`;
  const bucketLabel = probabilityBucketLabel(probabilityBucket);

  const description =
    metaDescription?.trim() ||
    truncateForMeta(
      `${title} — ETF scenario analysis: ${underlyingCause.replace(/\*\*/g, '').replace(/\n+/g, ' ')}. Probability ${bucketLabel} as of ${outlookAsOfDate}.`
    );

  return {
    title: `${title} — ETF Scenario Analysis (${year}) | ${SITE_NAME}`,
    description,
    alternates: { canonical: canonicalUrl },
    keywords: [title, `${title} ETFs`, `${title} winners`, `${title} losers`, 'ETF scenarios', 'sector rotation', 'market scenario analysis', SITE_NAME],
    openGraph: {
      title: `${title} — ETF Scenario Analysis | ${SITE_NAME}`,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime: createdTime ?? updatedTime,
      modifiedTime: updatedTime ?? createdTime,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — ETF Scenario Analysis | ${SITE_NAME}`,
      description,
    },
  };
}

export function generateEtfScenarioDetailArticleJsonLd({
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
  const canonicalUrl = `${BASE_URL}/etf-scenarios/${slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${title} — ETF Scenario Analysis`,
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
    articleSection: 'ETF Scenarios',
  };
}

export function generateEtfScenarioDetailBreadcrumbJsonLd({ title, slug }: { title: string; slug: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'ETF Scenarios', item: `${BASE_URL}/etf-scenarios` },
      { '@type': 'ListItem', position: 3, name: title, item: `${BASE_URL}/etf-scenarios/${slug}` },
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

export function pricedInBucketLabel(bucket: string): string {
  switch (bucket) {
    case 'NOT_PRICED_IN':
      return 'Not priced in';
    case 'PARTIALLY_PRICED_IN':
      return 'Partially priced in';
    case 'MOSTLY_PRICED_IN':
      return 'Mostly priced in';
    case 'FULLY_PRICED_IN':
      return 'Fully priced in';
    case 'OVER_PRICED_IN':
      return 'Over-priced in';
    default:
      return bucket;
  }
}
