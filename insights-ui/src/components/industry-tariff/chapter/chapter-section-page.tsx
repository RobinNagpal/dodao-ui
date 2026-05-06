import ChapterPlaceholder from '@/components/industry-tariff/chapter/ChapterPlaceholder';
import { chapterSectionHref, getChapterSectionCopy, resolveChapterRoute } from '@/utils/tariff-reports/chapter-route-helpers';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

export async function buildChapterSectionMetadata(chapterSlug: string, sectionSlug: string): Promise<Metadata> {
  const resolved = await resolveChapterRoute(chapterSlug);
  if (!resolved) {
    return { title: 'HTS Chapter Tariff Report' };
  }
  const copy = getChapterSectionCopy(sectionSlug, resolved.chapter);
  if (!copy) {
    return { title: 'HTS Chapter Tariff Report' };
  }
  const padded = resolved.chapter.number.toString().padStart(2, '0');
  const title = `${copy.pageTitle} — HTS Chapter ${padded} ${resolved.chapter.title} | KoalaGains`;
  const canonicalUrl = `https://koalagains.com${chapterSectionHref(resolved.chapter.slug, sectionSlug)}`;
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
    keywords: [`HTS Chapter ${padded}`, resolved.chapter.title, copy.pageTitle, 'tariff report', 'trade policy', 'KoalaGains'],
  };
}

export async function renderChapterSection(chapterSlug: string, sectionSlug: string): Promise<JSX.Element> {
  const resolved = await resolveChapterRoute(chapterSlug);
  if (!resolved) notFound();
  const copy = getChapterSectionCopy(sectionSlug, resolved.chapter);
  if (!copy) notFound();
  if (resolved.oldUrl) {
    redirect(`/industry-tariff-report/${resolved.oldUrl}/${sectionSlug}`);
  }
  return <ChapterPlaceholder chapter={resolved.chapter} pageTitle={copy.pageTitle} currentSectionSlug={sectionSlug} description={copy.description} />;
}
