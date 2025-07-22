import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { fetchTariffReports, TariffIndustryDefinition } from '@/scripts/industry-tariff-reports/tariff-industries';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { ChevronRight, FileText } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Tariff Reports | KoalaGains';
  const description = 'Comprehensive collection of tariff reports. Explore industry insights and tariff impacts across various sectors.';
  const canonicalUrl = 'https://koalagains.com/tariff-reports';

  const keywords = ['tariff reports', 'industry analysis', 'tariff impacts', 'trade policy', 'industry evaluation', 'sector analysis', 'KoalaGains'];

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    keywords,
  };
}

export default async function TariffReportsPage() {
  // Fetch tariff reports
  const tariffReports: TariffIndustryDefinition[] = fetchTariffReports();

  // Sort reports by updatedAt date (most recent first)
  const sortedTariffReports = tariffReports.sort((a, b) => {
    if (!a.updatedAt && !b.updatedAt) return 0;
    if (!a.updatedAt) return 1;
    if (!b.updatedAt) return -1;

    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  // Set up breadcrumbs
  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: 'Reports',
      href: '/reports',
      current: false,
    },
    {
      name: 'Tariff Reports',
      href: '/tariff-reports',
      current: true,
    },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-color">
        <div className="mx-auto">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">Reports</h1>

          {/* Tariff Reports Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 border-b border-color pb-2">Industry Tariff Reports</h2>
            <p className="mb-6 text-muted-foreground">
              Comprehensive analyses of tariff impacts across various industries. These reports provide deep insights into how tariff policies affect industry
              dynamics, supply chains, competitive landscapes, and future outlook. Each report explores established players, emerging challengers, and potential
              investment opportunities created by changing trade policies.
            </p>

            {tariffReports.length === 0 ? (
              <div className="text-center py-12 background-color rounded-lg shadow-sm border border-color">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No tariff reports available</h3>
                <p className="mt-2 text-sm text-muted-foreground">Tariff reports will appear here once they are created.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {sortedTariffReports.map((report) => (
                  <div
                    key={report.industryId}
                    className="flex flex-col overflow-hidden rounded-lg shadow-lg border border-color hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex-1 background-color p-6">
                      <div className="flex items-center text-xs font-medium mb-3">
                        <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">
                          Tariff Report
                        </span>
                        {report.updatedAt && <span className="ml-2 text-muted-foreground">Updated {report.updatedAt}</span>}
                      </div>

                      <Link href={`/industry-tariff-report/${report.industryId}`} className="block mt-2 group">
                        <h3 className="text-xl font-semibold group-hover:text-primary-color transition-colors">{report.reportTitle}</h3>
                      </Link>

                      <p className="mt-3 text-muted-foreground line-clamp-3">{report.reportOneLiner}</p>
                    </div>

                    <div className="block-bg-color border-t border-color p-4">
                      <Link href={`/industry-tariff-report/${report.industryId}`} className="group flex items-center text-sm font-medium primary-color">
                        View full report
                        <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </PageWrapper>
  );
}
