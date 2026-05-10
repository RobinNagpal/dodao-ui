import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import WithSuspenseEtfListingGrid from '@/components/etfs/WithSuspenseEtfListingGrid';
import { fetchEtfListingData } from '@/utils/etf-data-utils';
import { EtfFilterParamKey, EtfSearchParams } from '@/utils/etf-filter-utils';
import { getEtfGroupByKey } from '@/utils/etf-categorization-utils';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { etfBrowseDetailPath, etfBrowsePath, etfCountryDisplayName } from '@/utils/etf-country-route-utils';
import { notFound } from 'next/navigation';

interface EtfGroupDetailProps {
  country: EtfSupportedCountry;
  groupKey: string;
  searchParams: EtfSearchParams;
}

export default async function EtfGroupDetail({ country, groupKey, searchParams }: EtfGroupDetailProps) {
  const groupObj = getEtfGroupByKey(groupKey);
  if (!groupObj) notFound();

  const displayCountry = etfCountryDisplayName(country);

  const dataPromise = fetchEtfListingData(
    {
      ...searchParams,
      [EtfFilterParamKey.GROUP]: groupObj.key,
    },
    country
  );

  return (
    <EtfPageLayout
      title={`${groupObj.name} ${displayCountry} ETFs`}
      description={groupObj.description}
      currentCountry={country}
      switcherSection="groups"
      extraBreadcrumbs={[
        { name: 'All Groups', href: etfBrowsePath(country, 'groups'), current: false },
        { name: groupObj.name, href: etfBrowseDetailPath(country, 'groups', groupObj.key), current: true },
      ]}
    >
      <WithSuspenseEtfListingGrid dataPromise={dataPromise} />
    </EtfPageLayout>
  );
}
