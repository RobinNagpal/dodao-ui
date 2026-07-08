import PrivateWrapper from '@/components/auth/PrivateWrapper';
import ChapterPlaceholder from '@/components/industry-tariff/chapter/ChapterPlaceholder';
import ChapterRelatedSections from '@/components/industry-tariff/chapter/ChapterRelatedSections';
import ChapterSectionActions, { type ChapterSectionAction } from '@/components/industry-tariff/chapter/ChapterSectionActions';
import { renderChapterToolsCrossLinks } from '@/components/industry-tariff/chapter/ChapterToolsCrossLinks';
import { CountryTariffRenderer } from '@/components/industry-tariff/renderers/CountryTariffRenderer';
import { FinalConclusionRenderer } from '@/components/industry-tariff/renderers/FinalConclusionRenderer';
import { TariffEngineeringRenderer } from '@/components/industry-tariff/renderers/TariffEngineeringRenderer';
import { UnderstandIndustryRenderer } from '@/components/industry-tariff/renderers/UnderstandIndustryRenderer';
import type { ChapterTariffReportResponse } from '@/app/api/industry-tariff-reports/chapters/[chapterSlug]/route';
import { getMarkdownContentForIndustryAreas } from '@/scripts/industry-tariff-reports/render-tariff-markdown';
import { ReportType, type IndustryTariffReport, type PageSeoDetails, type TariffReportSeoDetails } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseChapterBodyMarkdown } from '@/util/parse-markdown';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { CHAPTER_REPORT_SECTIONS, ChapterRouteInfo, chapterSectionHref, getChapterSectionCopy } from '@/utils/tariff-reports/chapter-route-helpers';
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
// stock-detail card on /stocks/<EX>/<TK>/<section> — single `bg-gray-900` card with related-section
// navigation + tools bar at the top, the section body in the middle, and a "Last updated …" footer
// at the bottom.
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
  // ISO date string for the report's `updated_at`. Drives the footer's "Last updated …" line and
  // the article's <meta itemProp="dateModified">. Optional because the upstream `fetch()` response
  // may be served from the Next.js data cache populated by a deploy that predates the field — in
  // that case we degrade gracefully and omit the date row rather than crashing on `new Date(undefined)`.
  updatedAt?: string;
  // ISO date string for `created_at`. Same caveat as `updatedAt`.
  createdAt?: string;
  // Human-readable label for the current section (e.g. "Tariff Updates", "Overview"). Rendered as
  // the right-hand badge in the footer, mirroring the per-category badge on the stock report card.
  sectionLabel: string;
}

function toValidDate(value: string | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function ChapterArticle({
  chapter,
  pageTitle,
  actions = [],
  toolsCrossLinks,
  children,
  currentSlug,
  updatedAt,
  createdAt,
  sectionLabel,
}: ChapterArticleProps): JSX.Element {
  const publishedDate = toValidDate(createdAt);
  const modifiedDate = toValidDate(updatedAt);
  const formattedModifiedDate = modifiedDate ? modifiedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null;

  return (
    <div className="py-4">
      <article className="bg-bg rounded-lg shadow-sm border border-color p-3 sm:p-6 md:p-8" itemScope itemType="https://schema.org/Article">
        {publishedDate && <meta itemProp="datePublished" content={publishedDate.toISOString()} />}
        {toolsCrossLinks}
        <ChapterRelatedSections chapter={chapter} currentSlug={currentSlug} />
        <ChapterArticleHeader chapter={chapter} pageTitle={pageTitle} actions={actions} />
        {children}
        <footer className="mt-8 pt-6 border-t border-color">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {modifiedDate && formattedModifiedDate ? (
              <div className="text-sm text-muted-foreground">
                <span>Last updated by </span>
                <span itemProp="author" itemScope itemType="https://schema.org/Organization">
                  <span itemProp="name">KoalaGains</span>
                </span>
                <span> on </span>
                <time dateTime={modifiedDate.toISOString()} itemProp="dateModified">
                  {formattedModifiedDate}
                </time>
              </div>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">Tariff Report</span>
              <span className="inline-flex items-center rounded-full bg-teal-100 dark:bg-teal-900 px-2.5 py-0.5 text-xs font-medium text-teal-800 dark:text-teal-300">
                {sectionLabel}
              </span>
            </div>
          </div>
        </footer>
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
      const html = parseChapterBodyMarkdown(getMarkdownContentForIndustryAreas(report.industryAreasSections));
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

// Prefer the LLM-generated section title as the page H1 — it tends to be richer (and more SEO-friendly)
// than the static fallback ("Tariff Engineering", "Final Conclusion", …). Falls back to `copy.pageTitle`
// for sections that don't carry their own title (tariff-updates, industry-areas) or when generation hasn't
// run yet. Renderers no longer emit a duplicate H2 of this same title; the page H1 is the only H1 on the page.
function getEffectivePageTitle(sectionSlug: string, report: IndustryTariffReport, fallback: string): string {
  const candidate = ((): string | undefined => {
    switch (sectionSlug) {
      case 'understand-industry':
        return typeof report.understandIndustry?.title === 'string' ? report.understandIndustry.title : undefined;
      case 'tariff-engineering':
        return typeof report.tariffEngineering?.title === 'string' ? report.tariffEngineering.title : undefined;
      case 'final-conclusion':
        return typeof report.finalConclusion?.title === 'string' ? report.finalConclusion.title : undefined;
      default:
        return undefined;
    }
  })();
  const trimmed = candidate?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

export async function renderChapterSection(chapterSlug: string, sectionSlug: string): Promise<JSX.Element> {
  const data = await fetchChapterTariffReport(chapterSlug);
  if (!data) notFound();
  const { chapter, report, createdAt, updatedAt } = data;
  const copy = getChapterSectionCopy(sectionSlug, chapter);
  if (!copy) notFound();

  const body = renderSectionBody(sectionSlug, report);
  const actions = getSectionActions(sectionSlug);
  const toolsCrossLinks = await renderChapterToolsCrossLinks(chapter);
  const pageTitle = getEffectivePageTitle(sectionSlug, report, copy.pageTitle);
  const sectionLabel = CHAPTER_REPORT_SECTIONS.find((s) => s.slug === sectionSlug)?.label ?? copy.pageTitle;

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
    <ChapterArticle
      chapter={chapter}
      pageTitle={pageTitle}
      actions={actions}
      toolsCrossLinks={toolsCrossLinks}
      currentSlug={sectionSlug}
      createdAt={createdAt}
      updatedAt={updatedAt}
      sectionLabel={sectionLabel}
    >
      {body}
    </ChapterArticle>
  );
}
