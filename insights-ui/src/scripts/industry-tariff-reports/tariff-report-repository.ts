import { prisma } from '@/prisma';
import type { Prisma } from '@prisma/client';
import { findIndustryByLegacyUrl } from '@/scripts/industry-tariff-reports/tariff-industries';
import type {
  ExecutiveSummary,
  FinalConclusion,
  IndustryAreaSection,
  IndustryAreasWrapper,
  IndustryTariffReport,
  ReportCover,
  TariffEngineering,
  TariffReportSeoDetails,
  TariffUpdatesForIndustry,
  UnderstandIndustry,
} from '@/scripts/industry-tariff-reports/tariff-types';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';

import { revalidateTariffReport, revalidateTariffReportsListing } from '@/utils/tariff-report-cache-utils';

/**
 * Prisma JSON columns accept "JSON-ish" values, but Prisma's generated TS types
 * often require an index signature for objects. We store plain serializable
 * objects, so we cast to the specific Prisma field input type (not `any`).
 */
function toJsonField<K extends keyof Prisma.TariffChapterReportUpdateInput>(value: unknown): Prisma.TariffChapterReportUpdateInput[K] {
  return value as Prisma.TariffChapterReportUpdateInput[K];
}

// Defaults for chapters that don't have a legacy `TariffIndustryDefinition`.
// Used by the headings-generation prompt — must match the typical shape of
// the legacy-seeded reports (4 main areas × 3 subareas).
const DEFAULT_HEADINGS_COUNT = 4;
const DEFAULT_SUB_HEADINGS_COUNT = 3;

