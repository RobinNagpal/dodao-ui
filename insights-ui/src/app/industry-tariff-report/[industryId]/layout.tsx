import ReportLeftNavigation from '@/components/industry-tariff/report-left-navigation';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import type { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import type { Metadata } from 'next';
import type React from 'react';

export async function generateMetadata({ params }: { params: Promise<{ industryId: string }> }): Promise<Metadata> {
  const { industryId } = await params;

  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}`, { cache: 'no-cache' });
  let reportData: IndustryTariffReport | null = null;

  if (reportResponse.ok) {
    reportData = await reportResponse.json();
  }

  // Extract industry name or use report ID as fallback
  const industryName = reportData?.executiveSummary?.title || `Industry Report ${industryId}`;
  const shortDescription = `Comprehensive tariff analysis for ${industryName}. Explore industry insights, tariff impacts, and company evaluations.`;
  const canonicalUrl = `https://koalagains.com/industry-tariff-report/${industryId}`;

  const dynamicKeywords = [industryName, 'tariff analysis', 'industry report', 'tariff impacts', 'industry evaluation', 'KoalaGains'];

  return {
    title: `${industryName} | Tariff Report | KoalaGains`,
    description: shortDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${industryName} | Tariff Report | KoalaGains`,
      description: shortDescription,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${industryName} | Tariff Report | KoalaGains`,
      description: shortDescription,
    },
    keywords: dynamicKeywords,
  };
}

export default async function IndustryTariffReportLayout({ children, params }: { children: React.ReactNode; params: Promise<{ industryId: string }> }) {
  const paa = await params;
  const { industryId } = paa;
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}`, { cache: 'no-cache' });
  let report: IndustryTariffReport | null = null;

  if (reportResponse.ok) {
    report = await reportResponse.json();
  }

  // If no report is found, you might want to handle this case
  if (!report) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold">Report not found</h1>
          <p className="mt-4">The requested industry tariff report could not be found.</p>
        </div>
      </PageWrapper>
    );
  }

  // Set up breadcrumbs
  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: 'Tariff Reports',
      href: '/reports',
      current: false,
    },
    {
      name: report.reportCover?.title || `Report ${industryId}`,
      href: `/industry-tariff-report/${industryId}`,
      current: false,
    },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <div className="mx-auto text-color">
        <div className="mx-auto">
          {/* Book UI with Navigation and Content */}
          <div className="flex min-h-[calc(100vh-10rem)] overflow-hidden rounded-lg border border-color background-color shadow-lg">
            {/* Left side - Book spine/navigation */}
            <ReportLeftNavigation report={report} industryId={industryId} />

            {/* Right side - Book content */}
            <div className="flex-1 bg-background p-8">
              <div className="mx-auto max-w-4xl">
                <div className="relative min-h-[calc(100vh-10rem)] rounded-lg block-bg-color p-8 shadow-md">
                  {/* Page corner fold effect */}
                  <div className="absolute right-0 top-0 h-12 w-12 bg-muted/20">
                    <div className="absolute right-0 top-0 h-0 w-0 border-l-[48px] border-b-[48px] border-l-transparent border-b-[var(--block-bg)]"></div>
                  </div>

                  {/* Content from child page */}
                  <div className="prose max-w-none">{children}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
