import PrivateWrapper from '@/components/auth/PrivateWrapper';
import ChapterPlaceholder from '@/components/industry-tariff/chapter/ChapterPlaceholder';
import ChapterRelatedSections from '@/components/industry-tariff/chapter/ChapterRelatedSections';
import ChapterSectionActions, { type ChapterSectionAction } from '@/components/industry-tariff/chapter/ChapterSectionActions';
import { renderChapterToolsCrossLinks } from '@/components/industry-tariff/chapter/ChapterToolsCrossLinks';
import { CountryNavigation } from '@/components/industry-tariff/renderers/CountryNavigation';
import { CountryTariffRenderer } from '@/components/industry-tariff/renderers/CountryTariffRenderer';
import { FinalConclusionRenderer } from '@/components/industry-tariff/renderers/FinalConclusionRenderer';
import { TariffEngineeringRenderer } from '@/components/industry-tariff/renderers/TariffEngineeringRenderer';
import { UnderstandIndustryRenderer } from '@/components/industry-tariff/renderers/UnderstandIndustryRenderer';
import type { ChapterTariffReportResponse } from '@/app/api/industry-tariff-reports/chapters/[chapterSlug]/route';
import { getMarkdownContentForIndustryAreas } from '@/scripts/industry-tariff-reports/render-tariff-markdown';
import { ReportType, type IndustryTariffReport, type PageSeoDetails, type TariffReportSeoDetails } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseMarkdown } from '@/util/parse-markdown';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { ChapterRouteInfo, chapterSectionHref, getChapterSectionCopy } from '@/utils/tariff-reports/chapter-route-helpers';
import { tariffReportTag } from '@/utils/tariff-report-tags';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

// Small wrappers used by every chapter section page (`tariff-updates`, `understand-industry`, ...).
// Keeps the per-route page.tsx files to a few lines each — same fetch/redirect/render flow, only
// the section slug differs.

const SECTION_SEO_KEY: Record<string, keyof TariffReportSeoDetails> = {
  'tariff-updates': 'tariffUpdatesSeoDetails',
  'understand-industry': 'understandIndustrySeoDetails',
  'industry-areas': 'industryAreasSeoDetails',
  'final-conclusion': 'finalConclusionSeoDetails',
  'tariff-engineering': 'tariffEngineeringSeoDetails',
};

type SeoDetailsWithAliases = PageSeoDetails & { seoTitle?: string; metaDescription?: string; seo_title?: string; meta_description?: string };

function pickSectionSeo(seo: TariffReportSeoDetails | null | undefined, sectionSlug: string): SeoDetailsWithAliases | undefined {
  const key = SECTION_SEO_KEY[sectionSlug];
  if (!key || !seo) return undefined;
  return seo[key] as SeoDetailsWithAliases | undefined;
}

async function fetchChapterTariffReport(chapterSlug: string): Promise<ChapterTariffReportResponse | null> {
  const response = await fetch(`${getBaseUrlForServerSidePages()}/api/industry-tariff-reports/chapters/${chapterSlug}`, {
    next: { tags: [tariffReportTag(chapterSlug)] },
  });
  return response.ok ? response.json() : null;
}

