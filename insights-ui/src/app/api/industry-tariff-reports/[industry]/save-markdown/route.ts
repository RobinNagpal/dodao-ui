import {
  readExecutiveSummaryFromFile,
  readFinalConclusionFromFile,
  readIndustryAreaSectionFromFile,
  readReportCoverFromFile,
  readTariffUpdatesFromFile,
  readUnderstandIndustryJsonFromFile,
  readIndustryHeadingsFromFile,
  readEvaluateSubIndustryAreaJsonFromFile,
  readAllCountriesTariffUpdatesFromFile,
  writeJsonAndMarkdownFilesForExecutiveSummary,
  writeJsonAndMarkdownFilesForFinalConclusion,
  writeJsonAndMarkdownFilesForReportCover,
  writeJsonFileForIndustryAreaSections,
  writeJsonFileForIndustryTariffs,
  writeJsonFileForUnderstandIndustry,
  writeMarkdownFileForIndustryAreaSections,
  writeMarkdownFileForIndustryTariffs,
  writeMarkdownFileForUnderstandIndustry,
  writeJsonFileForEvaluateSubIndustryArea,
  writeMarkdownFileForEvaluateSubIndustryArea,
  writeJsonFileForAllCountriesTariffUpdates,
  writeMarkdownFileForAllCountriesTariffUpdates,
} from '@/scripts/industry-tariff-reports/tariff-report-read-write';
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

  if (!industry) {
    throw new Error('Industry is required');
  }

  if (!section || !content) {
    throw new Error('Section and content are required');
  }

  switch (section) {
    case 'executive-summary': {
      const existingData = await readExecutiveSummaryFromFile(industry);
      if (!existingData) {
        throw new Error('Executive summary data not found');
      }

      const updatedData = {
        ...existingData,
        executiveSummary: content,
      };

      await writeJsonAndMarkdownFilesForExecutiveSummary(industry, updatedData);
      break;
    }

    case 'report-cover': {
      const existingData = await readReportCoverFromFile(industry);
      if (!existingData) {
        throw new Error('Report cover data not found');
      }

      const updatedData = {
        ...existingData,
        reportCoverContent: content,
      };

      await writeJsonAndMarkdownFilesForReportCover(industry, updatedData);
      break;
    }

    case 'understand-industry': {
      const existingData = await readUnderstandIndustryJsonFromFile(industry);
      if (!existingData) {
        throw new Error('Understand industry data not found');
      }

      // Parse markdown content back to sections
      const sections = content
        .split(/^## /gm)
        .filter((section) => section.trim())
        .map((section) => {
          const lines = section.trim().split('\n');
          const title = lines[0].trim();
          const paragraphs = lines
            .slice(1)
            .join('\n')
            .split('\n\n')
            .filter((p) => p.trim())
            .map((p) => p.trim());

          return {
            title,
            paragraphs,
          };
        });

      const updatedData = {
        ...existingData,
        sections,
      };

      await writeJsonFileForUnderstandIndustry(industry, updatedData);
      await writeMarkdownFileForUnderstandIndustry(industry, updatedData);
      break;
    }

    case 'tariff-updates': {
      const existingData = await readTariffUpdatesFromFile(industry);
      if (!existingData) {
        throw new Error('Tariff updates data not found');
      }

      // Parse markdown content back to country-specific tariffs
      const countryBlocks = content.split(/^---$/gm).filter((block) => block.trim());

      const countrySpecificTariffs = countryBlocks.map((block) => {
        const lines = block.trim().split('\n');
        const countryNameLine = lines.find((line) => line.startsWith('# '));
        const countryName = countryNameLine ? countryNameLine.replace('# ', '').trim() : '';

        // Extract sections
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

        // Extract industry sub-area changes
        const extractIndustrySubAreaChanges = (): string[] => {
          const sectionContent = extractSection('## Industry Sub-Area Changes', '## Trade Impacted');
          if (!sectionContent) return [];

          // Split by double newlines and preserve spacing (don't filter empty items)
          return sectionContent.split('\n\n').map((item) => item.trim());
        };

        // Determine the correct end markers based on whether Industry Sub-Area Changes section exists
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

      const updatedData = {
        ...existingData,
        countrySpecificTariffs,
      };

      await writeJsonFileForIndustryTariffs(industry, updatedData);
      await writeMarkdownFileForIndustryTariffs(industry, updatedData);
      break;
    }

    case 'industry-areas': {
      const existingData = await readIndustryAreaSectionFromFile(industry);
      if (!existingData) {
        throw new Error('Industry areas data not found');
      }

      // Parse markdown content back to structured data
      const lines = content.split('\n');
      const title =
        lines
          .find((line) => line.startsWith('# '))
          ?.replace('# ', '')
          .trim() || existingData.title;

      // Extract content (everything after the title, preserving paragraph structure)
      const titleIndex = lines.findIndex((line) => line.startsWith('# '));
      const contentLines = lines.slice(titleIndex + 1);

      // Remove leading empty lines but preserve internal paragraph spacing
      let startIndex = 0;
      while (startIndex < contentLines.length && !contentLines[startIndex].trim()) {
        startIndex++;
      }

      const industryAreas = contentLines.slice(startIndex).join('\n').trimEnd(); // Only trim trailing whitespace, not leading/internal

      const updatedData = {
        title,
        industryAreas,
      };

      await writeJsonFileForIndustryAreaSections(industry, updatedData);
      await writeMarkdownFileForIndustryAreaSections(industry, updatedData);
      break;
    }

    case 'final-conclusion': {
      const existingData = await readFinalConclusionFromFile(industry);
      if (!existingData) {
        throw new Error('Final conclusion data not found');
      }

      // Parse markdown content back to structured data
      const lines = content.split('\n');

      const extractSection = (startMarker: string) => {
        const startIndex = lines.findIndex((line) => line.startsWith(startMarker));
        if (startIndex === -1) return '';

        // Find the next section header (##) after this one
        const endIndex = lines.findIndex((line, idx) => idx > startIndex && line.startsWith('## '));

        return lines
          .slice(startIndex + 1, endIndex === -1 ? lines.length : endIndex)
          .filter((line) => line.trim() && !line.startsWith('#'))
          .join('\n')
          .trim();
      };

      // Find all section headers
      const sectionHeaders = lines
        .map((line, index) => ({ line, index }))
        .filter(({ line }) => line.startsWith('## '))
        .map(({ line, index }) => ({
          title: line.replace('## ', '').trim(),
          fullLine: line,
          index,
        }));

      // Extract conclusion section title and brief (first ## section after main title)
      const conclusionSection = sectionHeaders.find(
        (section) => section.title.toLowerCase().includes('conclusion') || section.index === lines.findIndex((line) => line.startsWith('## '))
      );
      const title = conclusionSection ? conclusionSection.title : existingData.title;
      const conclusionBrief = conclusionSection ? extractSection(conclusionSection.fullLine) : '';

      // Extract positive impacts
      const positiveSection = sectionHeaders.find((section) => section.title.toLowerCase().includes('positive'));
      const positiveImpactsTitle = positiveSection ? positiveSection.title : existingData.positiveImpacts.title;
      const positiveImpacts = positiveSection ? extractSection(positiveSection.fullLine) : '';

      // Extract negative impacts
      const negativeSection = sectionHeaders.find((section) => section.title.toLowerCase().includes('negative'));
      const negativeImpactsTitle = negativeSection ? negativeSection.title : existingData.negativeImpacts.title;
      const negativeImpacts = negativeSection ? extractSection(negativeSection.fullLine) : '';

      // Extract final statements
      const finalStatementsSection = sectionHeaders.find((section) => section.title.toLowerCase().includes('final statement'));
      const finalStatements = finalStatementsSection ? extractSection(finalStatementsSection.fullLine) : '';

      const updatedData = {
        ...existingData,
        title,
        conclusionBrief,
        positiveImpacts: {
          title: positiveImpactsTitle,
          positiveImpacts,
        },
        negativeImpacts: {
          title: negativeImpactsTitle,
          negativeImpacts,
        },
        finalStatements,
      };

      await writeJsonAndMarkdownFilesForFinalConclusion(industry, updatedData);
      break;
    }

    case 'all-countries-tariff-updates': {
      const existingData = await readAllCountriesTariffUpdatesFromFile(industry);
      if (!existingData) {
        throw new Error('All countries tariff updates data not found');
      }

      const updatedData = {
        ...existingData,
        tariffUpdates: content,
      };

      await writeJsonFileForAllCountriesTariffUpdates(industry, updatedData);
      await writeMarkdownFileForAllCountriesTariffUpdates(industry, updatedData);
      break;
    }

    case 'evaluate-industry-areas': {
      const { headingAndSubheadingIndex, sectionType } = body as any;

      if (!headingAndSubheadingIndex || !sectionType) {
        throw new Error('headingAndSubheadingIndex and sectionType are required for evaluate-industry-areas');
      }

      const [headingString, subHeadingString] = headingAndSubheadingIndex.split('-');
      const headingIndex = Number.parseInt(headingString, 10);
      const subHeadingIndex = Number.parseInt(subHeadingString, 10);

      // Get the current data
      const existingHeadings = await readIndustryHeadingsFromFile(industry);
      if (!existingHeadings) {
        throw new Error('Industry headings not found');
      }

      const area = existingHeadings.areas[headingIndex]?.subAreas[subHeadingIndex];
      if (!area) {
        throw new Error('Industry area not found');
      }

      const existingData = await readEvaluateSubIndustryAreaJsonFromFile(industry, area, existingHeadings);
      if (!existingData) {
        throw new Error('Evaluate industry area data not found');
      }

      // Parse markdown back to JSON based on section type
      let updatedData = { ...existingData };

      switch (sectionType) {
        case 'about':
          updatedData.aboutParagraphs = content;
          break;
        case 'headwinds-and-tailwinds':
          updatedData.headwindsAndTailwinds = parseHeadwindsAndTailwindsFromMarkdown(content);
          break;
        case 'tariff-impact-by-company-type':
          const { positive, negative } = parseTariffImpactByCompanyTypeFromMarkdown(content);
          updatedData.positiveTariffImpactOnCompanyType = positive;
          updatedData.negativeTariffImpactOnCompanyType = negative;
          break;
        case 'tariff-impact-summary':
          updatedData.tariffImpactSummary = content;
          break;
        default:
          throw new Error(`Unknown sectionType: ${sectionType}`);
      }

      await writeJsonFileForEvaluateSubIndustryArea(industry, area, existingHeadings, updatedData);
      await writeMarkdownFileForEvaluateSubIndustryArea(industry, area, existingHeadings, updatedData);
      break;
    }

    default:
      throw new Error(`Unknown section: ${section}`);
  }

  return {
    success: true,
    message: `${section} content updated successfully`,
  };
}

function parseHeadwindsAndTailwindsFromMarkdown(markdown: string): any {
  const sections = markdown.split(/### (Headwinds|Tailwinds)/);
  const headwinds: string[] = [];
  const tailwinds: string[] = [];

  for (let i = 1; i < sections.length; i += 2) {
    const sectionType = sections[i];
    const sectionContent = sections[i + 1];

    if (sectionContent) {
      // Split by double newlines to get paragraphs, then filter out empty ones
      const paragraphs = sectionContent
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      if (sectionType === 'Headwinds') {
        headwinds.push(...paragraphs);
      } else if (sectionType === 'Tailwinds') {
        tailwinds.push(...paragraphs);
      }
    }
  }

  return { headwinds, tailwinds };
}

function parseTariffImpactByCompanyTypeFromMarkdown(markdown: string): { positive: any[]; negative: any[] } {
  // Split by the main section headers
  const sections = markdown.split(/### (Positive Impact|Negative Impact)/);
  const positive: any[] = [];
  const negative: any[] = [];

  for (let i = 1; i < sections.length; i += 2) {
    const sectionType = sections[i].trim();
    const sectionContent = sections[i + 1];

    if (!sectionContent) continue;

    // Split by company headers (####)
    const companyBlocks = sectionContent.split(/#### /);

    for (let j = 1; j < companyBlocks.length; j++) {
      const block = companyBlocks[j].trim();
      if (!block) continue;

      const lines = block.split('\n');
      const companyType = lines[0].trim();

      let impact = '';
      let reasoning = '';
      let currentField = '';

      for (let k = 1; k < lines.length; k++) {
        const line = lines[k].trim();

        if (line.startsWith('- Impact:')) {
          impact = line.replace('- Impact:', '').trim();
          currentField = 'impact';
        } else if (line.startsWith('- Reasoning:')) {
          reasoning = line.replace('- Reasoning:', '').trim();
          currentField = 'reasoning';
        } else if (line && currentField) {
          // Continue multi-line content
          if (currentField === 'impact') {
            impact += ' ' + line;
          } else if (currentField === 'reasoning') {
            reasoning += ' ' + line;
          }
        } else if (!line) {
          // Empty line resets field
          currentField = '';
        }
      }

      if (companyType && (impact || reasoning)) {
        const impactObj = {
          companyType,
          impact: impact.trim(),
          reasoning: reasoning.trim(),
        };

        if (sectionType === 'Positive Impact') {
          positive.push(impactObj);
        } else if (sectionType === 'Negative Impact') {
          negative.push(impactObj);
        }
      }
    }
  }

  return { positive, negative };
}

export const POST = withErrorHandlingV2<{ success: boolean; message: string }>(postHandler);
