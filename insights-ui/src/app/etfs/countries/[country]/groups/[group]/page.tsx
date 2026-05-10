import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import WithSuspenseEtfListingGrid from '@/components/etfs/WithSuspenseEtfListingGrid';
import { fetchEtfListingData } from '@/utils/etf-data-utils';
import { EtfFilterParamKey, EtfSearchParams } from '@/utils/etf-filter-utils';
import { getEtfGroupByKey } from '@/utils/etf-categorization-utils';
import { isEtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ country: string; group: string }>;
  searchParams: Promise<EtfSearchParams>;
};

export async function generateMetadata(props: { params: Promise<{ country: string; group: string }> }): Promise<Metadata> {
  const { country, group } = await props.params;
  const decodedCountry = decodeURIComponent(country);
  const decodedGroup = decodeURIComponent(group);
  const groupObj = getEtfGroupByKey(decodedGroup);
  const displayName = groupObj?.name ?? decodedGroup;
  return {
    title: `${displayName} ${decodedCountry} ETFs | KoalaGains`,
    description: `Browse ${decodedCountry} ETFs in the ${displayName} group with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`,
  };
}

export default async function CountryEtfsByGroupPage({ params, searchParams: searchParamsPromise }: PageProps) {
  const { country, group } = await params;
  const decodedCountry = decodeURIComponent(country);
  const decodedGroupKey = decodeURIComponent(group);
  if (decodedCountry === SupportedCountries.US) redirect(`/etfs/groups/${encodeURIComponent(decodedGroupKey)}`);
  if (!isEtfSupportedCountry(decodedCountry)) notFound();

  const groupObj = getEtfGroupByKey(decodedGroupKey);
  if (!groupObj) notFound();

  const searchParams = await searchParamsPromise;
  const dataPromise = fetchEtfListingData(
    {
      ...searchParams,
      [EtfFilterParamKey.GROUP]: groupObj.key,
    },
    decodedCountry
  );

  const encodedCountry = encodeURIComponent(decodedCountry);

  return (
    <EtfPageLayout
      title={`${groupObj.name} ${decodedCountry} ETFs`}
      description={groupObj.description}
      currentCountry={decodedCountry}
      switcherSection="groups"
      extraBreadcrumbs={[
        { name: 'All Groups', href: `/etfs/countries/${encodedCountry}/groups`, current: false },
        { name: groupObj.name, href: `/etfs/countries/${encodedCountry}/groups/${encodeURIComponent(groupObj.key)}`, current: true },
      ]}
    >
      <WithSuspenseEtfListingGrid dataPromise={dataPromise} />
    </EtfPageLayout>
  );
}