export async function buildChapterSectionMetadata(chapterSlug: string, sectionSlug: string): Promise<Metadata> {
  const data = await fetchChapterTariffReport(chapterSlug);
  if (!data) {
    return { title: 'HTS Chapter Tariff Report' };
  }
  const { chapter, report } = data;
  const copy = getChapterSectionCopy(sectionSlug, chapter);
  if (!copy) {
    return { title: 'HTS Chapter Tariff Report' };
  }
  const padded = chapter.number.toString().padStart(2, '0');
  const fallbackTitle = `${copy.pageTitle} — HTS Chapter ${padded} ${chapter.title} | KoalaGains`;
  const fallbackKeywords = [`HTS Chapter ${padded}`, chapter.title, copy.pageTitle, 'tariff report', 'trade policy', 'KoalaGains'];
  const sectionSeo = pickSectionSeo(report.reportSeoDetails, sectionSlug);

  const title = sectionSeo?.title || sectionSeo?.seoTitle || sectionSeo?.seo_title || fallbackTitle;
  const description = sectionSeo?.shortDescription || sectionSeo?.metaDescription || sectionSeo?.meta_description || copy.description;
  const keywords = sectionSeo?.keywords?.length ? sectionSeo.keywords : fallbackKeywords;
  const canonicalUrl = `https://koalagains.com${chapterSectionHref(chapter.slug, sectionSlug)}`;

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

interface ChapterArticleHeaderProps {
  chapter: ChapterRouteInfo;
  pageTitle: string;
  actions: ChapterSectionAction[];
}

function ChapterArticleHeader({ chapter, pageTitle, actions }: ChapterArticleHeaderProps): JSX.Element {
  return (
    <header className="mb-6 pb-4 border-b border-color">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight heading-color">{pageTitle}</h1>
        </div>
        {actions.length > 0 && (
          <PrivateWrapper>
            <ChapterSectionActions chapterSlug={chapter.slug} actions={actions} />
          </PrivateWrapper>
        )}
      </div>
    </header>
  );
}

// Outer article wrapper shared by the chapter cover and every chapter section page. Mirrors the
// stock-detail card on /stocks/<EX>/<TK>/<section> — single `bg-gray-900` card with header at
// the top, the section body in the middle, and related-section navigation + footer at the bottom.
interface ChapterArticleProps {
  chapter: ChapterRouteInfo;
  pageTitle: string;
  actions?: ChapterSectionAction[];
  // Pre-rendered tools bar from renderChapterToolsCrossLinks().
  toolsCrossLinks: ReactNode;
  // The section's main content (cover overview, tariff-updates, etc.).
  children: ReactNode;
  // Slug used by ChapterRelatedSections to omit the current page from the related grid.
  // Pass 'overview' on the chapter cover.
  currentSlug: string;
}

export function ChapterArticle({ chapter, pageTitle, actions = [], toolsCrossLinks, children, currentSlug }: ChapterArticleProps): JSX.Element {
  return (
    <div className="py-4">
      <article className="bg-gray-900 rounded-lg shadow-sm border border-color p-3 sm:p-6 md:p-8">
        {toolsCrossLinks}
        <ChapterArticleHeader chapter={chapter} pageTitle={pageTitle} actions={actions} />
        {children}
        <ChapterRelatedSections chapter={chapter} currentSlug={currentSlug} />
      </article>
    </div>
  );
}

// Per-section regenerate actions surfaced to admins on the chapter section
// pages. Mirrors the affordances on the legacy `/industry-tariff-report/<id>/`
// pages so admins can recover from a partially-failed generation without
// going back to the admin table.
function getSectionActions(sectionSlug: string): ChapterSectionAction[] {
  switch (sectionSlug) {
    case 'tariff-updates':
      return [
        {
          // Use the init + per-country fan-out instead of the bundled
          // generate route — the bundled chain would routinely time out on
          // Vercel and leave the chapter with no `tariffUpdates` row.
          kind: 'tariff-updates-fanout',
          key: 'regenerate-tariff-updates',
          label: 'Regenerate Tariff Updates',
          modalTitle: 'Regenerate Tariff Updates',
          confirmationText: 'Refetch the top trading partners and regenerate tariff data for each. This may take several minutes.',
          successMessage: 'Tariff updates regenerated.',
        },
      ];
    case 'understand-industry':
      return [
        {
          kind: 'simple',
          key: 'regenerate-understand-industry',
          label: 'Regenerate Understand Industry',
          apiPath: 'generate-understand-industry',
          modalTitle: 'Regenerate Understand Industry',
          confirmationText: 'Regenerate the Understand Industry section? This replaces the current content.',
          successMessage: 'Understand Industry regenerated.',
        },
      ];
    case 'industry-areas':
      return [
        {
          kind: 'simple',
          key: 'regenerate-industry-areas',
          label: 'Regenerate Industry Areas',
          apiPath: 'generate-industry-areas',
          modalTitle: 'Regenerate Industry Areas',
          confirmationText: 'Regenerate the Industry Areas section? This replaces the current content.',
          successMessage: 'Industry Areas regenerated.',
        },
      ];
    case 'final-conclusion':
      return [
        {
          kind: 'simple',
          key: 'regenerate-final-conclusion',
          label: 'Regenerate Final Conclusion',
          apiPath: 'generate-final-conclusion',
          modalTitle: 'Regenerate Final Conclusion',
          confirmationText: 'Regenerate the Final Conclusion? This replaces the current content.',
          successMessage: 'Final Conclusion regenerated.',
        },
      ];
    case 'tariff-engineering':
      return [
        {
          kind: 'simple',
          key: 'regenerate-tariff-engineering',
          label: 'Regenerate Tariff Engineering',
          apiPath: 'generate-tariff-engineering',
          modalTitle: 'Regenerate Tariff Engineering',
          confirmationText: 'Regenerate the Tariff Engineering analysis? This replaces the current content.',
          successMessage: 'Tariff Engineering regenerated.',
        },
        {
          kind: 'simple',
          key: 'generate-tariff-engineering-seo',
          label: 'Generate SEO for Tariff Engineering',
          apiPath: 'generate-seo-info',
          body: { section: ReportType.TARIFF_ENGINEERING },
          modalTitle: 'Generate SEO for Tariff Engineering',
          confirmationText: 'Generate SEO metadata for the Tariff Engineering section?',
          successMessage: 'Tariff Engineering SEO generated.',
        },
      ];
    default:
      return [];
  }
}

// Returns the rendered section body when the matching report JSON exists; returns
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
            return <CountryTariffRenderer key={index} countryTariff={countryTariff} sectionId={sectionId} flat />;
          })}
        </div>
      );
    }
    case 'understand-industry': {
      if (!report.understandIndustry) return null;
      return <UnderstandIndustryRenderer understandIndustry={report.understandIndustry} flat />;
    }
    case 'industry-areas': {
      if (!report.industryAreasSections) return null;
      const html = parseMarkdown(getMarkdownContentForIndustryAreas(report.industryAreasSections));
      return (
        <div className="markdown-body prose max-w-none">
          <div className="markdown markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      );
    }
    case 'final-conclusion': {
      if (!report.finalConclusion) return null;
      return <FinalConclusionRenderer finalConclusion={report.finalConclusion} flat />;
    }
    case 'tariff-engineering': {
      if (!report.tariffEngineering) return null;
      return <TariffEngineeringRenderer tariffEngineering={report.tariffEngineering} flat />;
    }
    default:
      return null;
  }
}

export async function renderChapterSection(chapterSlug: string, sectionSlug: string): Promise<JSX.Element> {
  const data = await fetchChapterTariffReport(chapterSlug);
  if (!data) notFound();
  const { chapter, report } = data;
  const copy = getChapterSectionCopy(sectionSlug, chapter);
  if (!copy) notFound();

  const body = renderSectionBody(sectionSlug, report);
  const actions = getSectionActions(sectionSlug);
  const toolsCrossLinks = await renderChapterToolsCrossLinks(chapter);

  if (!body) {
    return (
      <ChapterPlaceholder
        chapter={chapter}
        pageTitle={copy.pageTitle}
        currentSectionSlug={sectionSlug}
        description={copy.description}
        actions={actions}
        toolsCrossLinks={toolsCrossLinks}
      />
    );
  }

  return (
    <ChapterArticle chapter={chapter} pageTitle={copy.pageTitle} actions={actions} toolsCrossLinks={toolsCrossLinks} currentSlug={sectionSlug}>
      {body}
    </ChapterArticle>
  );
}
