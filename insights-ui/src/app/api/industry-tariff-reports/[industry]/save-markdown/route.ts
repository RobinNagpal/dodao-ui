import {
  findReportSlugByOldUrl,
  readExecutiveSummary,
  readFinalConclusion,
  readIndustryAreaSection,
  readReportCover,
  readTariffUpdates,
  readUnderstandIndustry,
  writeExecutiveSummary,
  writeFinalConclusion,
  writeIndustryAreaSection,
  writeReportCover,
  writeTariffUpdates,
  writeUnderstandIndustry,
} from '@/scripts/industry-tariff-reports/tariff-report-repository';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

interface SaveMarkdownRequest {
  section: string;
  content: string;
}

async function postHandler(req: NextRequest, { params }: { params: Promise<{ industry: string }> }): Promise<{ success: boolean; message: string }> {
  const { industry } = await params;
  const body: SaveMarkdownRequest = await req.json();
  const { section, content } = body;

  if (!industry) throw new Error('Industry is required');
  if (!section || !content) throw new Error('Section and content are required');

  const slug = await findReportSlugByOldUrl(industry);

  switch (section) {
    case 'executive-summary': {
      const existingData = await readExecutiveSummary(slug);
      if (!existingData) throw new Error('Executive summary data not found');
      await writeExecutiveSummary(slug, { ...existingData, executiveSummary: content });
      break;
    }

    case 'report-cover': {
      const existingData = await readReportCover(slug);
      if (!existingData) throw new Error('Report cover data not found');
      await writeReportCover(slug, { ...existingData, reportCoverContent: content });
      break;
    }

    case 'understand-industry': {
      const existingData = await readUnderstandIndustry(slug);
      if (!existingData) throw new Error('Understand industry data not found');

      const sections = content
        .split(/^## /gm)
        .filter((sec) => sec.trim())
        .map((sec) => {
          const lines = sec.trim().split('\n');
          const title = lines[0].trim();
          const paragraphs = lines
            .slice(1)
            .join('\n')
            .split('\n\n')
            .filter((p) => p.trim())
            .map((p) => p.trim());
          return { title, paragraphs };
        });

      await writeUnderstandIndustry(slug, { ...existingData, sections });
      break;
    }

    case 'tariff-updates': {
      const existingData = await readTariffUpdates(slug);
      if (!existingData) throw new Error('Tariff updates data not found');

      const countryBlocks = content.split(/^---$/gm).filter((block) => block.trim());

      const countrySpecificTariffs = countryBlocks.map((block) => {
        const lines = block.trim().split('\n');
        const countryNameLine = lines.find((line) => line.startsWith('# '));
        const countryName = countryNameLine ? countryNameLine.replace('# ', '').trim() : '';

        const extractSection = (startMarker: string, endMarker?: string) => {
          const startIndex = lines.findIndex((line) => line.startsWith(startMarker));
          if (startIndex === -1) return '';
          const endIndex = endMarker ? lines.findIndex((line, idx) => idx > startIndex && line.startsWith(endMarker)) : lines.length;
          return lines
            .slice(startIndex + 1, endIndex === -1 ? lines.length : endIndex)
            .filter((line) => line.trim())
            .join('\n')
            .trim();
        };

        const extractIndustrySubAreaChanges = (): string[] => {
          const sectionContent = extractSection('## Industry Sub-Area Changes', '## Trade Impacted');
          if (!sectionContent) return [];
          return sectionContent.split('\n\n').map((item) => item.trim());
        };

        const hasIndustrySubArea = lines.some((line) => line.startsWith('## Industry Sub-Area Changes'));
        const newChangesEndMarker = hasIndustrySubArea ? '## Industry Sub-Area Changes' : '## Trade Impacted';

        return {
          countryName,
          tariffDetails: extractSection('## Tariff Details', '## Existing Trade Amount'),
          existingTradeAmountAndAgreement: extractSection('## Existing Trade Amount and Agreement', '## New Changes'),
          newChanges: extractSection('## New Changes', newChangesEndMarker),
          tradeImpactedByNewTariff: extractSection('## Trade Impacted by New Tariff', '## Trade Exempted'),
          tradeExemptedByNewTariff: extractSection('## Trade Exempted by New Tariff'),
          tariffChangesForIndustrySubArea: extractIndustrySubAreaChanges(),
        };
      });

      await writeTariffUpdates(slug, { ...existingData, countrySpecificTariffs });
      break;
    }

    case 'industry-areas': {
      const existingData = await readIndustryAreaSection(slug);
      if (!existingData) throw new Error('Industry areas data not found');

      const lines = content.split('\n');
      const title =
        lines
          .find((line) => line.startsWith('# '))
          ?.replace('# ', '')
          .trim() || existingData.title;

      const titleIndex = lines.findIndex((line) => line.startsWith('# '));
      const contentLines = lines.slice(titleIndex + 1);

      let startIndex = 0;
      while (startIndex < contentLines.length && !contentLines[startIndex].trim()) {
        startIndex++;
      }

      const industryAreas = contentLines.slice(startIndex).join('\n').trimEnd();

      await writeIndustryAreaSection(slug, { title, industryAreas });
      break;
    }

    case 'final-conclusion': {
      const existingData = await readFinalConclusion(slug);
      if (!existingData) throw new Error('Final conclusion data not found');

      const lines = content.split('\n');

      const extractSection = (startMarker: string) => {
        const startIndex = lines.findIndex((line) => line.startsWith(startMarker));
        if (startIndex === -1) return '';
        const endIndex = lines.findIndex((line, idx) => idx > startIndex && line.startsWith('## '));
        return lines
          .slice(startIndex + 1, endIndex === -1 ? lines.length : endIndex)
          .filter((line) => line.trim() && !line.startsWith('#'))
          .join('\n')
          .trim();
      };

      const sectionHeaders = lines
        .map((line, index) => ({ line, index }))
        .filter(({ line }) => line.startsWith('## '))
        .map(({ line, index }) => ({
          title: line.replace('## ', '').trim(),
          fullLine: line,
          index,
        }));

      const conclusionSection = sectionHeaders.find(
        (sec) => sec.title.toLowerCase().includes('conclusion') || sec.index === lines.findIndex((line) => line.startsWith('## '))
      );
      const title = conclusionSection ? conclusionSection.title : existingData.title;
      const conclusionBrief = conclusionSection ? extractSection(conclusionSection.fullLine) : '';

      const positiveSection = sectionHeaders.find((sec) => sec.title.toLowerCase().includes('positive'));
      const positiveImpactsTitle = positiveSection ? positiveSection.title : existingData.positiveImpacts.title;
      const positiveImpacts = positiveSection ? extractSection(positiveSection.fullLine) : '';

      const negativeSection = sectionHeaders.find((sec) => sec.title.toLowerCase().includes('negative'));
      const negativeImpactsTitle = negativeSection ? negativeSection.title : existingData.negativeImpacts.title;
      const negativeImpacts = negativeSection ? extractSection(negativeSection.fullLine) : '';

      const finalStatementsSection = sectionHeaders.find((sec) => sec.title.toLowerCase().includes('final statement'));
      const finalStatements = finalStatementsSection ? extractSection(finalStatementsSection.fullLine) : '';

      await writeFinalConclusion(slug, {
        ...existingData,
        title,
        conclusionBrief,
        positiveImpacts: { title: positiveImpactsTitle, positiveImpacts },
        negativeImpacts: { title: negativeImpactsTitle, negativeImpacts },
        finalStatements,
      });
      break;
    }

    default:
      throw new Error(`Unknown section: ${section}`);
  }

  return { success: true, message: `${section} content updated successfully` };
}

export const POST = withErrorHandlingV2<{ success: boolean; message: string }>(postHandler);
