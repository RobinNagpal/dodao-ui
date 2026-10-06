import MobileNavToggle from '@/components/industry-tariff/mobile-nav-toggle';
import CollapsibleLayout from '@/components/industry-tariff/collapsible-layout';
import BreadcrumbsWithJsonLd from '@/components/ui/BreadcrumbsWithJsonLd';
import { findIndustryByLegacyUrl } from '@/scripts/industry-tariff-reports/tariff-industries';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { chapterCoverHref } from '@/utils/tariff-reports/chapter-route-helpers';
import { getChapterSlugForOldUrl, getSeededLastModifiedForOldUrl } from '@/utils/tariff-reports/seeded-chapter-reports';
import type { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { truncateForLog } from '@/utils/route-param-utils';
import { tariffReportTag } from '@/utils/tariff-report-tags';
import { notFound } from 'next/navigation';
import type React from 'react';

export default async function IndustryTariffReportLayout({ children, params }: { children: React.ReactNode; params: Promise<{ industryId: string }> }) {
  const { industryId } = await params;

  // The ONE unknown-industry guard for every `/industry-tariff-report/[industryId]/**` page. Unknown
  // ids (scanner probes, mistyped URLs) are a real 404: rendering an empty page with HTTP 200 would be
  // a soft 404 that CloudFront caches for 6 days. Checked before any fetch, so it costs no DB work.
  if (!findIndustryByLegacyUrl(industryId)) {
    console.warn(`[industry-tariff-report/[industryId]] unknown industry, returning 404: ${truncateForLog(industryId)}`);
    notFound();
  }

  const url = `${getBaseUrl()}/api/industry-tariff-reports/${encodeURIComponent(industryId)}`;
  const reportResponse = await fetch(url, {
    next: { tags: [tariffReportTag(industryId)] },
  });
  // The industry is known, so the API answers 200 (`{}` when no report exists yet). Any non-OK status
  // is a real failure and stays an error. Next's data cache only stores OK responses.
  if (!reportResponse.ok) {
    throw new Error(`industry tariff report fetch failed (${reportResponse.status}): ${url}`);
  }
  const report = (await reportResponse.json()) as IndustryTariffReport;

  const lastModified = (await getSeededLastModifiedForOldUrl(industryId)) ?? '';

  const navTitle = report.reportCover?.title || `Tariff Report ${industryId}`;
  const chapterSlug = await getChapterSlugForOldUrl(industryId);
  const basePath = chapterSlug ? chapterCoverHref(chapterSlug) : `/industry-tariff-report/${industryId}`;

  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: 'Tariff Reports',
      href: '/tariff-reports',
      current: false,
    },
    {
      name: report.reportCover?.title || `Report ${industryId}`,
      href: basePath,
      current: true,
    },
  ];

  return (
    <PageWrapper>
      <BreadcrumbsWithJsonLd breadcrumbs={breadcrumbs} />

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
          <div className="block lg:hidden fixed bottom-6 left-6 z-50">
            <MobileNavToggle basePath={basePath} navTitle={navTitle} lastModified={lastModified} />
          </div>

          <div className="hidden lg:block">
            <CollapsibleLayout basePath={basePath} lastModified={lastModified}>
              {children}
            </CollapsibleLayout>
          </div>

          <div className="block lg:hidden">
            <div className="flex min-h-[calc(100vh-10rem)] overflow-hidden rounded-lg border border-color background-color shadow-lg">
              <div className="flex-1 bg-background p-2 sm:p-3">
                <div className="mx-auto max-w-4xl">
                  <div className="relative min-h-[calc(100vh-10rem)] rounded-lg block-bg-color p-2 sm:p-2 shadow-md">
                    <div className="absolute right-0 top-0 h-12 w-12 bg-surface-2">
                      <div className="absolute right-0 top-0 h-0 w-0 border-l-[48px] border-b-[48px] border-l-transparent border-b-[var(--block-bg)]"></div>
                    </div>

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
