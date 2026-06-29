import EtfAssetClassDetail from '@/components/etfs/EtfAssetClassDetail';
import { EtfSearchParams, ETF_ASSET_CLASS_OPTIONS } from '@/utils/etf-filter-utils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { getEtfAssetClassBySlug, slugifyEtfTag } from '@/utils/etf-tag-slug-utils';
import { etfBrowseDetailPath } from '@/utils/etf-country-route-utils';
import { fetchEtfAssetClassesIndex } from '@/utils/etf-listing-fetchers';
import { assetClassDetailRobots } from '@/utils/etf-listing-noindex';
import { generateEtfAssetClassDetailBreadcrumbJsonLd, generateEtfAssetClassDetailMetadata } from '@/utils/etf-metadata-generators';
import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ assetClass: string }>;
  searchParams: Promise<EtfSearchParams>;
};

function resolveAssetClass(rawParam: string): { canonical: string; slug: string } | null {
  const decoded = decodeURIComponent(rawParam);
  const slugCandidate = slugifyEtfTag(decoded);
  const fromSlug = getEtfAssetClassBySlug(slugCandidate);
  if (fromSlug) return { canonical: fromSlug, slug: slugifyEtfTag(fromSlug) };
  const fromValue = ETF_ASSET_CLASS_OPTIONS.find((o) => o.value !== '' && o.value.toLowerCase() === decoded.toLowerCase());
  if (fromValue) return { canonical: fromValue.value, slug: slugifyEtfTag(fromValue.value) };
  return null;
}

export async function generateMetadata(props: { params: Promise<{ assetClass: string }> }): Promise<Metadata> {
  const { assetClass } = await props.params;
  const resolved = resolveAssetClass(assetClass);
  const canonical = resolved?.canonical ?? decodeURIComponent(assetClass);
  const slug = resolved?.slug ?? slugifyEtfTag(canonical);
  const base = generateEtfAssetClassDetailMetadata({
    country: SupportedCountries.US,
    assetClass: canonical,
    assetClassSlug: slug,
  });
  // Unknown asset class → the page 404s, so there's nothing to index either way.
  if (!resolved) return base;
  const index = await fetchEtfAssetClassesIndex(SupportedCountries.US);
  return { ...base, ...assetClassDetailRobots(index, resolved.slug) };
}

export default async function EtfsByAssetClassPage({ params, searchParams: searchParamsPromise }: PageProps) {
  const { assetClass } = await params;
  const resolved = resolveAssetClass(assetClass);
  if (!resolved) notFound();

  if (assetClass !== resolved.slug) {
    permanentRedirect(etfBrowseDetailPath(SupportedCountries.US, 'asset-classes', resolved.slug));
  }

  const searchParams = await searchParamsPromise;
  const breadcrumb = generateEtfAssetClassDetailBreadcrumbJsonLd({
    country: SupportedCountries.US,
    assetClass: resolved.canonical,
    assetClassSlug: resolved.slug,
  });
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {await EtfAssetClassDetail({ country: SupportedCountries.US, assetClass: resolved.canonical, searchParams })}
    </>
  );
}
