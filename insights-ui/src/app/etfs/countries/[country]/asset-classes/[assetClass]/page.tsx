import EtfAssetClassDetail from '@/components/etfs/EtfAssetClassDetail';
import { EtfSearchParams, ETF_ASSET_CLASS_OPTIONS } from '@/utils/etf-filter-utils';
import { etfBrowseDetailPath, resolveEtfCountryParam } from '@/utils/etf-country-route-utils';
import { getEtfAssetClassBySlug, slugifyEtfTag } from '@/utils/etf-tag-slug-utils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
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
  const decodedCountry = decodeURIComponent(country);
  const resolved = resolveAssetClass(assetClass);
  const display = resolved?.canonical ?? decodeURIComponent(assetClass);
  return {
    title: `${display} ${decodedCountry} ETFs | KoalaGains`,
    description: `Browse ${decodedCountry} ETFs in the ${display} asset class with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`,
  };
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
  return EtfAssetClassDetail({ country: decodedCountry, assetClass: resolved.canonical, searchParams });
}
