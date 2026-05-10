import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import CompactEtfGroupingCard from '@/components/etfs/CompactEtfGroupingCard';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ETF_ASSET_CLASS_OPTIONS } from '@/utils/etf-filter-utils';
import { fetchEtfsForGroupings } from '@/utils/etf-grouping-utils';
import { isEtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ country: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { country } = await props.params;
  const decoded = decodeURIComponent(country);
  return {
    title: `${decoded} ETFs by Asset Class | KoalaGains`,
    description: `Browse ${decoded} ETFs by asset class — Equity, Fixed Income, Commodity, Alternatives, and more. Each card highlights the top-rated ETFs in that class.`,
  };
}

export default async function CountryEtfsAssetClassesIndexPage({ params }: PageProps) {
  const { country } = await params;
  const decoded = decodeURIComponent(country);
  if (decoded === SupportedCountries.US) redirect('/etfs/asset-classes');
  if (!isEtfSupportedCountry(decoded)) notFound();

  const assetClasses = ETF_ASSET_CLASS_OPTIONS.filter((opt) => opt.value !== '');

  const valueToKey = new Map<string, string>();
  for (const opt of assetClasses) {
    valueToKey.set(opt.value, opt.value);
  }

  const { values, counts } = await fetchEtfsForGroupings({
    spaceId: KoalaGainsSpaceId,
    mode: 'assetClass',
    valueToKey,
    country: decoded,
  });

  const encodedCountry = encodeURIComponent(decoded);

  return (
    <EtfPageLayout
      title={`${decoded} ETFs by Asset Class`}
      description={`Equity, fixed income, commodity, alternative, multi-asset and currency fund classes for ${decoded} ETFs. Each card shows the top-rated ETFs in that asset class.`}
      currentCountry={decoded}
      switcherSection="asset-classes"
      extraBreadcrumbs={[{ name: 'Asset Classes', href: `/etfs/countries/${encodedCountry}/asset-classes`, current: true }]}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {assetClasses.map((opt) => (
          <CompactEtfGroupingCard
            key={opt.value}
            title={opt.label}
            href={`/etfs/countries/${encodedCountry}/asset-classes/${encodeURIComponent(opt.value)}`}
            totalCount={counts.get(opt.value) ?? 0}
            etfs={values.get(opt.value) ?? []}
          />
        ))}
      </div>
    </EtfPageLayout>
  );
}
