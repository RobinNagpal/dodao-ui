import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import CompactEtfGroupingCard from '@/components/etfs/CompactEtfGroupingCard';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getAllEtfGroups, getCategoriesForGroupKey } from '@/utils/etf-categorization-utils';
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
    title: `${decoded} ETFs by Group | KoalaGains`,
    description: `Browse ${decoded} ETFs organized by analysis group. Each group highlights top-rated ETFs by report score and AUM.`,
  };
}

export default async function CountryEtfsGroupsIndexPage({ params }: PageProps) {
  const { country } = await params;
  const decoded = decodeURIComponent(country);
  if (decoded === SupportedCountries.US) redirect('/etfs/groups');
  if (!isEtfSupportedCountry(decoded)) notFound();

  const groups = getAllEtfGroups();

  const valueToKey = new Map<string, string>();
  for (const group of groups) {
    for (const cat of getCategoriesForGroupKey(group.key)) {
      valueToKey.set(cat.name, group.key);
    }
  }

  const { values, counts } = await fetchEtfsForGroupings({
    spaceId: KoalaGainsSpaceId,
    mode: 'category',
    valueToKey,
    country: decoded,
  });

  return (
    <EtfPageLayout
      title={`${decoded} ETFs by Group`}
      description={`Diversified, sector, fixed income, and alternative-strategy fund groups for ${decoded} ETFs. Each card lists the top-rated ETFs in that group.`}
      currentCountry={decoded}
      switcherSection="groups"
      extraBreadcrumbs={[{ name: 'Groups', href: `/etfs/countries/${encodeURIComponent(decoded)}/groups`, current: true }]}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {groups.map((group) => (
          <CompactEtfGroupingCard
            key={group.key}
            title={group.name}
            href={`/etfs/countries/${encodeURIComponent(decoded)}/groups/${encodeURIComponent(group.key)}`}
            totalCount={counts.get(group.key) ?? 0}
            etfs={values.get(group.key) ?? []}
          />
        ))}
      </div>
    </EtfPageLayout>
  );
}
