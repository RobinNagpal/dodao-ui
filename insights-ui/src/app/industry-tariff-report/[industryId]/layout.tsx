import MobileNavToggle from '@/components/industry-tariff/mobile-nav-toggle';
import CollapsibleLayout from '@/components/industry-tariff/collapsible-layout';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { getLastModifiedDateForIndustry } from '@/scripts/industry-tariff-reports/fetch-tariff-reports-with-updated-at';
import type { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { tariffReportTag } from '@/utils/tariff-report-cache-utils';
import type React from 'react';

export default async function IndustryTariffReportLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ industryId: TariffIndustryId }>;
}) {
  const { industryId } = await params;
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}`, {
    next: { tags: [tariffReportTag(industryId)] },
  });
  let report: IndustryTariffReport | null = null;

  if (reportResponse.ok) {
    report = await reportResponse.json();
  }

  // Fetch last modified date for the industry
  let lastModified = '';
  try {
    lastModified = await getLastModifiedDateForIndustry(industryId);
  } catch (error) {
    lastModified = new Date().toISOString().split('T')[0];
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
      href: '/tariff-reports',
      current: false,
    },
    {
      name: report.reportCover?.title || `Report ${industryId}`,
      href: `/industry-tariff-report/${industryId}`,
      current: true,
    },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      {/* Last Modified Date - Visible only on mobile screens */}
      {lastModified && (
        <div className="block lg:hidden mx-auto max-w-7xl px-4 sm:px-6 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">Last Updated:</span>
            <span>
              {new Date(lastModified).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      )}

      <div className="mx-auto text-color">
        <div className="mx-auto">
          {/* Mobile navigation toggle - only visible on small screens */}
          <div className="block lg:hidden fixed bottom-6 left-6 z-50">
            <MobileNavToggle report={report} industryId={industryId} lastModified={lastModified} />
          </div>

          {/* Collapsible Layout for Desktop */}
          <div className="hidden lg:block">
            <CollapsibleLayout report={report} industryId={industryId} lastModified={lastModified}>
              {children}
            </CollapsibleLayout>
          </div>

          {/* Original Layout for Mobile */}
          <div className="block lg:hidden">
            <div className="flex min-h-[calc(100vh-10rem)] overflow-hidden rounded-lg border border-color background-color shadow-lg">
              {/* Right side - Book content */}
              <div className="flex-1 bg-background p-2 sm:p-3">
                <div className="mx-auto max-w-4xl">
                  <div className="relative min-h-[calc(100vh-10rem)] rounded-lg block-bg-color p-2 sm:p-2 shadow-md">
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
      </div>
    </PageWrapper>
  );
}