export interface TariffReportContext {
  slug: string;
  oldUrl: string | null;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChapterPromptContext {
  slug: string;
  oldUrl: string | null;
  chapterNumber: number;
  chapterTitle: string;
  headingsCount: number;
  subHeadingsCount: number;
}

// Human-readable chapter label used across every section's prompt — e.g.
// `HTS Chapter 03 — Fish and crustaceans, molluscs and other aquatic invertebrates`.
// Keeps the chapter number visible in LLM input so it can ground answers in the
// correct HTS scope, even when the title is generic.
export function formatChapterLabel(ctx: Pick<ChapterPromptContext, 'chapterNumber' | 'chapterTitle'>): string {
  const padded = ctx.chapterNumber.toString().padStart(2, '0');
  return `HTS Chapter ${padded} — ${ctx.chapterTitle}`;
}

// Shared SEO/engagement guidance injected into every section's content prompt.
// We want the report to rank for high-intent tariff queries (rates, duties,
// per-country impact) so the analysis is written *with* those search phrases
// in headings and lead sentences instead of generic prose.
export function chapterSeoGuidance(ctx: Pick<ChapterPromptContext, 'chapterNumber' | 'chapterTitle'>): string {
  const padded = ctx.chapterNumber.toString().padStart(2, '0');
  const title = ctx.chapterTitle;
  return `
# SEO and Reader-Engagement Rules
- Write for readers actively searching for tariff information on "${title}" or "HTS Chapter ${padded}".
- Naturally weave high-intent phrases into H2/H3 sub-headers and the first sentence of paragraphs, e.g.
  "${title} tariff rates", "${title} import duty", "HTS Chapter ${padded} tariff updates",
  "tariffs on ${title} imports", "<country> tariffs on ${title}".
- Prefer keyword-rich sub-headings over generic ones ("Latest Tariff Rates on ${title}" beats "Latest Updates").
- Front-load concrete specifics in every paragraph: percentage rates, dollar amounts, exact dates, HTS sub-headings.
  Wrap numerical values in backticks.
- Include at least one short, direct snippet-friendly answer per section (a 2–3 sentence "What is…?" / "How does…?" opener).
- Avoid filler ("In conclusion", "It is important to note"). Be concrete, scannable, and specific.
`;
}

// The chapter is the canonical subject of the report, regardless of whether the
// caller arrived via the legacy `/industry-tariff-report/<industryId>` URL or a
// chapter-keyed route. Prompts must reference the chapter title (and number) so
// the same input always yields the same content. The legacy industry definition
// is only consulted for headings/sub-headings counts (which match the seeded
// reports' shape); the chapter title overrides any legacy `name`.
export async function getChapterPromptContext(slug: string): Promise<ChapterPromptContext> {
  const ctx = await getReportContextBySlug(slug);
  const legacy = ctx.oldUrl ? findIndustryByLegacyUrl(ctx.oldUrl) : undefined;
  return {
    slug: ctx.slug,
    oldUrl: ctx.oldUrl,
    chapterNumber: ctx.chapterNumber,
    chapterTitle: ctx.chapterTitle,
    headingsCount: legacy?.headingsCount ?? DEFAULT_HEADINGS_COUNT,
    subHeadingsCount: legacy?.subHeadingsCount ?? DEFAULT_SUB_HEADINGS_COUNT,
  };
}

async function findRowBySlug(slug: string) {
  return prisma.tariffChapterReport.findUnique({
    where: { spaceId_slug: { spaceId: KoalaGainsSpaceId, slug } },
    include: { chapter: { select: { id: true, number: true, title: true } } },
  });
}

export async function getReportContextBySlug(slug: string): Promise<TariffReportContext> {
  const row = await findRowBySlug(slug);
  if (!row) {
    throw new Error(`No tariff chapter report found for slug "${slug}"`);
  }
  return {
    slug: row.slug,
    oldUrl: row.oldUrl,
    chapterId: row.chapter.id,
    chapterNumber: row.chapter.number,
    chapterTitle: row.chapter.title,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function findReportSlugByOldUrl(oldUrl: string): Promise<string> {
  const row = await prisma.tariffChapterReport.findUnique({
    where: { spaceId_oldUrl: { spaceId: KoalaGainsSpaceId, oldUrl } },
    select: { slug: true },
  });
  if (!row) {
    throw new Error(`No tariff chapter report found for legacy industry "${oldUrl}"`);
  }
  return row.slug;
}

const REPORT_SECTIONS_SELECT = {
  industryAreas: true,
  introduction: true,
  executiveSummary: true,
  tariffUpdates: true,
  understandIndustry: true,
  industryAreasSections: true,
  conclusion: true,
  tariffEngineering: true,
  seoDetails: true,
} as const satisfies Prisma.TariffChapterReportSelect;

type ReportSectionsRow = Prisma.TariffChapterReportGetPayload<{ select: typeof REPORT_SECTIONS_SELECT }>;

function rowToIndustryTariffReport(row: ReportSectionsRow): IndustryTariffReport {
  return {
    industryAreas: (row.industryAreas as IndustryAreasWrapper | null) ?? undefined,
    reportCover: (row.introduction as ReportCover | null) ?? undefined,
    executiveSummary: (row.executiveSummary as ExecutiveSummary | null) ?? undefined,
    tariffUpdates: (row.tariffUpdates as TariffUpdatesForIndustry | null) ?? undefined,
    understandIndustry: (row.understandIndustry as UnderstandIndustry | null) ?? undefined,
    industryAreasSections: (row.industryAreasSections as IndustryAreaSection | null) ?? undefined,
    finalConclusion: (row.conclusion as FinalConclusion | null) ?? undefined,
    tariffEngineering: (row.tariffEngineering as TariffEngineering | null) ?? undefined,
    reportSeoDetails: (row.seoDetails as TariffReportSeoDetails | null) ?? undefined,
  };
}

export async function readIndustryTariffReportByOldUrl(oldUrl: string): Promise<IndustryTariffReport> {
  const row = await prisma.tariffChapterReport.findUnique({
    where: { spaceId_oldUrl: { spaceId: KoalaGainsSpaceId, oldUrl } },
    select: REPORT_SECTIONS_SELECT,
  });
  if (!row) return {};
  return rowToIndustryTariffReport(row);
}

export async function readIndustryTariffReportBySlug(slug: string): Promise<IndustryTariffReport> {
  const row = await prisma.tariffChapterReport.findUnique({
    where: { spaceId_slug: { spaceId: KoalaGainsSpaceId, slug } },
    select: REPORT_SECTIONS_SELECT,
  });
  if (!row) return {};
  return rowToIndustryTariffReport(row);
}

async function readSection<T>(slug: string, column: keyof Prisma.TariffChapterReportSelect): Promise<T | undefined> {
  const row = await prisma.tariffChapterReport.findUnique({
    where: { spaceId_slug: { spaceId: KoalaGainsSpaceId, slug } },
    select: { [column]: true } as Prisma.TariffChapterReportSelect,
  });
  if (!row) return undefined;
  const value = (row as Record<string, unknown>)[column as string];
  return (value as T | null | undefined) ?? undefined;
}

async function writeSection(slug: string, data: Prisma.TariffChapterReportUpdateInput): Promise<void> {
  const row = await prisma.tariffChapterReport.update({
    where: { spaceId_slug: { spaceId: KoalaGainsSpaceId, slug } },
    data,
    select: { oldUrl: true },
  });
  // Chapter routes (`/industry-tariff-report/chapters/<slug>`) cache their
  // fetches under a slug-keyed tag; legacy industry routes (when oldUrl is
  // set) cache under the oldUrl. Bust both so neither URL serves stale data.
  revalidateTariffReport(slug);
  if (row.oldUrl && row.oldUrl !== slug) {
    revalidateTariffReport(row.oldUrl);
  }
  // The /tariff-reports listing is cached via unstable_cache and shows the
  // updatedAt for every chapter; bust it on every write so the homepage card
  // reflects the new generation time without waiting for the weekly TTL.
  revalidateTariffReportsListing();
}

// Stored in the `industry_areas` JSONB column — this is the headings/sub-headings
// tree (`IndustryAreasWrapper`) that's generated first and consumed by every
// other section's prompt builder. The "headings" alias keeps usages readable
// alongside `readIndustryAreaSection` (the prose section under
// `05-industry-areas.ts`, which lives in `industry_areas_sections`).
export async function readIndustryHeadings(slug: string): Promise<IndustryAreasWrapper | undefined> {
  return readSection<IndustryAreasWrapper>(slug, 'industryAreas');
}

export async function writeIndustryHeadings(slug: string, value: IndustryAreasWrapper): Promise<void> {
  await writeSection(slug, { industryAreas: toJsonField<'industryAreas'>(value) });
}

export async function readReportCover(slug: string): Promise<ReportCover | undefined> {
  return readSection<ReportCover>(slug, 'introduction');
}

export async function writeReportCover(slug: string, value: ReportCover): Promise<void> {
  await writeSection(slug, { introduction: toJsonField<'introduction'>(value) });
}

export async function readExecutiveSummary(slug: string): Promise<ExecutiveSummary | undefined> {
  return readSection<ExecutiveSummary>(slug, 'executiveSummary');
}

function normalizeMarkdownNewlines(value: unknown): unknown {
  if (typeof value === 'string') {
    // Some regenerated content lands double-escaped (literal "\n" in the string),
    // which causes markdown parsers to treat the whole section as one line.
    return value.replace(/\\n/g, '\n');
  }
  if (Array.isArray(value)) return value.map(normalizeMarkdownNewlines);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, normalizeMarkdownNewlines(v)]));
  }
  return value;
}

