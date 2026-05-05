import ChapterPlaceholder from '@/components/industry-tariff/chapter/ChapterPlaceholder';
import type { ChapterSeoResponse } from '@/app/api/industry-tariff-reports/chapters/[chapterSlug]/seo/route';
import type { PageSeoDetails, TariffReportSeoDetails } from '@/scripts/industry-tariff-reports/tariff-types';
import { chapterSectionHref, getChapterSectionCopy, resolveChapterRoute } from '@/utils/tariff-reports/chapter-route-helpers';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

// Small wrappers used by every chapter section page (`tariff-updates`, `understand-industry`, ...).
// Keeps the per-route page.tsx files to a few lines each — same resolve/redirect/render flow, only
// the section slug differs.

const SECTION_SEO_KEY: Record<string, keyof TariffReportSeoDetails> = {
  'tariff-updates': 'tariffUpdatesSeoDetails',
  'understand-industry': 'understandIndustrySeoDetails',
  'industry-areas': 'industryAreasSeoDetails',
  'final-conclusion': 'finalConclusionSeoDetails',
};

function pickSectionSeo(seo: TariffReportSeoDetails | null | undefined, sectionSlug: string): PageSeoDetails | undefined {
  const key = SECTION_SEO_KEY[sectionSlug];
  if (!key || !seo) return undefined;
  const value = seo[key];
  // evaluateIndustryAreasSeoDetails is a Record, not PageSeoDetails — exclude it.
  if (!value || typeof value !== 'object' || !('title' in value)) return undefined;
  return value as PageSeoDetails;
}

export async function buildChapterSectionMetadata(chapterSlug: string, sectionSlug: string): Promise<Metadata> {
  const resolved = resolveChapterRoute(chapterSlug);
  if (!resolved) {
    return { title: 'HTS Chapter Tariff Report' };
  }
  const copy = getChapterSectionCopy(sectionSlug, resolved.chapter);
  if (!copy) {
    return { title: 'HTS Chapter Tariff Report' };
  }
  const padded = resolved.chapter.number.toString().padStart(2, '0');
  const fallbackTitle = `${copy.pageTitle} — HTS Chapter ${padded} ${resolved.chapter.shortName} | KoalaGains`;
  const fallbackKeywords = [`HTS Chapter ${padded}`, resolved.chapter.shortName, copy.pageTitle, 'tariff report', 'trade policy', 'KoalaGains'];

  let sectionSeo: PageSeoDetails | undefined;
  try {
    const res = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/chapters/${chapterSlug}/seo`);
    if (res.ok) {
      const body: ChapterSeoResponse = await res.json();
      sectionSeo = pickSectionSeo(body.seoDetails, sectionSlug);
    }
  } catch {
    // Network/SSR errors fall back to the placeholder copy below.
  }

  const title = sectionSeo?.title || fallbackTitle;
  const description = sectionSeo?.shortDescription || copy.description;
  const keywords = sectionSeo?.keywords?.length ? sectionSeo.keywords : fallbackKeywords;
  const canonicalUrl = `https://koalagains.com${chapterSectionHref(resolved.chapter, sectionSlug)}`;

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

export function renderChapterSection(chapterSlug: string, sectionSlug: string): JSX.Element {
  const resolved = resolveChapterRoute(chapterSlug);
  if (!resolved) notFound();
  const copy = getChapterSectionCopy(sectionSlug, resolved.chapter);
  if (!copy) notFound();
  if (resolved.primaryIndustry) {
    redirect(`/industry-tariff-report/${resolved.primaryIndustry.industryId}/${sectionSlug}`);
  }
  return <ChapterPlaceholder chapter={resolved.chapter} pageTitle={copy.pageTitle} currentSectionSlug={sectionSlug} description={copy.description} />;
}
