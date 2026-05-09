import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import WithSuspenseEtfListingGrid from '@/components/etfs/WithSuspenseEtfListingGrid';
import { fetchEtfListingData } from '@/utils/etf-data-utils';
import { EtfFilterParamKey } from '@/utils/etf-filter-utils';
import { getEtfGroupByKey } from '@/utils/etf-categorization-utils';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ group: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { group } = await props.params;
  const decoded = decodeURIComponent(group);
  const groupObj = getEtfGroupByKey(decoded);
  const displayName = groupObj?.name ?? decoded;
  return {
    title: `${displayName} ETFs | KoalaGains`,
    description: `Browse US ETFs in the ${displayName} group with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`,
  };
}

export default async function EtfsByGroupPage({ params }: PageProps) {
  const { group } = await params;
  const decodedGroupKey = decodeURIComponent(group);
  const groupObj = getEtfGroupByKey(decodedGroupKey);

  if (!groupObj) notFound();

  const dataPromise = fetchEtfListingData({ [EtfFilterParamKey.GROUP]: groupObj.key });

  return (
    <EtfPageLayout
      title={`${groupObj.name} ETFs`}
      description={groupObj.description}
      extraBreadcrumbs={[{ name: groupObj.name, href: `/etfs/groups/${encodeURIComponent(groupObj.key)}`, current: true }]}
    >
      <WithSuspenseEtfListingGrid dataPromise={dataPromise} />
    </EtfPageLayout>
  );
}