export async function writeExecutiveSummary(slug: string, value: ExecutiveSummary): Promise<void> {
  await writeSection(slug, {
    executiveSummary: toJsonField<'executiveSummary'>(normalizeMarkdownNewlines(value)),
  });
}

export async function readTariffUpdates(slug: string): Promise<TariffUpdatesForIndustry | undefined> {
  return readSection<TariffUpdatesForIndustry>(slug, 'tariffUpdates');
}

export async function writeTariffUpdates(slug: string, value: TariffUpdatesForIndustry): Promise<void> {
  await writeSection(slug, { tariffUpdates: toJsonField<'tariffUpdates'>(value) });
}

export async function readUnderstandIndustry(slug: string): Promise<UnderstandIndustry | undefined> {
  return readSection<UnderstandIndustry>(slug, 'understandIndustry');
}

export async function writeUnderstandIndustry(slug: string, value: UnderstandIndustry): Promise<void> {
  await writeSection(slug, {
    understandIndustry: toJsonField<'understandIndustry'>(normalizeMarkdownNewlines(value)),
  });
}

export async function readIndustryAreaSection(slug: string): Promise<IndustryAreaSection | undefined> {
  return readSection<IndustryAreaSection>(slug, 'industryAreasSections');
}

export async function writeIndustryAreaSection(slug: string, value: IndustryAreaSection): Promise<void> {
  await writeSection(slug, {
    industryAreasSections: toJsonField<'industryAreasSections'>(normalizeMarkdownNewlines(value)),
  });
}

