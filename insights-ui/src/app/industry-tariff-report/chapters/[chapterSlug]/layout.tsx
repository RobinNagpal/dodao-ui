import BreadcrumbsWithJsonLd from '@/components/ui/BreadcrumbsWithJsonLd';
import type { ChapterTariffReportResponse } from '@/app/api/industry-tariff-reports/chapters/[chapterSlug]/route';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { chapterCoverHref } from '@/utils/tariff-reports/chapter-route-helpers';
import { tariffReportTag } from '@/utils/tariff-report-tags';
import { isValidTariffChapterSlug, rejectTariffPageParam } from '@/utils/tariff-reports/tariff-input-validation';
import type { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import type React from 'react';

async function fetchChapterTariffReport(chapterSlug: string): Promise<ChapterTariffReportResponse | null> {
  const response = await fetch(`${getBaseUrlForServerSidePages()}/api/industry-tariff-reports/chapters/${chapterSlug}`, {
    next: { tags: [tariffReportTag(chapterSlug)] },
  });
  return response.ok ? response.json() : null;
}

export default async function ChapterReportLayout({ children, params }: { children: React.ReactNode; params: Promise<{ chapterSlug: string }> }) {
  const { chapterSlug } = await params;
  // The ONE logging chapter-slug guard for every `/industry-tariff-report/chapters/[chapterSlug]/**`
  // page: malformed slugs (scanner probes) 404 before any fetch. Pages and generateMetadata repeat the
  // check silently, so a rejected request logs this single `[input-rejected]` warn. A well-formed but
  // unknown slug still falls through to the pages' normal not-found handling.
  if (!isValidTariffChapterSlug(chapterSlug)) rejectTariffPageParam('chapterSlug', chapterSlug);
  const data = await fetchChapterTariffReport(chapterSlug);

  if (!data) {
    return <PageWrapper>{children}</PageWrapper>;
  }

  const { chapter } = data;
  const padded = chapter.number.toString().padStart(2, '0');
  const basePath = chapterCoverHref(chapter.slug);

  const breadcrumbs: BreadcrumbsOjbect[] = [
    { name: 'Tariff Reports', href: '/tariff-reports', current: false },
    { name: `Chapter ${padded} — ${chapter.title}`, href: basePath, current: true },
  ];

  return (
    <PageWrapper>
      <BreadcrumbsWithJsonLd breadcrumbs={breadcrumbs} />
      <div className="text-color">{children}</div>
    </PageWrapper>
  );
}
