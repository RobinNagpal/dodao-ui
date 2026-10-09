import { ChapterArticle } from '@/components/industry-tariff/chapter/chapter-section-page';
import ChapterPlaceholder from '@/components/industry-tariff/chapter/ChapterPlaceholder';
import ChapterOverviewApproach2 from '@/components/industry-tariff/chapter/overview/ChapterOverviewApproach2';
import PrototypeChapterToolLinks from '@/components/industry-tariff/chapter/PrototypeChapterToolLinks';
import { renderChapterToolsCrossLinks } from '@/components/industry-tariff/chapter/ChapterToolsCrossLinks';
import type { ChapterTariffReportResponse } from '@/app/api/industry-tariff-reports/chapters/[chapterSlug]/route';
import type { PageSeoDetails } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseChapterBodyMarkdown } from '@/util/parse-markdown';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { buildPrototypeMetadata, getChapterPrototype, prototypeChapterInfo } from '@/utils/tariff-reports/chapter-prototype';
import { chapterCoverHref, chapterSectionHref } from '@/utils/tariff-reports/chapter-route-helpers';
import { tariffReportTag } from '@/utils/tariff-report-tags';
import { isValidTariffChapterSlug } from '@/utils/tariff-reports/tariff-input-validation';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

type SeoDetailsWithAliases = PageSeoDetails & { seoTitle?: string; metaDescription?: string; seo_title?: string; meta_description?: string };

async function fetchChapterTariffReport(chapterSlug: string): Promise<ChapterTariffReportResponse | null> {
  // Malformed slug: the layout logs the rejection and 404s; skip the fetch silently here.
  if (!isValidTariffChapterSlug(chapterSlug)) return null;
  const response = await fetch(`${getBaseUrlForServerSidePages()}/api/industry-tariff-reports/chapters/${chapterSlug}`, {
    next: { tags: [tariffReportTag(chapterSlug)] },
  });
  return response.ok ? response.json() : null;
}