export async function readFinalConclusion(slug: string): Promise<FinalConclusion | undefined> {
  return readSection<FinalConclusion>(slug, 'conclusion');
}

export async function writeFinalConclusion(slug: string, value: FinalConclusion): Promise<void> {
  await writeSection(slug, { conclusion: toJsonField<'conclusion'>(normalizeMarkdownNewlines(value)) });
}

export async function readTariffEngineering(slug: string): Promise<TariffEngineering | undefined> {
  return readSection<TariffEngineering>(slug, 'tariffEngineering');
}

export async function writeTariffEngineering(slug: string, value: TariffEngineering): Promise<void> {
  await writeSection(slug, {
    tariffEngineering: toJsonField<'tariffEngineering'>(normalizeMarkdownNewlines(value)),
  });
}

export async function readSeoDetails(slug: string): Promise<TariffReportSeoDetails | undefined> {
  return readSection<TariffReportSeoDetails>(slug, 'seoDetails');
}

function normalizePageSeoDetails(input: any): any {
  if (!input || typeof input !== 'object') return input;
  const title =
    typeof input.title === 'string'
      ? input.title
      : typeof input.seoTitle === 'string'
      ? input.seoTitle
      : typeof input.seo_title === 'string'
      ? input.seo_title
      : undefined;
  const shortDescription =
    typeof input.shortDescription === 'string'
      ? input.shortDescription
      : typeof input.metaDescription === 'string'
      ? input.metaDescription
      : typeof input.meta_description === 'string'
      ? input.meta_description
      : undefined;
  const keywords = Array.isArray(input.keywords) ? input.keywords : undefined;

  // Keep extra fields (for backwards-compat / debugging), but ensure canonical keys exist.
  return {
    ...input,
    ...(title ? { title } : {}),
    ...(shortDescription ? { shortDescription } : {}),
    ...(keywords ? { keywords } : {}),
  };
}

export async function writeSeoDetails(slug: string, value: TariffReportSeoDetails): Promise<void> {
  const v: any = value ?? {};
  const normalized: TariffReportSeoDetails = {
    ...v,
    reportCoverSeoDetails: normalizePageSeoDetails(v.reportCoverSeoDetails),
    executiveSummarySeoDetails: normalizePageSeoDetails(v.executiveSummarySeoDetails),
    tariffUpdatesSeoDetails: normalizePageSeoDetails(v.tariffUpdatesSeoDetails),
    understandIndustrySeoDetails: normalizePageSeoDetails(v.understandIndustrySeoDetails),
    industryAreasSeoDetails: normalizePageSeoDetails(v.industryAreasSeoDetails),
    finalConclusionSeoDetails: normalizePageSeoDetails(v.finalConclusionSeoDetails),
    tariffEngineeringSeoDetails: normalizePageSeoDetails(v.tariffEngineeringSeoDetails),
  };

  await writeSection(slug, { seoDetails: toJsonField<'seoDetails'>(normalized) });
}
