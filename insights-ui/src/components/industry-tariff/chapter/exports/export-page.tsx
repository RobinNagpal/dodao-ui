import { ChapterArticle } from '@/components/industry-tariff/chapter/chapter-section-page';
import { renderChapterToolsCrossLinks } from '@/components/industry-tariff/chapter/ChapterToolsCrossLinks';
import PrototypeChapterToolLinks from '@/components/industry-tariff/chapter/PrototypeChapterToolLinks';
import type { TariffChapterExports } from '@/types/tariff-chapter-exports';
import { buildPrototypeMetadata, getChapterPrototype } from '@/utils/tariff-reports/chapter-prototype';
import { EXPORT_PAGE_SLUGS, getChapterExports } from '@/utils/tariff-reports/chapter-exports';
import { approach2SectionLabel, chapterExportHref } from '@/utils/tariff-reports/chapter-route-helpers';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

// Shared metadata + page shell for the five export pages of a chapter report
// (/industry-tariff-report/exports/chapters/<slug>[/tariff-updates|/markets|/rules|/faq]).
// Chapters without export content 404 on all five.

type ExportPageKey = keyof TariffChapterExports;

// Pages that hold no rates say "Updated" instead of "Rates checked", like the import FAQ.
const AS_OF_LABEL: Partial<Record<ExportPageKey, string>> = { rules: 'Updated', faq: 'Updated' };

export function buildExportPageMetadata(chapterSlug: string, key: ExportPageKey): Metadata {
  const page = getChapterExports(chapterSlug)?.[key].page;
  if (!page) return { title: 'HTS Chapter Tariff Report' };
  return buildPrototypeMetadata(page.seo, chapterExportHref(chapterSlug, EXPORT_PAGE_SLUGS[key]));
}

export async function renderExportPage<K extends ExportPageKey>(
  chapterSlug: string,
  key: K,
  renderBody: (content: TariffChapterExports[K], exports: TariffChapterExports) => ReactNode
): Promise<JSX.Element> {
  const exports = getChapterExports(chapterSlug);
  const content = exports?.[key];
  if (!exports || !content) notFound();

  const { number, title, slug } = content.chapter;
  const chapter = { number, title, slug };
  // Approach-2 chapters build the tool links from their content file; DB-backed chapters look the HTS chapter up.
  const prototype = await getChapterPrototype(chapterSlug);
  const toolsCrossLinks = prototype ? <PrototypeChapterToolLinks chapter={prototype.chapter} /> : await renderChapterToolsCrossLinks(chapter);

  return (
    <ChapterArticle
      chapter={chapter}
      pageTitle={content.page.h1}
      toolsCrossLinks={toolsCrossLinks}
      currentSlug={content.page.slug}
      updatedAt={content.page.lastCheckedAt}
      sectionLabel={approach2SectionLabel(content.page.slug)}
      direction="export"
      ratesAsOf={content.page.lastCheckedAt}
      asOfLabel={AS_OF_LABEL[key]}
    >
      {renderBody(content, exports)}
    </ChapterArticle>
  );
}
