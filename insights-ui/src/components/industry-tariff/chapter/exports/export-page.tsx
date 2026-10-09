import { ChapterArticle } from '@/components/industry-tariff/chapter/chapter-section-page';
import { renderChapterToolsCrossLinks } from '@/components/industry-tariff/chapter/ChapterToolsCrossLinks';
import PrototypeChapterToolLinks from '@/components/industry-tariff/chapter/PrototypeChapterToolLinks';
import type { TariffChapterExports } from '@/types/tariff-chapter-exports';
import { buildPrototypeMetadata, getChapterPrototype } from '@/utils/tariff-reports/chapter-prototype';
import { getChapterExports } from '@/utils/tariff-reports/chapter-exports';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

// Shared metadata + page shell for the three export pages of a chapter report
// (`/exports`, `/exports/tariff-updates`, `/exports/markets`). Chapters without
// export content 404 on all three.

type ExportPageKey = keyof TariffChapterExports;

const SECTION_LABEL: Record<ExportPageKey, string> = {
  overview: 'Export Overview',
  tariffUpdates: 'Export Tariff Updates',
  markets: 'Export Markets',
};

export function buildExportPageMetadata(chapterSlug: string, key: ExportPageKey): Metadata {
  const page = getChapterExports(chapterSlug)?.[key].page;
  if (!page) return { title: 'HTS Chapter Tariff Report' };
  return buildPrototypeMetadata(page.seo, page.path);
}

export async function renderExportPage<K extends ExportPageKey>(
  chapterSlug: string,
  key: K,
  renderBody: (content: TariffChapterExports[K]) => ReactNode
): Promise<JSX.Element> {
  const content = getChapterExports(chapterSlug)?.[key];
  if (!content) notFound();

  const { number, title, slug } = content.chapter;
  const chapter = { number, title, slug };
  // Approach-2 chapters build the tool links from their content file; DB-backed chapters look the HTS chapter up.
  const prototype = getChapterPrototype(chapterSlug);
  const toolsCrossLinks = prototype ? <PrototypeChapterToolLinks chapter={prototype.chapter} /> : await renderChapterToolsCrossLinks(chapter);

  return (
    <ChapterArticle
      chapter={chapter}
      pageTitle={content.page.h1}
      toolsCrossLinks={toolsCrossLinks}
      currentSlug={content.page.slug}
      updatedAt={content.page.lastCheckedAt}
      sectionLabel={SECTION_LABEL[key]}
      direction="export"
      ratesAsOf={content.page.lastCheckedAt}
    >
      {renderBody(content)}
    </ChapterArticle>
  );
}
