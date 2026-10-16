import BreadcrumbsWithJsonLd from '@/components/ui/BreadcrumbsWithJsonLd';
import { getChapterExports } from '@/utils/tariff-reports/chapter-exports';
import { chapterCoverHref, chapterExportHref } from '@/utils/tariff-reports/chapter-route-helpers';
import { isValidTariffChapterSlug, rejectTariffPageParam } from '@/utils/tariff-reports/tariff-input-validation';
import type { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import type React from 'react';

// Layout for the export pages of a chapter report (/industry-tariff-report/exports/chapters/<slug>/**).
// Same slug guard as the import pages' layout: malformed slugs (scanner probes) 404 before any lookup.
// Export content always comes from a content file, so the breadcrumbs need no fetch.
export default async function ChapterExportsLayout({ children, params }: { children: React.ReactNode; params: Promise<{ chapterSlug: string }> }) {
  const { chapterSlug } = await params;
  if (!isValidTariffChapterSlug(chapterSlug)) rejectTariffPageParam('chapterSlug', chapterSlug);

  const chapter = getChapterExports(chapterSlug)?.overview.chapter;
  if (!chapter) {
    return <PageWrapper>{children}</PageWrapper>;
  }

  const breadcrumbs: BreadcrumbsOjbect[] = [
    { name: 'Tariff Reports', href: '/tariff-reports', current: false },
    { name: `Chapter ${chapter.padded} — ${chapter.title}`, href: chapterCoverHref(chapter.slug), current: false },
    { name: 'U.S. exports', href: chapterExportHref(chapter.slug), current: true },
  ];

  return (
    <PageWrapper>
      <BreadcrumbsWithJsonLd breadcrumbs={breadcrumbs} />
      <div className="text-color">{children}</div>
    </PageWrapper>
  );
}
