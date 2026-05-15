import EtfProviderDetail from '@/components/etfs/EtfProviderDetail';
import { EtfSearchParams } from '@/utils/etf-filter-utils';
import { etfBrowseDetailPath, resolveEtfCountryParam } from '@/utils/etf-country-route-utils';
import { getEtfProviderBySlug, slugifyEtfTag } from '@/utils/etf-tag-slug-utils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ country: string; provider: string }>;
  searchParams: Promise<EtfSearchParams>;
};

export async function generateMetadata(props: { params: Promise<{ country: string; provider: string }> }): Promise<Metadata> {
  const { country, provider } = await props.params;
  const decodedCountry = decodeURIComponent(country);
  const decoded = decodeURIComponent(provider);
  const display = getEtfProviderBySlug(slugifyEtfTag(decoded));
  return {
    title: `${display} ${decodedCountry} ETFs | KoalaGains`,
    description: `Browse ${decodedCountry} ETFs issued by ${display} with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`,
  };
}

export default async function CountryEtfsByProviderPage({ params, searchParams: searchParamsPromise }: PageProps) {
  const { country, provider } = await params;
  const decoded = decodeURIComponent(provider);
  const slug = slugifyEtfTag(decoded);

  const decodedCountry = resolveEtfCountryParam(country, etfBrowseDetailPath(SupportedCountries.US, 'providers', slug));

  if (provider !== slug) {
    permanentRedirect(etfBrowseDetailPath(decodedCountry, 'providers', slug));
  }

  const canonical = getEtfProviderBySlug(slug);
  const searchParams = await searchParamsPromise;
  return EtfProviderDetail({ country: decodedCountry, provider: canonical, searchParams });
}
