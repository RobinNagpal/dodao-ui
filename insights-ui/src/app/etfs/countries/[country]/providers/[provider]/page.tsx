import EtfProviderDetail from '@/components/etfs/EtfProviderDetail';
import { EtfSearchParams } from '@/utils/etf-filter-utils';
import { etfBrowseDetailPath, resolveEtfCountryParam } from '@/utils/etf-country-route-utils';
import { getEtfProviderBySlug, slugifyEtfTag } from '@/utils/etf-tag-slug-utils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { fetchEtfProvidersIndex } from '@/utils/etf-listing-fetchers';
import { providerDetailRobots } from '@/utils/etf-listing-noindex';
import { generateEtfProviderDetailBreadcrumbJsonLd, generateEtfProviderDetailMetadata } from '@/utils/etf-metadata-generators';
import { permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ country: string; provider: string }>;
  searchParams: Promise<EtfSearchParams>;
};

export async function generateMetadata(props: { params: Promise<{ country: string; provider: string }> }): Promise<Metadata> {
  const { country, provider } = await props.params;
  const slug = slugifyEtfTag(decodeURIComponent(provider));
  const decodedCountry = resolveEtfCountryParam(country, etfBrowseDetailPath(SupportedCountries.US, 'providers', slug));
  const base = generateEtfProviderDetailMetadata({
    country: decodedCountry,
    providerCanonical: getEtfProviderBySlug(slug),
    providerSlug: slug,
  });
  const index = await fetchEtfProvidersIndex(decodedCountry);
  return { ...base, ...providerDetailRobots(index, slug) };
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
  const breadcrumb = generateEtfProviderDetailBreadcrumbJsonLd({
    country: decodedCountry,
    providerCanonical: canonical,
    providerSlug: slug,
  });
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {await EtfProviderDetail({ country: decodedCountry, provider: canonical, searchParams })}
    </>
  );
}
