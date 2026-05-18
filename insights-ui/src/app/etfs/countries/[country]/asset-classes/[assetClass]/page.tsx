import EtfAssetClassDetail from '@/components/etfs/EtfAssetClassDetail';
import { EtfSearchParams, ETF_ASSET_CLASS_OPTIONS } from '@/utils/etf-filter-utils';
import { etfBrowseDetailPath, resolveEtfCountryParam } from '@/utils/etf-country-route-utils';
import { getEtfAssetClassBySlug, slugifyEtfTag } from '@/utils/etf-tag-slug-utils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { generateEtfAssetClassDetailBreadcrumbJsonLd, generateEtfAssetClassDetailMetadata } from '@/utils/etf-metadata-generators';
import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ country: string; assetClass: string }>;
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

export async function generateMetadata(props: { params: Promise<{ country: string; assetClass: string }> }): Promise<Metadata> {
  const { country, assetClass } = await props.params;
  const resolved = resolveAssetClass(assetClass);
  const canonical = resolved?.canonical ?? decodeURIComponent(assetClass);
  const slug = resolved?.slug ?? slugifyEtfTag(canonical);
  const decodedCountry = resolveEtfCountryParam(country, etfBrowseDetailPath(SupportedCountries.US, 'asset-classes', slug));
  return generateEtfAssetClassDetailMetadata({
    country: decodedCountry,
    assetClass: canonical,
    assetClassSlug: slug,
  });
}

export default async function CountryEtfsByAssetClassPage({ params, searchParams: searchParamsPromise }: PageProps) {
  const { country, assetClass } = await params;
  const resolved = resolveAssetClass(assetClass);
  if (!resolved) notFound();

  const decodedCountry = resolveEtfCountryParam(country, etfBrowseDetailPath(SupportedCountries.US, 'asset-classes', resolved.slug));

  if (assetClass !== resolved.slug) {
    permanentRedirect(etfBrowseDetailPath(decodedCountry, 'asset-classes', resolved.slug));
  }

  const searchParams = await searchParamsPromise;
  const breadcrumb = generateEtfAssetClassDetailBreadcrumbJsonLd({
    country: decodedCountry,
    assetClass: resolved.canonical,
    assetClassSlug: resolved.slug,
  });
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {await EtfAssetClassDetail({ country: decodedCountry, assetClass: resolved.canonical, searchParams })}
    </>
  );
}
