import ChapterPlaceholder from '@/components/industry-tariff/chapter/ChapterPlaceholder';
import { CountryNavigation } from '@/components/industry-tariff/renderers/CountryNavigation';
import { CountryTariffRenderer } from '@/components/industry-tariff/renderers/CountryTariffRenderer';
import { FinalConclusionRenderer } from '@/components/industry-tariff/renderers/FinalConclusionRenderer';
import { UnderstandIndustryRenderer } from '@/components/industry-tariff/renderers/UnderstandIndustryRenderer';
import type { ChapterSeoResponse } from '@/app/api/industry-tariff-reports/chapters/[chapterSlug]/seo/route';
import { getMarkdownContentForIndustryAreas } from '@/scripts/industry-tariff-reports/render-tariff-markdown';
import { readIndustryTariffReportBySlug } from '@/scripts/industry-tariff-reports/tariff-report-repository';
import type { IndustryTariffReport, PageSeoDetails, TariffReportSeoDetails } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseMarkdown } from '@/util/parse-markdown';
import { ChapterRouteInfo, chapterSectionHref, getChapterSectionCopy, resolveChapterRoute } from '@/utils/tariff-reports/chapter-route-helpers';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
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
  return seo[key];
}

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
  const fallbackTitle = `${copy.pageTitle} — HTS Chapter ${padded} ${resolved.chapter.title} | KoalaGains`;
  const fallbackKeywords = [`HTS Chapter ${padded}`, resolved.chapter.title, copy.pageTitle, 'tariff report', 'trade policy', 'KoalaGains'];

  let sectionSeo: (PageSeoDetails & { seoTitle?: string; metaDescription?: string; seo_title?: string; meta_description?: string }) | undefined;
  try {
    const res = await fetch(`${getBaseUrlForServerSidePages()}/api/industry-tariff-reports/chapters/${chapterSlug}/seo`);
    if (res.ok) {
      const body: ChapterSeoResponse = await res.json();
      sectionSeo = pickSectionSeo(body.seoDetails, sectionSlug);
    }
  } catch {
    // Network/SSR errors fall back to the placeholder copy below.
  }

  const title = sectionSeo?.title || sectionSeo?.seoTitle || sectionSeo?.seo_title || fallbackTitle;
  const description = sectionSeo?.shortDescription || sectionSeo?.metaDescription || sectionSeo?.meta_description || copy.description;
  const keywords = sectionSeo?.keywords?.length ? sectionSeo.keywords : fallbackKeywords;
  const canonicalUrl = `https://koalagains.com${chapterSectionHref(resolved.chapter.slug, sectionSlug)}`;

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

interface ChapterSectionHeaderProps {
  chapter: ChapterRouteInfo;
  pageTitle: string;
}

function ChapterSectionHeader({ chapter, pageTitle }: ChapterSectionHeaderProps): JSX.Element {
  const padded = chapter.number.toString().padStart(2, '0');
  return (
    <div className="mb-8 pb-4 border-b border-gray-200">
      <div className="text-sm text-muted-foreground mb-1">
        HTS Chapter {padded} — {chapter.title}
      </div>
      <h1 className="text-3xl font-bold heading-color">{pageTitle}</h1>
    </div>
  );
}

// Returns the rendered section body when the matching JSON exists in Prisma; returns
// `null` when there's nothing to show (caller falls back to the placeholder).
function renderSectionBody(sectionSlug: string, report: IndustryTariffReport): JSX.Element | null {
  switch (sectionSlug) {
    case 'tariff-updates': {
      const tariffUpdates = report.tariffUpdates;
      if (!tariffUpdates?.countrySpecificTariffs?.length) return null;
      return (
        <div className="space-y-4">
          {tariffUpdates.countryNames?.length ? <CountryNavigation countries={tariffUpdates.countryNames} /> : null}
          {tariffUpdates.countrySpecificTariffs.map((countryTariff, index) => {
            const sectionId = `country-${countryTariff.countryName.toLowerCase().replace(/\s+/g, '-')}`;
            return <CountryTariffRenderer key={index} countryTariff={countryTariff} sectionId={sectionId} />;
          })}
        </div>
      );
    }
    case 'understand-industry': {
      if (!report.understandIndustry) return null;
      return <UnderstandIndustryRenderer understandIndustry={report.understandIndustry} />;
    }
    case 'industry-areas': {
      if (!report.industryAreasSections) return null;
      const html = parseMarkdown(getMarkdownContentForIndustryAreas(report.industryAreasSections));
      return (
        <div className="bg-gray-900 rounded-lg p-2 shadow-sm">
          <div className="markdown-body prose max-w-none px-2">
            <div className="markdown markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      );
    }
    case 'final-conclusion': {
      if (!report.finalConclusion) return null;
      return <FinalConclusionRenderer finalConclusion={report.finalConclusion} />;
    }
    default:
      return null;
  }
}

export async function renderChapterSection(chapterSlug: string, sectionSlug: string): Promise<JSX.Element> {
  const resolved = await resolveChapterRoute(chapterSlug);
  if (!resolved) notFound();
  const copy = getChapterSectionCopy(sectionSlug, resolved.chapter);
  if (!copy) notFound();
  if (resolved.oldUrl) {
    redirect(`/industry-tariff-report/${resolved.oldUrl}/${sectionSlug}`);
  }

  const report = await readIndustryTariffReportBySlug(chapterSlug);
  const body = renderSectionBody(sectionSlug, report);

  if (!body) {
    return <ChapterPlaceholder chapter={resolved.chapter} pageTitle={copy.pageTitle} currentSectionSlug={sectionSlug} description={copy.description} />;
  }

  return (
    <div className="mx-auto max-w-7xl py-2">
      <ChapterSectionHeader chapter={resolved.chapter} pageTitle={copy.pageTitle} />
      {body}
    </div>
  );
}
