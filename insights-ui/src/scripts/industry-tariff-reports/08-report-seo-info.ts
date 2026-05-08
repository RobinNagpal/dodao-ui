import {
  formatChapterLabel,
  getChapterPromptContext,
  readExecutiveSummary,
  readFinalConclusion,
  readIndustryAreaSection,
  readReportCover,
  readSeoDetails,
  readTariffUpdates,
  readUnderstandIndustry,
  writeSeoDetails,
  type ChapterPromptContext,
} from '@/scripts/industry-tariff-reports/tariff-report-repository';
import { PageSeoDetails, ReportType, TariffReportSeoDetails } from '@/scripts/industry-tariff-reports/tariff-types';
import { z } from 'zod';
import { getLlmResponse } from '../llm‑utils‑gemini';
import { GeminiModel, LLMProvider } from '@/types/llmConstants';

const PageSeoDetailsSchema = z.object({
  title: z.string().describe('SEO title for the page (50-60 characters)'),
  shortDescription: z.string().describe('Short meta description for the page (150-160 characters)'),
  keywords: z.array(z.string()).describe('Array of relevant keywords for the page (5-10 keywords)'),
});

async function generateSeoDetailsForSection(
  ctx: Pick<ChapterPromptContext, 'chapterNumber' | 'chapterTitle'>,
  sectionName: string,
  sectionContent: unknown
): Promise<PageSeoDetails> {
  const chapterLabel = formatChapterLabel(ctx);
  const padded = ctx.chapterNumber.toString().padStart(2, '0');
  const prompt = `
    Generate SEO metadata for the "${sectionName}" page of the tariff report covering ${chapterLabel}.
    This is a public web page; the goal is to maximise organic clicks from importers, exporters,
    investors, and policy researchers searching for tariff information on this chapter.

    Title rules (50-65 characters, hard cap at 65):
    - Include the chapter title ("${ctx.chapterTitle}") OR the chapter number ("HTS Chapter ${padded}").
    - Include at least one high-intent keyword for this section: tariff rates, import duty, customs duty,
      trade impact, tariff updates, country-specific tariffs, etc.
    - End with a brand suffix like " | KoalaGains" only if it still fits the character budget.
    - Avoid stop-word filler ("Comprehensive Analysis of…"). Be direct.

    Meta description rules (150-160 characters, hard cap at 160):
    - Plain language, written to drive a click. Include a concrete pull (a country name, a percentage,
      a date, or "2026 updates") if the underlying content provides one.
    - Reference ${ctx.chapterTitle} explicitly.
    - Active voice, no "Learn about…" / "Find out…" filler.

    Keyword rules (5-10 keywords):
    - Mix short-tail ("${ctx.chapterTitle} tariff", "HTS Chapter ${padded}") and long-tail
      ("${ctx.chapterTitle} import duty rates", "<country> tariff on ${ctx.chapterTitle}") phrases.
    - Pull at least 2-3 entities from the actual content (countries, sub-products, agreements).
    - Lower-case, no duplicates, no hashtags.

    Output must be a JSON object with EXACTLY these keys:
    - title
    - shortDescription
    - keywords

    # Content:
    ${JSON.stringify(sectionContent, null, 2)}
  `;

  return await getLlmResponse<PageSeoDetails>(prompt, PageSeoDetailsSchema, LLMProvider.GEMINI_WITH_GROUNDING, GeminiModel.GEMINI_3_PRO_PREVIEW);
}

export async function generateReportCoverSeo(slug: string): Promise<PageSeoDetails | undefined> {
  const ctx = await getChapterPromptContext(slug);
  const reportCover = await readReportCover(slug);
  if (!reportCover) return undefined;
  return generateSeoDetailsForSection(ctx, ReportType.REPORT_COVER, reportCover);
}

export async function generateExecutiveSummarySeo(slug: string): Promise<PageSeoDetails | undefined> {
  const ctx = await getChapterPromptContext(slug);
  const executiveSummary = await readExecutiveSummary(slug);
  if (!executiveSummary) return undefined;
  return generateSeoDetailsForSection(ctx, ReportType.EXECUTIVE_SUMMARY, executiveSummary);
}

