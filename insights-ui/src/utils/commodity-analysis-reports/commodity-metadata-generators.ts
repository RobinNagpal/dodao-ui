import { CommodityAnalysisCategory, COMMODITY_CATEGORY_NAMES, COMMODITY_CATEGORY_TO_PATH } from '@/types/commodity/commodity-analysis-types';
import type { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { Metadata } from 'next';

/**
 * SEO metadata + Schema.org JSON-LD generators for the commodity report pages,
 * mirroring `etf-metadata-generators.ts`. Each page gets:
 *   - rich `Metadata` (title, description, canonical, keywords, OpenGraph, Twitter)
 *   - an `Article`/`CollectionPage` JSON-LD payload
 *   - a `BreadcrumbList` JSON-LD payload aligned with the visible `<Breadcrumbs>`
 */

const SITE_NAME = 'KoalaGains';
const BASE_URL = 'https://koalagains.com';
const LOGO_URL = `${BASE_URL}/koalagain_logo.png`;

const SCORED_CATEGORY_PHRASE = 'supply & demand, price & value, volatility & risk, and future outlook';

function truncateForMeta(text: string, maxLength: number = 155): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

function toAbsoluteUrl(href: string): string {
  return href.startsWith('http') ? href : `${BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
}

/**
 * Build a Schema.org BreadcrumbList JSON-LD payload from the same crumbs we render
 * with `<Breadcrumbs />`. The visible component renders Home as a separate icon, so
 * we prepend a Home item here to keep the JSON-LD trail aligned with what users see.
 */
export function generateCommodityBreadcrumbJsonLdFromCrumbs(crumbs: ReadonlyArray<Pick<BreadcrumbsOjbect, 'name' | 'href'>>) {
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

// ────────────────────────────────────────────────────────────────────────────────
// Commodities Listing Page (/commodities)
// ────────────────────────────────────────────────────────────────────────────────

export function generateCommodityListingMetadata(): Metadata {
  const title = `Commodities — Supply, Price, Volatility & Outlook Analysis | ${SITE_NAME}`;
  const description = truncateForMeta(
    `Browse commodities across Energy, Metals, Agriculture, and Livestock with AI-driven analysis. Each one is scored on ${SCORED_CATEGORY_PHRASE} — a plain-English read on what moves its price.`
  );
  const url = `${BASE_URL}/commodities`;

  return {
    title,
    description,
    alternates: { canonical: url },
    keywords: [
      'commodities',
      'commodity analysis',
      'commodity prices',
      'commodity investing',
      'crude oil',
      'gold',
      'natural gas',
      'wheat',
      'energy commodities',
      'metals',
      'agriculture commodities',
      'livestock commodities',
      'commodity futures',
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

export function generateCommodityListingJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Commodities — Supply, Price, Volatility & Outlook Analysis',
    description: `Browse commodities across Energy, Metals, Agriculture, and Livestock with AI-driven analysis scored on ${SCORED_CATEGORY_PHRASE}.`,
    url: `${BASE_URL}/commodities`,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: BASE_URL,
      logo: { '@type': 'ImageObject', url: LOGO_URL },
    },
  };
}

export function generateCommodityListingBreadcrumbJsonLd() {
  return generateCommodityBreadcrumbJsonLdFromCrumbs([{ name: 'Commodities', href: '/commodities' }]);
}

// ────────────────────────────────────────────────────────────────────────────────
// Commodity Detail Page (/commodities/[slug])
// ────────────────────────────────────────────────────────────────────────────────

interface CommodityDetailMetadataInput {
  name: string;
  slug: string;
  commodityGroup: string;
  exchange?: string | null;
  metaDescription?: string | null;
  createdTime?: string;
  updatedTime?: string;
}

function commodityKeywords(name: string, commodityGroup: string): string[] {
  return [
    name,
    `${name} analysis`,
    `${name} price`,
    `${name} price forecast`,
    `${name} outlook`,
    `${name} supply and demand`,
    `${name} volatility`,
    `how to invest in ${name}`,
    `${commodityGroup} commodities`,
    'commodity analysis',
    'commodity investing',
    SITE_NAME,
  ];
}

export function generateCommodityDetailMetadata({
  name,
  slug,
  commodityGroup,
  exchange,
  metaDescription,
  createdTime,
  updatedTime,
}: CommodityDetailMetadataInput): Metadata {
  const year = new Date().getFullYear();
  const canonicalUrl = `${BASE_URL}/commodities/${slug}`;
  const onExchange = exchange ? ` on ${exchange}` : '';
  const description = truncateForMeta(
    metaDescription || `${name} commodity analysis — ${SCORED_CATEGORY_PHRASE}${onExchange}, plus key facts and ways to invest.`
  );
  const title = `${name} — Commodity Analysis & Price Outlook (${year}) | ${SITE_NAME}`;
  const ogTitle = `${name} — Commodity Analysis & Price Outlook | ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    keywords: commodityKeywords(name, commodityGroup),
    openGraph: {
      title: ogTitle,
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
      title: ogTitle,
      description,
      images: [LOGO_URL],
    },
  };
}

