import { Metadata } from 'next';
import type { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import type { EtfFundCategoryHierarchy } from '@/utils/etf-categorization-utils';
import { etfBasePath, etfBrowseDetailPath, etfBrowsePath, etfCountryDisplayName, etfGroupCategoryPath } from '@/utils/etf-country-route-utils';
import type { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';

const SITE_NAME = 'KoalaGains';
const BASE_URL = 'https://koalagains.com';
const LOGO_URL = `${BASE_URL}/koalagain_logo.png`;

const DEFAULT_LISTING_KEYWORDS = [
  'ETFs',
  'ETF analysis',
  'ETF comparison',
  'exchange-traded funds',
  'ETF performance',
  'ETF expense ratio',
  'ETF risk analysis',
  SITE_NAME,
];

interface ListingMetadataInput {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}

function buildListingMetadata({ title, description, path, keywords }: ListingMetadataInput): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const desc = truncateForMeta(description);
  const url = `${BASE_URL}${path}`;
  return {
    title: fullTitle,
    description: desc,
    alternates: { canonical: url },
    keywords: keywords ?? DEFAULT_LISTING_KEYWORDS,
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: SITE_NAME,
      type: 'website',
      images: [LOGO_URL],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
      images: [LOGO_URL],
    },
  };
}

function listingBaseCrumb(country: EtfSupportedCountry): { name: string; href: string } {
  return { name: `${etfCountryDisplayName(country)} ETFs`, href: etfBasePath(country) };
}