export async function generateTariffUpdatesSeo(slug: string): Promise<PageSeoDetails | undefined> {
  const ctx = await getChapterPromptContext(slug);
  const tariffUpdates = await readTariffUpdates(slug);
  if (!tariffUpdates) return undefined;
  return generateSeoDetailsForSection(ctx, ReportType.TARIFF_UPDATES, tariffUpdates);
}

export async function generateUnderstandIndustrySeo(slug: string): Promise<PageSeoDetails | undefined> {
  const ctx = await getChapterPromptContext(slug);
  const understandIndustry = await readUnderstandIndustry(slug);
  if (!understandIndustry) return undefined;
  return generateSeoDetailsForSection(ctx, ReportType.UNDERSTAND_INDUSTRY, understandIndustry);
}

export async function generateIndustryAreasSeo(slug: string): Promise<PageSeoDetails | undefined> {
  const ctx = await getChapterPromptContext(slug);
  const industryAreas = await readIndustryAreaSection(slug);
  if (!industryAreas) return undefined;
  return generateSeoDetailsForSection(ctx, ReportType.INDUSTRY_AREA_SECTION, industryAreas);
}

export async function generateFinalConclusionSeo(slug: string): Promise<PageSeoDetails | undefined> {
  const ctx = await getChapterPromptContext(slug);
  const finalConclusion = await readFinalConclusion(slug);
  if (!finalConclusion) return undefined;
  return generateSeoDetailsForSection(ctx, ReportType.FINAL_CONCLUSION, finalConclusion);
}

export async function generateAndSaveAllSeoDetails(slug: string): Promise<TariffReportSeoDetails> {
  const seoDetails: TariffReportSeoDetails = (await readSeoDetails(slug)) ?? {};

  const reportCover = await readReportCover(slug);
  if (reportCover) {
    console.log(`Generating SEO details for ${ReportType.REPORT_COVER}...`);
    seoDetails.reportCoverSeoDetails = await generateReportCoverSeo(slug);
    await writeSeoDetails(slug, seoDetails);
  }

  const executiveSummary = await readExecutiveSummary(slug);
  if (executiveSummary) {
    console.log(`Generating SEO details for ${ReportType.EXECUTIVE_SUMMARY}...`);
    seoDetails.executiveSummarySeoDetails = await generateExecutiveSummarySeo(slug);
    await writeSeoDetails(slug, seoDetails);
  }

  const tariffUpdates = await readTariffUpdates(slug);
  if (tariffUpdates) {
    console.log(`Generating SEO details for ${ReportType.TARIFF_UPDATES}...`);
    seoDetails.tariffUpdatesSeoDetails = await generateTariffUpdatesSeo(slug);
    await writeSeoDetails(slug, seoDetails);
  }

  const understandIndustry = await readUnderstandIndustry(slug);
  if (understandIndustry) {
    console.log(`Generating SEO details for ${ReportType.UNDERSTAND_INDUSTRY}...`);
    seoDetails.understandIndustrySeoDetails = await generateUnderstandIndustrySeo(slug);
    await writeSeoDetails(slug, seoDetails);
  }

  const industryAreaSection = await readIndustryAreaSection(slug);
  if (industryAreaSection) {
    console.log(`Generating SEO details for ${ReportType.INDUSTRY_AREA_SECTION}...`);
    seoDetails.industryAreasSeoDetails = await generateIndustryAreasSeo(slug);
    await writeSeoDetails(slug, seoDetails);
  }

  const finalConclusion = await readFinalConclusion(slug);
  if (finalConclusion) {
    console.log(`Generating SEO details for ${ReportType.FINAL_CONCLUSION}...`);
    seoDetails.finalConclusionSeoDetails = await generateFinalConclusionSeo(slug);
    await writeSeoDetails(slug, seoDetails);
  }

  return seoDetails;
}
