import CommodityGroupCard from '@/components/commodity-reports/CommodityGroupCard';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { fetchCommodityListing } from '@/utils/commodity-analysis-reports/commodity-report-fetchers';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Commodities — Analysis | KoalaGains',
  description: 'Plain-English analysis of commodities: supply & demand, price & value, volatility & risk, and future outlook.',
  alternates: { canonical: '/commodities' },
};

const COMMODITIES_DESCRIPTION =
  'Explore commodities across Energy, Metals, Agriculture, and Livestock. Each one is scored on supply & demand, price & value, volatility & risk, and future outlook — ' +
  'turning raw futures-market data into a plain-English read on what moves its price and where it may be headed.';

export default async function CommoditiesIndexPage(): Promise<JSX.Element> {
  const commodities = await fetchCommodityListing();

  const groups = Array.from(new Set(commodities.map((c) => c.commodityGroup)));

  const breadcrumbs: BreadcrumbsOjbect[] = [{ name: 'Commodities', href: '/commodities', current: true }];

  return (
    <PageWrapper>
      <div className="overflow-x-auto">
        <Breadcrumbs breadcrumbs={breadcrumbs} hideHomeIcon={true} mobileBackOnly={true} />
      </div>

      <div className="w-full mb-8">
        <h1 className="text-2xl font-bold text-white mb-4">Commodities</h1>
        <p className="text-[#E5E7EB] text-md mb-4">{COMMODITIES_DESCRIPTION}</p>
      </div>

      {commodities.length === 0 ? (
        <p className="text-muted">No commodities are available yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 items-start">
          {groups.map((group) => (
            <CommodityGroupCard key={group} group={group} commodities={commodities.filter((c) => c.commodityGroup === group)} />
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
