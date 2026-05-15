import EtfProviderDetail from '@/components/etfs/EtfProviderDetail';
import { EtfSearchParams } from '@/utils/etf-filter-utils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { getEtfProviderBySlug, slugifyEtfTag } from '@/utils/etf-tag-slug-utils';
import { etfBrowseDetailPath } from '@/utils/etf-country-route-utils';
import { permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ provider: string }>;
  searchParams: Promise<EtfSearchParams>;
};

export async function generateMetadata(props: { params: Promise<{ provider: string }> }): Promise<Metadata> {
  const { provider } = await props.params;
  const decoded = decodeURIComponent(provider);
  const display = getEtfProviderBySlug(slugifyEtfTag(decoded));
  return {
    title: `${display} ETFs | KoalaGains`,
    description: `Browse US ETFs issued by ${display} with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`,
  };
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
  return EtfProviderDetail({ country: SupportedCountries.US, provider: canonical, searchParams });
}
