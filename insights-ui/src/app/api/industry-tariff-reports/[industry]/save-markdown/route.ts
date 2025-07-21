import {
  readExecutiveSummaryFromFile,
  readFinalConclusionFromFile,
  readReportCoverFromFile,
  readTariffUpdatesFromFile,
  readUnderstandIndustryJsonFromFile,
  writeJsonAndMarkdownFilesForExecutiveSummary,
  writeJsonAndMarkdownFilesForReportCover,
  writeJsonFileForIndustryTariffs,
  writeJsonFileForUnderstandIndustry,
  writeMarkdownFileForIndustryTariffs,
  writeMarkdownFileForUnderstandIndustry,
} from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

interface SaveMarkdownRequest {
  section: string;
  content: string;
}

async function postHandler(
  req: NextRequest,
  { params }: { params: Promise<{ industry: string }> }
): Promise<{ success: boolean; message: string }> {
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
        .filter(section => section.trim())
        .map(section => {
          const lines = section.trim().split('\n');
          const title = lines[0].trim();
          const paragraphs = lines.slice(1)
            .join('\n')
            .split('\n\n')
            .filter(p => p.trim())
            .map(p => p.trim());
          
          return {
            title,
            paragraphs
          };
        });

      const updatedData = {
        ...existingData,
        sections
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
      const countryBlocks = content.split(/^---$/gm).filter(block => block.trim());
      
      const countrySpecificTariffs = countryBlocks.map(block => {
        const lines = block.trim().split('\n');
        const countryNameLine = lines.find(line => line.startsWith('# '));
        const countryName = countryNameLine ? countryNameLine.replace('# ', '').trim() : '';

        // Extract sections
        const extractSection = (startMarker: string, endMarker?: string) => {
          const startIndex = lines.findIndex(line => line.startsWith(startMarker));
          if (startIndex === -1) return '';
          
          const endIndex = endMarker 
            ? lines.findIndex((line, idx) => idx > startIndex && line.startsWith(endMarker))
            : lines.length;
          
          return lines
            .slice(startIndex + 1, endIndex === -1 ? lines.length : endIndex)
            .filter(line => line.trim())
            .join('\n')
            .trim();
        };

        // Extract industry sub-area changes
        const extractIndustrySubAreaChanges = (): string[] => {
          const sectionContent = extractSection('## Industry Sub-Area Changes', '## Trade Impacted');
          if (!sectionContent) return [];
          
          return sectionContent
            .split('\n\n')
            .map(item => item.trim())
            .filter(item => item.startsWith('- '))
            .map(item => item.substring(2).trim())
            .filter(item => item.length > 0);
        };

        // Determine the correct end markers based on whether Industry Sub-Area Changes section exists
        const hasIndustrySubArea = lines.some(line => line.startsWith('## Industry Sub-Area Changes'));
        const newChangesEndMarker = hasIndustrySubArea ? '## Industry Sub-Area Changes' : '## Trade Impacted';

        return {
          countryName,
          tariffDetails: extractSection('## Tariff Details', '## Existing Trade Amount'),
          existingTradeAmountAndAgreement: extractSection('## Existing Trade Amount and Agreement', '## New Changes'),
          newChanges: extractSection('## New Changes', newChangesEndMarker),
          tradeImpactedByNewTariff: extractSection('## Trade Impacted by New Tariff', '## Trade Exempted'),
          tradeExemptedByNewTariff: extractSection('## Trade Exempted by New Tariff'),
          tariffChangesForIndustrySubArea: extractIndustrySubAreaChanges()
        };
      });

      const updatedData = {
        ...existingData,
        countrySpecificTariffs
      };

      await writeJsonFileForIndustryTariffs(industry, updatedData);
      await writeMarkdownFileForIndustryTariffs(industry, updatedData);
      break;
    }

    case 'final-conclusion': {
      const existingData = await readFinalConclusionFromFile(industry);
      if (!existingData) {
        throw new Error('Final conclusion data not found');
      }

      // Parse markdown content back to structured data
      const lines = content.split('\n');
      const title = lines.find(line => line.startsWith('# '))?.replace('# ', '').trim() || existingData.title;
      
      const extractSection = (startMarker: string, endMarker?: string) => {
        const startIndex = lines.findIndex(line => line.startsWith(startMarker));
        if (startIndex === -1) return '';
        
        const endIndex = endMarker 
          ? lines.findIndex((line, idx) => idx > startIndex && (line.startsWith('## ') || line.startsWith('# ')))
          : lines.length;
        
        return lines
          .slice(startIndex + 1, endIndex === -1 ? lines.length : endIndex)
          .filter(line => line.trim() && !line.startsWith('#'))
          .join('\n')
          .trim();
      };

      // Extract conclusion brief (text before first ##)
      const firstHeaderIndex = lines.findIndex(line => line.startsWith('## '));
      const conclusionBrief = lines
        .slice(1, firstHeaderIndex === -1 ? lines.length : firstHeaderIndex)
        .filter(line => line.trim())
        .join('\n')
        .trim();

      // Extract positive impacts
      const positiveImpactsTitle = lines.find(line => line.includes('ositive'))?.replace('## ', '').trim() || existingData.positiveImpacts.title;
      const positiveImpacts = extractSection(`## ${positiveImpactsTitle}`);

      // Extract negative impacts  
      const negativeImpactsTitle = lines.find(line => line.includes('egative'))?.replace('## ', '').trim() || existingData.negativeImpacts.title;
      const negativeImpacts = extractSection(`## ${negativeImpactsTitle}`);

      // Extract final statements
      const finalStatements = extractSection('## Final Statements');

      const updatedData = {
        ...existingData,
        title,
        conclusionBrief,
        positiveImpacts: {
          title: positiveImpactsTitle,
          positiveImpacts
        },
        negativeImpacts: {
          title: negativeImpactsTitle,
          negativeImpacts
        },
        finalStatements
      };

      // For now, we'll update the JSON manually since there's no combined write function
      // This is a simplified approach - ideally we'd have writeJsonAndMarkdownFilesForFinalConclusion
      throw new Error('Final conclusion editing is complex and needs additional implementation');
    }

    default:
      throw new Error(`Unknown section: ${section}`);
  }

  return {
    success: true,
    message: `${section} content updated successfully`,
  };
}

export const POST = withErrorHandlingV2<{ success: boolean; message: string }>(postHandler); 