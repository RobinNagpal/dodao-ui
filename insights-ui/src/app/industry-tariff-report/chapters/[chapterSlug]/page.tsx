import ChapterPlaceholder from '@/components/industry-tariff/chapter/ChapterPlaceholder';
import { renderSection } from '@/components/industry-tariff/renderers/SectionRenderer';
import type { ChapterSeoResponse } from '@/app/api/industry-tariff-reports/chapters/[chapterSlug]/seo/route';
import { readIndustryTariffReportBySlug } from '@/scripts/industry-tariff-reports/tariff-report-repository';
import { parseMarkdown } from '@/util/parse-markdown';
import { chapterCoverHref, chapterSectionHref, resolveChapterRoute } from '@/utils/tariff-reports/chapter-route-helpers';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ chapterSlug: string }> }): Promise<Metadata> {
  const { chapterSlug } = await params;
  const resolved = await resolveChapterRoute(chapterSlug);
  if (!resolved) {
    return { title: 'HTS Chapter Tariff Report' };
  }
  const padded = resolved.chapter.number.toString().padStart(2, '0');
  const fallbackTitle = `HTS Chapter ${padded} — ${resolved.chapter.title} Tariff Report | KoalaGains`;
  const fallbackDescription = `Tariff and trade-policy analysis for HTS Chapter ${padded} (${resolved.chapter.title}). Covers tariff updates, country-level breakdowns, industry structure, sub-areas, and forward-looking conclusions.`;
  const fallbackKeywords = [`HTS Chapter ${padded}`, resolved.chapter.title, 'tariff report', 'trade policy', 'industry analysis', 'KoalaGains'];

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
    keywords,
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
  const fallbackPageTitle = `HTS Chapter ${padded} — ${resolved.chapter.title}`;
  const fallbackDescription = `Tariff and trade-policy analysis for HTS Chapter ${padded} (${resolved.chapter.title}). Browse tariff updates, country-level breakdowns, industry structure, and forward-looking conclusions for this chapter of the Harmonized Tariff Schedule.`;

  const report = await readIndustryTariffReportBySlug(chapterSlug);
  const hasContent = Boolean(report.reportCover || report.executiveSummary || report.tariffUpdates?.countrySpecificTariffs?.length);
  if (!hasContent) {
    return <ChapterPlaceholder chapter={resolved.chapter} pageTitle={fallbackPageTitle} description={fallbackDescription} />;
  }

  const tariffUpdatesSummary =
    report.tariffUpdates?.countrySpecificTariffs?.map((tariff) => ({
      countryName: tariff.countryName,
      newChangesFirstSentence: tariff.newChanges,
    })) ?? [];

  return (
    <div className="mx-auto max-w-7xl py-2">
      <div className="mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="text-sm text-muted-foreground mb-1">
          HTS Chapter {padded} — {resolved.chapter.title}
        </div>
        <h1 className="text-3xl font-bold heading-color">{report.reportCover?.title || fallbackPageTitle}</h1>
      </div>

      <div className="space-y-12">
        {renderSection(
          'Overview',
          report.reportCover ? (
            <div
              className="prose max-w-none markdown markdown-body"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(report.reportCover.reportCoverContent) }}
            />
          ) : (
            <p className="text-gray-500 italic">No content available</p>
          )
        )}

        {tariffUpdatesSummary.length > 0 &&
          renderSection(
            `Latest HTS Chapter ${padded} Tariff Actions`,
            <div>
              <div className="space-y-4 mb-4">
                {tariffUpdatesSummary.map((tariff, index) => (
                  <div key={index} className="mb-6">
                    <h3 className="font-bold text-lg mb-2">{tariff.countryName}</h3>
                    <div dangerouslySetInnerHTML={{ __html: parseMarkdown(tariff.newChangesFirstSentence) }} className="markdown markdown-body" />
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <a href={chapterSectionHref(resolved.chapter.slug, 'tariff-updates')} className="link-color underline font-medium">
                  See full country breakdown
                </a>
              </div>
            </div>
          )}

        {report.executiveSummary &&
          renderSection(
            'Executive Summary',
            <div
              className="prose max-w-none markdown markdown-body"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(report.executiveSummary.executiveSummary) }}
            />
          )}
      </div>
    </div>
  );
}
