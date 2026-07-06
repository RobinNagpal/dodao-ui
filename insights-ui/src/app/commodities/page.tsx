import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { fetchCommodityListing } from '@/utils/commodity-analysis-reports/commodity-report-fetchers';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Commodities — Analysis | KoalaGains',
  description: 'Plain-English analysis of commodities: supply & demand, price & value, volatility & risk, and future outlook.',
  alternates: { canonical: '/commodities' },
};

export default async function CommoditiesIndexPage(): Promise<JSX.Element> {
  const commodities = await fetchCommodityListing();

  const groups = Array.from(new Set(commodities.map((c) => c.commodityGroup)));

  const breadcrumbs: BreadcrumbsOjbect[] = [{ name: 'Commodities', href: '/commodities', current: true }];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} hideHomeIcon={true} mobileBackOnly={true} />

      <div className="w-full mb-8">
        <h1 className="text-2xl font-bold text-heading mb-4">Commodities</h1>
        <p className="text-body text-md mb-4">
          Supply &amp; demand, price &amp; value, volatility &amp; risk, and future outlook — analyzed for each commodity.
        </p>
      </div>

      {commodities.length === 0 ? (
        <p className="text-muted">No commodities are available yet.</p>
      ) : (
        groups.map((group) => (
          <div key={group} className="mb-8">
            <div className="flex items-center justify-between mb-4 gap-4">
              <h2 className="text-xl font-bold text-heading">{group}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {commodities
                .filter((c) => c.commodityGroup === group)
                .map((c) => (
                  <Link
                    key={c.id}
                    href={`/commodities/${c.slug}`}
                    prefetch={false}
                    className="flex items-center justify-between gap-2 bg-block-bg-color rounded-lg border border-color hover:border-primary transition-colors px-3 py-2.5"
                  >
                    <span className="text-sm font-semibold heading-color break-words">{c.name}</span>
                    {c.finalScore !== null && (
                      <span className="text-xs font-medium bg-primary text-primary-text px-1.5 py-0.5 rounded shrink-0">{c.finalScore}</span>
                    )}
                  </Link>
                ))}
            </div>
          </div>
        ))
      )}
    </PageWrapper>
  );
}