export async function generateMetadata({ params }: { params: Promise<{ chapterSlug: string }> }): Promise<Metadata> {
  const { chapterSlug } = await params;

  // Approach-2 chapters (issue #1770) carry their own SEO copy in the content
  // file, and must resolve without the tariff tables being populated.
  const prototype = getChapterPrototype(chapterSlug);
  if (prototype) return buildPrototypeMetadata(prototype.overview.seo, chapterCoverHref(prototype.chapter.slug));

  const data = await fetchChapterTariffReport(chapterSlug);
  if (!data) {
    return { title: 'HTS Chapter Tariff Report' };
  }
  const { chapter, report } = data;
  const padded = chapter.number.toString().padStart(2, '0');
  const fallbackTitle = `HTS Chapter ${padded} — ${chapter.title} Tariff Report | KoalaGains`;
  const fallbackDescription = `Tariff and trade-policy analysis for HTS Chapter ${padded} (${chapter.title}). Covers tariff updates, country-level breakdowns, industry structure, sub-areas, and forward-looking conclusions.`;
  const fallbackKeywords = [`HTS Chapter ${padded}`, chapter.title, 'tariff report', 'trade policy', 'industry analysis', 'KoalaGains'];
  const coverSeo = report.reportSeoDetails?.reportCoverSeoDetails as SeoDetailsWithAliases | undefined;

  const title = coverSeo?.title || coverSeo?.seoTitle || coverSeo?.seo_title || fallbackTitle;
  const description = coverSeo?.shortDescription || coverSeo?.metaDescription || coverSeo?.meta_description || fallbackDescription;
  const keywords = coverSeo?.keywords?.length ? coverSeo.keywords : fallbackKeywords;
  const canonicalUrl = `https://koalagains.com${chapterCoverHref(chapter.slug)}`;

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

  // Approach-2 chapters render from their content file instead of the report
  // tables (issue #1770). While the page shape is being iterated on, the
  // content lives in `src/tariff-data/chapters/<slug>.json` — so the page also
  // renders locally, where `hts_codes` / `tariff_trade_analytics` are empty.
  // Chapters without a content file keep the DB-backed flow below untouched.
  const prototype = getChapterPrototype(chapterSlug);
  if (prototype) {
    const chapterInfo = prototypeChapterInfo(prototype);
    const prototypeCrossLinks = <PrototypeChapterToolLinks chapter={prototype.chapter} />;
    return (
      <ChapterArticle
        chapter={chapterInfo}
        pageTitle={prototype.overview.h1}
        toolsCrossLinks={prototypeCrossLinks}
        ratesAsOf={prototype.asOf}
        currentSlug="overview"
        updatedAt={prototype.asOf}
        sectionLabel="Rate table"
      >
        <ChapterOverviewApproach2 content={prototype} />
      </ChapterArticle>
    );
  }

  const data = await fetchChapterTariffReport(chapterSlug);
  if (!data) notFound();

  const { chapter, report, createdAt, updatedAt } = data;
  const padded = chapter.number.toString().padStart(2, '0');
  const fallbackPageTitle = `HTS Chapter ${padded} — ${chapter.title}`;
  const fallbackDescription = `Tariff and trade-policy analysis for HTS Chapter ${padded} (${chapter.title}). Browse tariff updates, country-level breakdowns, industry structure, and forward-looking conclusions for this chapter of the Harmonized Tariff Schedule.`;

  const hasContent = Boolean(report.reportCover || report.executiveSummary || report.tariffUpdates?.countrySpecificTariffs?.length);
  if (!hasContent) {
    return <ChapterPlaceholder chapter={chapter} pageTitle={fallbackPageTitle} description={fallbackDescription} />;
  }

  const tariffUpdatesSummary =
    report.tariffUpdates?.countrySpecificTariffs?.map((tariff) => ({
      countryName: tariff.countryName,
      newChangesFirstSentence: tariff.newChanges,
    })) ?? [];

  const toolsCrossLinks = await renderChapterToolsCrossLinks(chapter);

  const pageTitle = report.reportCover?.title || fallbackPageTitle;

  const actions = [
    {
      kind: 'simple' as const,
      key: 'regenerate-cover',
      label: 'Regenerate Cover',
      apiPath: 'generate-report-cover',
      modalTitle: 'Regenerate Cover',
      confirmationText: 'Regenerate the cover for this chapter? This replaces the current content.',
      successMessage: 'Cover regenerated.',
    },
    {
      kind: 'simple' as const,
      key: 'regenerate-executive-summary',
      label: 'Regenerate Executive Summary',
      apiPath: 'generate-executive-summary',
      modalTitle: 'Regenerate Executive Summary',
      confirmationText: 'Regenerate the executive summary? This replaces the current content.',
      successMessage: 'Executive summary regenerated.',
    },
    {
      kind: 'simple' as const,
      key: 'regenerate-seo',
      label: 'Regenerate SEO',
      apiPath: 'generate-seo-info',
      modalTitle: 'Regenerate SEO',
      confirmationText: 'Regenerate SEO metadata for every section of this chapter?',
      successMessage: 'SEO metadata regenerated.',
    },
  ];

  return (
    <ChapterArticle
      chapter={chapter}
      pageTitle={pageTitle}
      actions={actions}
      toolsCrossLinks={toolsCrossLinks}
      currentSlug="overview"
      createdAt={createdAt}
      updatedAt={updatedAt}
      sectionLabel="Overview"
    >
      <div className="space-y-10">
        <section>
          <h2 className="text-xl font-semibold heading-color mb-3">Overview</h2>
          {report.reportCover ? (
            <div
              className="prose max-w-none markdown markdown-body"
              dangerouslySetInnerHTML={{ __html: parseChapterBodyMarkdown(report.reportCover.reportCoverContent) }}
            />
          ) : (
            <p className="text-muted italic">No content available</p>
          )}
        </section>

        {tariffUpdatesSummary.length > 0 && (
          <section>
            <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
              <h2 className="text-xl font-semibold heading-color">Latest HTS Chapter {padded} Tariff Actions</h2>
              <a href={chapterSectionHref(chapter.slug, 'tariff-updates')} className="link-color text-sm font-medium hover:underline whitespace-nowrap">
                View full country breakdown &rarr;
              </a>
            </div>
            <div className="space-y-4">
              {tariffUpdatesSummary.map((tariff, index) => (
                <div key={index} className="bg-surface rounded-md p-4">
                  <h3 className="font-bold text-lg mb-2">{tariff.countryName}</h3>
                  <div dangerouslySetInnerHTML={{ __html: parseChapterBodyMarkdown(tariff.newChangesFirstSentence) }} className="markdown markdown-body" />
                </div>
              ))}
            </div>
          </section>
        )}

        {report.executiveSummary && (
          <section>
            <h2 className="text-xl font-semibold heading-color mb-3">Executive Summary</h2>
            <div
              className="prose max-w-none markdown markdown-body"
              dangerouslySetInnerHTML={{ __html: parseChapterBodyMarkdown(report.executiveSummary.executiveSummary) }}
            />
          </section>
        )}
      </div>
    </ChapterArticle>
  );
}
