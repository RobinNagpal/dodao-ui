import ChapterPlaceholder from '@/components/industry-tariff/chapter/ChapterPlaceholder';
import { chapterSectionHref, getChapterSectionCopy, resolveChapterRoute } from '@/utils/tariff-reports/chapter-route-helpers';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

// Small wrappers used by every chapter section page (`tariff-updates`, `all-countries-tariff-updates`, ...).
// Keeps the per-route page.tsx files to a few lines each — same resolve/redirect/render flow, only
// the section slug differs.

export function buildChapterSectionMetadata(chapterSlug: string, sectionSlug: string): Metadata {
  const resolved = resolveChapterRoute(chapterSlug);
  if (!resolved) {
    return { title: 'HTS Chapter Tariff Report' };
  }
  const copy = getChapterSectionCopy(sectionSlug, resolved.chapter);
  if (!copy) {
    return { title: 'HTS Chapter Tariff Report' };
  }
  const padded = resolved.chapter.number.toString().padStart(2, '0');
  const title = `${copy.pageTitle} — HTS Chapter ${padded} ${resolved.chapter.shortName} | KoalaGains`;
  const canonicalUrl = `https://koalagains.com${chapterSectionHref(resolved.chapter, sectionSlug)}`;
  return {
    title,
    description: copy.description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description: copy.description,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title, description: copy.description },
    keywords: [`HTS Chapter ${padded}`, resolved.chapter.shortName, copy.pageTitle, 'tariff report', 'trade policy', 'KoalaGains'],
  };
}

export function renderChapterSection(chapterSlug: string, sectionSlug: string): JSX.Element {
  const resolved = resolveChapterRoute(chapterSlug);
  if (!resolved) notFound();
  const copy = getChapterSectionCopy(sectionSlug, resolved.chapter);
  if (!copy) notFound();
  if (resolved.primaryIndustry) {
    redirect(`/industry-tariff-report/${resolved.primaryIndustry.industryId}/${sectionSlug}`);
  }
  return (
    <ChapterPlaceholder
      chapter={resolved.chapter}
      ownerIndustry={resolved.ownerIndustry}
      pageTitle={copy.pageTitle}
      currentSectionSlug={sectionSlug}
      description={copy.description}
    />
  );
}
