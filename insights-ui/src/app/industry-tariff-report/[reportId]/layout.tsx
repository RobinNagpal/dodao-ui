import type React from 'react';
import { CSSProperties } from 'react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import type { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import ReportActionsDropdown from '@/components/industry-tariff/ReportActionsDropdown';
import BookNavigation from '@/components/industry-tariff/book-navigation';
import type { IndustryTariffReport } from '@/types/industry-tariff/industry-tariff-report-types';
import type { Metadata } from 'next';
import { headers } from 'next/headers';

export async function generateMetadata({ params }: { params: Promise<{ reportId: string }> }): Promise<Metadata> {
  const { reportId } = await params;

  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${reportId}`, { cache: 'no-cache' });
  let reportData: IndustryTariffReport | null = null;

  if (reportResponse.ok) {
    reportData = await reportResponse.json();
  }

  // Extract industry name or use report ID as fallback
  const industryName = reportData?.executiveSummary?.title || `Industry Report ${reportId}`;
  const shortDescription = `Comprehensive tariff analysis for ${industryName}. Explore industry insights, tariff impacts, and company evaluations.`;
  const canonicalUrl = `https://koalagains.com/industry-tariff-report/${reportId}`;

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

export default async function IndustryTariffReportLayout({ children, params }: { children: React.ReactNode; params: Promise<{ reportId: string }> }) {
  const paa = await params;
  const { reportId } = paa;
  const heads = await headers();

  const pathname = heads.get('next-url');
  console.log(`Pathname: ${pathname}`);
  console.log(`Pathname: ${JSON.stringify(paa)}`);
  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${reportId}`, { cache: 'no-cache' });
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
      name: 'Industry Reports',
      href: '/industry-tariff-report',
      current: false,
    },
    {
      name: report.executiveSummary?.title || `Report ${reportId}`,
      href: `/industry-tariff-report/${reportId}`,
      current: true,
    },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-color">
        <div className="mx-auto">
          {/* Private Actions Dropdown */}
          <div className="flex justify-end mb-4">
            <PrivateWrapper>
              <ReportActionsDropdown reportId={reportId} />
            </PrivateWrapper>
          </div>

          {/* Book UI with Navigation and Content */}
          <div className="flex h-[calc(100vh-10rem)] overflow-hidden rounded-lg border border-color background-color shadow-lg">
            {/* Left side - Book spine/navigation */}
            <BookNavigation report={report} reportId={reportId} />

            {/* Right side - Book content */}
            <div className="flex-1 overflow-y-auto bg-background p-8">
              <div className="mx-auto max-w-4xl">
                <div className="relative min-h-[calc(100vh-16rem)] rounded-lg block-bg-color p-8 shadow-md">
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
