import EtfProviderDetail from '@/components/etfs/EtfProviderDetail';
import { EtfSearchParams } from '@/utils/etf-filter-utils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { getEtfProviderBySlug, slugifyEtfTag } from '@/utils/etf-tag-slug-utils';
import { etfBrowseDetailPath } from '@/utils/etf-country-route-utils';
import { fetchEtfProvidersIndex } from '@/utils/etf-listing-fetchers';
import { providerDetailRobots } from '@/utils/etf-listing-noindex';
import { generateEtfProviderDetailBreadcrumbJsonLd, generateEtfProviderDetailMetadata } from '@/utils/etf-metadata-generators';
import { permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ provider: string }>;
  searchParams: Promise<EtfSearchParams>;
};

export async function generateMetadata(props: { params: Promise<{ provider: string }> }): Promise<Metadata> {
  const { provider } = await props.params;
  const slug = slugifyEtfTag(decodeURIComponent(provider));
  const base = generateEtfProviderDetailMetadata({
    country: SupportedCountries.US,
    providerCanonical: getEtfProviderBySlug(slug),
    providerSlug: slug,
  });
  const index = await fetchEtfProvidersIndex(SupportedCountries.US);
  return { ...base, ...providerDetailRobots(index, slug) };
}

export default async function EtfsByProviderPage({ params, searchParams: searchParamsPromise }: PageProps) {
  const { provider } = await params;
  const decoded = decodeURIComponent(provider);
  const slug = slugifyEtfTag(decoded);
  if (provider !== slug) {
    permanentRedirect(etfBrowseDetailPath(SupportedCountries.US, 'providers', slug));
  }

  const canonical = getEtfProviderBySlug(slug);
  const searchParams = await searchParamsPromise;
  const breadcrumb = generateEtfProviderDetailBreadcrumbJsonLd({
    country: SupportedCountries.US,
    providerCanonical: canonical,
    providerSlug: slug,
  });
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {await EtfProviderDetail({ country: SupportedCountries.US, provider: canonical, searchParams })}
    </>
  );
}