function toAbsoluteUrl(href: string): string {
  return href.startsWith('http') ? href : `${BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
}

/**
 * Build a Schema.org BreadcrumbList JSON-LD payload from the same array of crumbs
 * we render with `<Breadcrumbs />`. The visible breadcrumb component renders Home
 * as a separate icon, so we prepend a Home item here to keep the JSON-LD trail
 * aligned with what users see.
 */
export function generateBreadcrumbJsonLdFromCrumbs(crumbs: ReadonlyArray<Pick<BreadcrumbsOjbect, 'name' | 'href'>>) {
  const items = [{ '@type': 'ListItem' as const, position: 1, name: 'Home', item: BASE_URL }];
  crumbs.forEach((c, idx) => {
    items.push({ '@type': 'ListItem' as const, position: idx + 2, name: c.name, item: toAbsoluteUrl(c.href) });
  });
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

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
      images: [LOGO_URL],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [LOGO_URL],
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
      images: [LOGO_URL],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${etfName} (${symbol}) ETF Analysis & Key Metrics | ${SITE_NAME}`,
      description,
      images: [LOGO_URL],
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

export function generateEtfDetailBreadcrumbJsonLd({
  etfName,
  symbol,
  exchange,
  groupKey,
  groupName,
  fundCategoryName,
  fundCategorySlug,
}: {
  etfName: string;
  symbol: string;
  exchange: string;
} & EtfFundCategoryHierarchy) {
  const items: Array<{ '@type': 'ListItem'; position: number; name: string; item: string }> = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'US ETFs', item: `${BASE_URL}/etfs` },
  ];
  if (groupKey && groupName) {
    items.push({ '@type': 'ListItem', position: items.length + 1, name: groupName, item: `${BASE_URL}/etfs/groups/${groupKey}` });
    if (fundCategoryName && fundCategorySlug) {
      items.push({
        '@type': 'ListItem',
        position: items.length + 1,
        name: fundCategoryName,
        item: `${BASE_URL}/etfs/groups/${groupKey}/categories/${fundCategorySlug}`,
      });
    }
  }
  items.push({ '@type': 'ListItem', position: items.length + 1, name: `${etfName} (${symbol})`, item: `${BASE_URL}/etfs/${exchange}/${symbol}` });
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
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
      images: [LOGO_URL],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${etfName} (${symbol}) ${categoryName} Analysis | ${SITE_NAME}`,
      description: shortDesc,
      images: [LOGO_URL],
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

export function generateEtfCategoryBreadcrumbJsonLd(
  input: { etfName: string; symbol: string; exchange: string; categoryName: string; categorySlug: string } & EtfFundCategoryHierarchy
) {
  const { etfName: _etfName, symbol, exchange, categoryName, categorySlug, groupKey, groupName, fundCategoryName, fundCategorySlug } = input;
  const items: Array<{ '@type': 'ListItem'; position: number; name: string; item: string }> = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'US ETFs', item: `${BASE_URL}/etfs` },
  ];
  if (groupKey && groupName) {
    items.push({ '@type': 'ListItem', position: items.length + 1, name: groupName, item: `${BASE_URL}/etfs/groups/${groupKey}` });
    if (fundCategoryName && fundCategorySlug) {
      items.push({
        '@type': 'ListItem',
        position: items.length + 1,
        name: fundCategoryName,
        item: `${BASE_URL}/etfs/groups/${groupKey}/categories/${fundCategorySlug}`,
      });
    }
  }
  items.push({ '@type': 'ListItem', position: items.length + 1, name: symbol, item: `${BASE_URL}/etfs/${exchange}/${symbol}` });
  items.push({
    '@type': 'ListItem',
    position: items.length + 1,
    name: categoryName,
    item: `${BASE_URL}/etfs/${exchange}/${symbol}/${categorySlug}`,
  });
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// ETF Listing Sub-Pages (countries, groups, asset-classes, providers)
// ────────────────────────────────────────────────────────────────────────────────

export function generateEtfCountryListingMetadata(country: EtfSupportedCountry): Metadata {
  const countryName = etfCountryDisplayName(country);
  return buildListingMetadata({
    title: `${countryName} ETFs — Exchange Traded Funds Analysis & Insights`,
    description: `Browse ${countryName} exchange-traded funds with AI-driven analysis on performance, risk, cost efficiency, expense ratios, dividends, and portfolio holdings.`,
    path: etfBasePath(country),
  });
}

export function generateEtfCountryListingBreadcrumbJsonLd(country: EtfSupportedCountry) {
  return generateBreadcrumbJsonLdFromCrumbs([listingBaseCrumb(country)]);
}

interface EtfGroupDetailMetadataInput {
  country: EtfSupportedCountry;
  groupKey: string;
  groupName: string;
}

export function generateEtfGroupDetailMetadata({ country, groupKey, groupName }: EtfGroupDetailMetadataInput): Metadata {
  const countryName = etfCountryDisplayName(country);
  return buildListingMetadata({
    title: `${groupName} ${countryName} ETFs`,
    description: `Browse ${countryName} ETFs in the ${groupName} group organised by analysis category, with the top-rated ETFs in each category.`,
    path: etfBrowseDetailPath(country, 'groups', groupKey),
  });
}

export function generateEtfGroupDetailBreadcrumbJsonLd({ country, groupKey, groupName }: EtfGroupDetailMetadataInput) {
  return generateBreadcrumbJsonLdFromCrumbs([listingBaseCrumb(country), { name: groupName, href: etfBrowseDetailPath(country, 'groups', groupKey) }]);
}

interface EtfGroupCategoryListingMetadataInput {
  country: EtfSupportedCountry;
  groupKey: string;
  groupName: string;
  categoryName: string;
}

export function generateEtfGroupCategoryListingMetadata({ country, groupKey, groupName, categoryName }: EtfGroupCategoryListingMetadataInput): Metadata {
  const countryName = etfCountryDisplayName(country);
  return buildListingMetadata({
    title: `${categoryName} ${countryName} ETFs`,
    description: `Browse ${countryName} ETFs in the ${categoryName} category (part of ${groupName}) with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`,
    path: etfGroupCategoryPath(country, groupKey, categoryName),
  });
}

export function generateEtfGroupCategoryListingBreadcrumbJsonLd({ country, groupKey, groupName, categoryName }: EtfGroupCategoryListingMetadataInput) {
  return generateBreadcrumbJsonLdFromCrumbs([
    listingBaseCrumb(country),
    { name: groupName, href: etfBrowseDetailPath(country, 'groups', groupKey) },
    { name: categoryName, href: etfGroupCategoryPath(country, groupKey, categoryName) },
  ]);
}

export function generateEtfAssetClassesIndexMetadata(country: EtfSupportedCountry): Metadata {
  const countryName = etfCountryDisplayName(country);
  return buildListingMetadata({
    title: `${countryName} ETFs by Asset Class`,
    description: `Browse ${countryName} ETFs by asset class — Equity, Fixed Income, Commodity, Alternatives, and more. Each card highlights the top-rated ETFs in that class.`,
    path: etfBrowsePath(country, 'asset-classes'),
  });
}

export function generateEtfAssetClassesIndexBreadcrumbJsonLd(country: EtfSupportedCountry) {
  return generateBreadcrumbJsonLdFromCrumbs([listingBaseCrumb(country), { name: 'Asset Classes', href: etfBrowsePath(country, 'asset-classes') }]);
}

interface EtfAssetClassDetailMetadataInput {
  country: EtfSupportedCountry;
  assetClass: string;
  assetClassSlug: string;
}

export function generateEtfAssetClassDetailMetadata({ country, assetClass, assetClassSlug }: EtfAssetClassDetailMetadataInput): Metadata {
  const countryName = etfCountryDisplayName(country);
  return buildListingMetadata({
    title: `${assetClass} ${countryName} ETFs`,
    description: `Browse ${countryName} ETFs in the ${assetClass} asset class with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`,
    path: etfBrowseDetailPath(country, 'asset-classes', assetClassSlug),
  });
}

export function generateEtfAssetClassDetailBreadcrumbJsonLd({ country, assetClass, assetClassSlug }: EtfAssetClassDetailMetadataInput) {
  return generateBreadcrumbJsonLdFromCrumbs([
    listingBaseCrumb(country),
    { name: 'Asset Classes', href: etfBrowsePath(country, 'asset-classes') },
    { name: assetClass, href: etfBrowseDetailPath(country, 'asset-classes', assetClassSlug) },
  ]);
}

export function generateEtfProvidersIndexMetadata(country: EtfSupportedCountry): Metadata {
  const countryName = etfCountryDisplayName(country);
  return buildListingMetadata({
    title: `${countryName} ETFs by Provider`,
    description: `Browse ${countryName} ETFs grouped by issuer. Each card highlights the top-rated ETFs from that provider.`,
    path: etfBrowsePath(country, 'providers'),
  });
}

export function generateEtfProvidersIndexBreadcrumbJsonLd(country: EtfSupportedCountry) {
  return generateBreadcrumbJsonLdFromCrumbs([listingBaseCrumb(country), { name: 'Providers', href: etfBrowsePath(country, 'providers') }]);
}

interface EtfProviderDetailMetadataInput {
  country: EtfSupportedCountry;
  providerCanonical: string;
  providerSlug: string;
}

export function generateEtfProviderDetailMetadata({ country, providerCanonical, providerSlug }: EtfProviderDetailMetadataInput): Metadata {
  const countryName = etfCountryDisplayName(country);
  return buildListingMetadata({
    title: `${providerCanonical} ${countryName} ETFs`,
    description: `Browse ${countryName} ETFs issued by ${providerCanonical} with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`,
    path: etfBrowseDetailPath(country, 'providers', providerSlug),
  });
}

export function generateEtfProviderDetailBreadcrumbJsonLd({ country, providerCanonical, providerSlug }: EtfProviderDetailMetadataInput) {
  return generateBreadcrumbJsonLdFromCrumbs([
    listingBaseCrumb(country),
    { name: 'Providers', href: etfBrowsePath(country, 'providers') },
    { name: providerCanonical, href: etfBrowseDetailPath(country, 'providers', providerSlug) },
  ]);
}

// ────────────────────────────────────────────────────────────────────────────────
// ETF Holdings Sub-page (/etfs/[exchange]/[etf]/holdings)
// ────────────────────────────────────────────────────────────────────────────────

interface EtfHoldingsMetadataInput {
  etfName: string;
  symbol: string;
  exchange: string;
  createdTime?: string;
  updatedTime?: string;
}

export function generateEtfHoldingsMetadata({ etfName, symbol, exchange, createdTime, updatedTime }: EtfHoldingsMetadataInput): Metadata {
  const year = new Date().getFullYear();
  const canonicalUrl = `${BASE_URL}/etfs/${exchange}/${symbol}/holdings`;
  const description = truncateForMeta(
    `Top reported holdings for ${etfName} (${symbol}) ETF — portfolio weights, sector exposure, and underlying positions on ${exchange}.`
  );
  const title = `${etfName} (${symbol}) Holdings — Portfolio & Top Positions (${year}) | ${SITE_NAME}`;
  const ogTitle = `${etfName} (${symbol}) Holdings & Portfolio Weights | ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    keywords: [
      `${etfName} holdings`,
      `${symbol} ETF holdings`,
      `${symbol} portfolio`,
      `${symbol} top holdings`,
      `${symbol} sector exposure`,
      `${etfName} portfolio weights`,
      `${exchange} ETFs`,
      'ETF holdings',
      'ETF portfolio composition',
      'exchange-traded funds',
      SITE_NAME,
    ],
    openGraph: {
      title: ogTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime: createdTime,
      modifiedTime: updatedTime ?? createdTime,
      images: [LOGO_URL],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [LOGO_URL],
    },
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// ETF Competition Sub-page (/etfs/[exchange]/[etf]/competition)
// ────────────────────────────────────────────────────────────────────────────────

