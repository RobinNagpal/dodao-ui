import ChapterPlaceholder from '@/components/industry-tariff/chapter/ChapterPlaceholder';
import { chapterCoverHref, resolveChapterRoute } from '@/utils/tariff-reports/chapter-route-helpers';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ chapterSlug: string }> }): Promise<Metadata> {
  const { chapterSlug } = await params;
  const resolved = await resolveChapterRoute(chapterSlug);
  if (!resolved) {
    return { title: 'HTS Chapter Tariff Report' };
  }
  const padded = resolved.chapter.number.toString().padStart(2, '0');
  const title = `HTS Chapter ${padded} — ${resolved.chapter.title} Tariff Report | KoalaGains`;
  const description = `Tariff and trade-policy analysis for HTS Chapter ${padded} (${resolved.chapter.title}). Covers tariff updates, country-level breakdowns, industry structure, sub-areas, and forward-looking conclusions.`;
  const canonicalUrl = `https://koalagains.com${chapterCoverHref(resolved.chapter.slug)}`;
  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title, description },
    keywords: [`HTS Chapter ${padded}`, resolved.chapter.title, 'tariff report', 'trade policy', 'industry analysis', 'KoalaGains'],
  };
}

export default async function ChapterCoverPage({ params }: { params: Promise<{ chapterSlug: string }> }) {
  const { chapterSlug } = await params;
  const resolved = await resolveChapterRoute(chapterSlug);
  if (!resolved) notFound();
  if (resolved.oldUrl) {
    redirect(`/industry-tariff-report/${resolved.oldUrl}`);
  }

  const padded = resolved.chapter.number.toString().padStart(2, '0');
  return (
    <ChapterPlaceholder
      chapter={resolved.chapter}
      pageTitle={`HTS Chapter ${padded} — ${resolved.chapter.title}`}
      description={`Tariff and trade-policy analysis for HTS Chapter ${padded} (${resolved.chapter.title}). Browse tariff updates, country-level breakdowns, industry structure, and forward-looking conclusions for this chapter of the Harmonized Tariff Schedule.`}
    />
  );
}
