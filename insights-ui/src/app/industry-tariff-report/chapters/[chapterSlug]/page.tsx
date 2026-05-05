import ChapterPlaceholder from '@/components/industry-tariff/chapter/ChapterPlaceholder';
import type { ChapterSeoResponse } from '@/app/api/industry-tariff-reports/chapters/[chapterSlug]/seo/route';
import { chapterCoverHref, resolveChapterRoute } from '@/utils/tariff-reports/chapter-route-helpers';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ chapterSlug: string }> }): Promise<Metadata> {
  const { chapterSlug } = await params;
  const resolved = resolveChapterRoute(chapterSlug);
  if (!resolved) {
    return { title: 'HTS Chapter Tariff Report' };
  }
  const padded = resolved.chapter.number.toString().padStart(2, '0');
  const fallbackTitle = `HTS Chapter ${padded} — ${resolved.chapter.shortName} Tariff Report | KoalaGains`;
  const fallbackDescription = `Tariff and trade-policy analysis for HTS Chapter ${padded} (${resolved.chapter.shortName}). Covers tariff updates, country-level breakdowns, industry structure, sub-areas, and forward-looking conclusions.`;
  const fallbackKeywords = [`HTS Chapter ${padded}`, resolved.chapter.shortName, 'tariff report', 'trade policy', 'industry analysis', 'KoalaGains'];

  let coverSeo: { title?: string; shortDescription?: string; keywords?: string[] } | undefined;
  try {
    const res = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/chapters/${chapterSlug}/seo`);
    if (res.ok) {
      const body: ChapterSeoResponse = await res.json();
      coverSeo = body.seoDetails?.reportCoverSeoDetails;
    }
  } catch {
    // Network/SSR errors fall back to the placeholder copy below.
  }

  const title = coverSeo?.title || fallbackTitle;
  const description = coverSeo?.shortDescription || fallbackDescription;
  const keywords = coverSeo?.keywords?.length ? coverSeo.keywords : fallbackKeywords;
  const canonicalUrl = `https://koalagains.com${chapterCoverHref(resolved.chapter)}`;

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
    keywords,
  };
}

export default async function ChapterCoverPage({ params }: { params: Promise<{ chapterSlug: string }> }) {
  const { chapterSlug } = await params;
  const resolved = resolveChapterRoute(chapterSlug);
  if (!resolved) notFound();
  if (resolved.primaryIndustry) {
    redirect(`/industry-tariff-report/${resolved.primaryIndustry.industryId}`);
  }

  const padded = resolved.chapter.number.toString().padStart(2, '0');
  return (
    <ChapterPlaceholder
      chapter={resolved.chapter}
      pageTitle={`HTS Chapter ${padded} — ${resolved.chapter.shortName}`}
      description={`Tariff and trade-policy analysis for HTS Chapter ${padded} (${resolved.chapter.shortName}). Browse tariff updates, country-level breakdowns, industry structure, and forward-looking conclusions for this chapter of the Harmonized Tariff Schedule.`}
    />
  );
}