interface EtfCompetitionMetadataInput {
  etfName: string;
  symbol: string;
  exchange: string;
  createdTime?: string;
  updatedTime?: string;
}

export function generateEtfCompetitionMetadata({ etfName, symbol, exchange, createdTime, updatedTime }: EtfCompetitionMetadataInput): Metadata {
  const year = new Date().getFullYear();
  const canonicalUrl = `${BASE_URL}/etfs/${exchange}/${symbol}/competition`;
  const description = truncateForMeta(
    `Peer-vs-peer competitive analysis of ${etfName} (${symbol}). Compare against its closest peer ETFs on past returns, future outlook, cost efficiency, and risk.`
  );
  const title = `${etfName} (${symbol}) Competitive Analysis & Peer Comparison (${year}) | ${SITE_NAME}`;
  const ogTitle = `${etfName} (${symbol}) Competitive Analysis | ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    keywords: [
      `${etfName} competition`,
      `${symbol} ETF peers`,
      `${symbol} vs peer ETFs`,
      `${symbol} competitor comparison`,
      `${etfName} peer comparison`,
      `${exchange} ETFs`,
      'ETF competitive analysis',
      'ETF peer comparison',
      'exchange-traded funds',
      SITE_NAME,
    ],
    openGraph: {
      title: ogTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime: createdTime,
      modifiedTime: updatedTime ?? createdTime,
      images: [LOGO_URL],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [LOGO_URL],
    },
  };
}

export function generateEtfCompetitionArticleJsonLd({
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
  const canonicalUrl = `${BASE_URL}/etfs/${exchange}/${symbol}/competition`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${etfName} (${symbol}) Competitive Analysis & Peer Comparison`,
    description: `Peer-vs-peer competitive analysis of ${etfName} (${symbol}) on ${exchange} — past returns, future outlook, cost efficiency, and risk vs closest peer ETFs.`,
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
    articleSection: 'ETF Competitive Analysis',
  };
}
