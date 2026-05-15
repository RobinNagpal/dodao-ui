import EtfAssetClassDetail from '@/components/etfs/EtfAssetClassDetail';
import { EtfSearchParams, ETF_ASSET_CLASS_OPTIONS } from '@/utils/etf-filter-utils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { getEtfAssetClassBySlug, slugifyEtfTag } from '@/utils/etf-tag-slug-utils';
import { etfBrowseDetailPath } from '@/utils/etf-country-route-utils';
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
  const display = resolved?.canonical ?? decodeURIComponent(assetClass);
  return {
    title: `${display} ETFs | KoalaGains`,
    description: `Browse US ETFs in the ${display} asset class with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`,
  };
}

export default async function EtfsByAssetClassPage({ params, searchParams: searchParamsPromise }: PageProps) {
  const { assetClass } = await params;
  const resolved = resolveAssetClass(assetClass);
  if (!resolved) notFound();

  if (assetClass !== resolved.slug) {
    permanentRedirect(etfBrowseDetailPath(SupportedCountries.US, 'asset-classes', resolved.slug));
  }

  const searchParams = await searchParamsPromise;
  return EtfAssetClassDetail({ country: SupportedCountries.US, assetClass: resolved.canonical, searchParams });
}