export function generateCommodityDetailArticleJsonLd({
  name,
  slug,
  commodityGroup,
  publishedDate,
  modifiedDate,
}: {
  name: string;
  slug: string;
  commodityGroup: string;
  publishedDate: string;
  modifiedDate: string;
}) {
  const canonicalUrl = `${BASE_URL}/commodities/${slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${name} — Commodity Analysis: Supply, Price, Volatility & Outlook`,
    description: `In-depth analysis of the ${name} commodity covering ${SCORED_CATEGORY_PHRASE}, plus key facts and ways to invest.`,
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
    about: { '@type': 'Thing', name },
    articleSection: `${commodityGroup} Commodity Analysis`,
    keywords: commodityKeywords(name, commodityGroup),
  };
}

export function generateCommodityDetailBreadcrumbJsonLd({ name, slug }: { name: string; slug: string }) {
  return generateCommodityBreadcrumbJsonLdFromCrumbs([
    { name: 'Commodities', href: '/commodities' },
    { name, href: `/commodities/${slug}` },
  ]);
}

// ────────────────────────────────────────────────────────────────────────────────
// Commodity Category Sub-Pages (/commodities/[slug]/[category])
// ────────────────────────────────────────────────────────────────────────────────

interface CommodityCategoryMetadataInput {
  name: string;
  slug: string;
  commodityGroup: string;
  categoryKey: CommodityAnalysisCategory;
  createdTime?: string;
  updatedTime?: string;
}

export function generateCommodityCategoryMetadata({
  name,
  slug,
  commodityGroup,
  categoryKey,
  createdTime,
  updatedTime,
}: CommodityCategoryMetadataInput): Metadata {
  const year = new Date().getFullYear();
  const categoryName = COMMODITY_CATEGORY_NAMES[categoryKey];
  const categorySlug = COMMODITY_CATEGORY_TO_PATH[categoryKey];
  const canonicalUrl = `${BASE_URL}/commodities/${slug}/${categorySlug}`;
  const description = truncateForMeta(
    `${categoryName} analysis for the ${name} commodity — a plain-English, investor-focused breakdown scored factor by factor.`
  );
  const title = `${name} ${categoryName} Analysis (${year}) | ${SITE_NAME}`;
  const ogTitle = `${name} ${categoryName} Analysis | ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    keywords: [
      `${name} ${categoryName.toLowerCase()}`,
      `${name} ${categoryName.toLowerCase()} analysis`,
      `${name} analysis`,
      `${commodityGroup} commodities`,
      'commodity analysis',
      'commodity investing',
      SITE_NAME,
    ],
    openGraph: {
      title: ogTitle,
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
      title: ogTitle,
      description,
      images: [LOGO_URL],
    },
  };
}

export function generateCommodityCategoryArticleJsonLd({
  name,
  slug,
  categoryKey,
  publishedDate,
  modifiedDate,
}: {
  name: string;
  slug: string;
  categoryKey: CommodityAnalysisCategory;
  publishedDate: string;
  modifiedDate: string;
}) {
  const categoryName = COMMODITY_CATEGORY_NAMES[categoryKey];
  const categorySlug = COMMODITY_CATEGORY_TO_PATH[categoryKey];
  const canonicalUrl = `${BASE_URL}/commodities/${slug}/${categorySlug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${name} ${categoryName} Analysis`,
    description: `${categoryName} analysis for the ${name} commodity.`,
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
    about: { '@type': 'Thing', name },
    articleSection: 'Commodity Analysis',
  };
}

export function generateCommodityCategoryBreadcrumbJsonLd({ name, slug, categoryKey }: { name: string; slug: string; categoryKey: CommodityAnalysisCategory }) {
  const categoryName = COMMODITY_CATEGORY_NAMES[categoryKey];
  const categorySlug = COMMODITY_CATEGORY_TO_PATH[categoryKey];
  return generateCommodityBreadcrumbJsonLdFromCrumbs([
    { name: 'Commodities', href: '/commodities' },
    { name, href: `/commodities/${slug}` },
    { name: categoryName, href: `/commodities/${slug}/${categorySlug}` },
  ]);
}
