import { ChapterArticle } from '@/components/industry-tariff/chapter/chapter-section-page';
import ChapterUsExportsApproach2 from '@/components/industry-tariff/chapter/exports/ChapterUsExportsApproach2';
import PrototypeChapterToolsBar from '@/components/industry-tariff/chapter/PrototypeChapterToolsBar';
import { buildPrototypeMetadata, getChapterPrototype, prototypeChapterInfo } from '@/utils/tariff-reports/chapter-prototype';
import { CHAPTER_US_EXPORTS_SLUG, chapterSectionHref } from '@/utils/tariff-reports/chapter-route-helpers';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

// "Tariffs on U.S. exports" tool page. Only chapters whose content file has a
// `usExports` block have this page; there is no DB-backed version yet.

export async function generateMetadata({ params }: { params: Promise<{ chapterSlug: string }> }): Promise<Metadata> {
  const { chapterSlug } = await params;
  const usExports = getChapterPrototype(chapterSlug)?.usExports;
  if (!usExports) return { title: 'HTS Chapter Tariff Report' };
  return buildPrototypeMetadata(usExports.seo, chapterSectionHref(chapterSlug, CHAPTER_US_EXPORTS_SLUG));
}

export default async function Page({ params }: { params: Promise<{ chapterSlug: string }> }) {
  const { chapterSlug } = await params;
  const prototype = getChapterPrototype(chapterSlug);
  if (!prototype?.usExports) notFound();

  return (
    <ChapterArticle
      chapter={prototypeChapterInfo(prototype)}
      pageTitle={prototype.usExports.h1}
      toolsCrossLinks={<PrototypeChapterToolsBar chapter={prototype.chapter} usExportsActive />}
      currentSlug={CHAPTER_US_EXPORTS_SLUG}
      updatedAt={prototype.usExports.lastCheckedAt}
      sectionLabel="Tariffs on U.S. Exports"
    >
      <ChapterUsExportsApproach2 content={prototype} exports={prototype.usExports} />
    </ChapterArticle>
  );
}
