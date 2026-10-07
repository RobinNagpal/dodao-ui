import BreadcrumbsWithJsonLd from '@/components/ui/BreadcrumbsWithJsonLd';
import type { ChapterTariffReportResponse } from '@/app/api/industry-tariff-reports/chapters/[chapterSlug]/route';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { getChapterPrototype, prototypeChapterInfo } from '@/utils/tariff-reports/chapter-prototype';
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

  // Approach-2 chapters (issue #1770) carry their chapter facts in a content
  // file, so their breadcrumbs resolve without the report API / tariff tables.
  const prototype = getChapterPrototype(chapterSlug);
  const data = prototype ? null : await fetchChapterTariffReport(chapterSlug);
  const chapterInfo = prototype
    ? prototypeChapterInfo(prototype)
    : data
    ? { number: data.chapter.number, title: data.chapter.title, slug: data.chapter.slug }
    : null;

  if (!chapterInfo) {
    return <PageWrapper>{children}</PageWrapper>;
  }

  const chapter = chapterInfo;
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
