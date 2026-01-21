import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { getLLMResponseForPromptViaInvocation, LLMResponseObject } from '@/util/get-llm-response';
import { LLMProvider, getDefaultGeminiModel } from '@/types/llmConstants';

// Input interface for analysis
interface AnalysisInput {
  tickerName?: string;
  tickerSymbol?: string;
  exchange?: string;
  companyName?: string;
  analysisTypeName: string;
  analysisTypeDescription: string;
  categoryName: string;
}

// Output interface for analysis
interface AnalysisOutput {
  output: string;
  result: 'poor' | 'fair' | 'good' | 'excellent' | 'unknown' | 'not_applicable';
}

export interface GenerateAnalysisResponse {
  success: boolean;
  parameterId: string;
  output: string;
  result: string;
}

async function postHandler(
  req: NextRequest,
  context: { params: Promise<{ analysisTemplateReportId: string; categoryId: string; analysisParameterId: string }> }
): Promise<GenerateAnalysisResponse> {
  const { analysisTemplateReportId, categoryId, analysisParameterId } = await context.params;

  if (!analysisParameterId) {
    throw new Error('Missing required field: analysisParameterId');
  }

  // Get the analysis template report with all related data
  const analysisTemplateReport = await prisma.analysisTemplateReport.findFirstOrThrow({
    where: {
      id: analysisTemplateReportId,
    },
    include: {
      analysisTemplate: {
        include: {
          categories: {
            where: {
              id: categoryId,
            },
            include: {
              analysisParameters: {
                where: {
                  id: analysisParameterId,
                },
              },
            },
          },
        },
      },
    },
  });

  const category = analysisTemplateReport.analysisTemplate.categories[0];
  if (!category) {
    throw new Error('Category not found');
  }

  const analysisParameter = category.analysisParameters[0];
  if (!analysisParameter) {
    throw new Error('Analysis parameter not found');
  }

  try {
    // Determine if this is ticker or company analysis based on prompt key
    const isTickerAnalysis = analysisTemplateReport.promptKey === 'US/ticker-analysis-template';
    const isCompanyAnalysis = analysisTemplateReport.promptKey === 'US/company-analysis-template';

    if (!isTickerAnalysis && !isCompanyAnalysis) {
      throw new Error(`Unsupported prompt key: ${analysisTemplateReport.promptKey}`);
    }

    // Prepare input JSON based on analysis type
    let inputJson: AnalysisInput;
    let promptKey: string;

    const inputObj = analysisTemplateReport.inputObj as any; // Cast to any since Prisma Json type is generic

    if (isTickerAnalysis) {
      inputJson = {
        tickerName: inputObj.tickerName,
        tickerSymbol: inputObj.tickerSymbol,
        exchange: inputObj.exchange,
        analysisTypeName: analysisParameter.name,
        analysisTypeDescription: analysisParameter.description,
        categoryName: category.name,
      };
      promptKey = 'US/ticker-analysis-template';
    } else {
      inputJson = {
        companyName: inputObj.companyName,
        analysisTypeName: analysisParameter.name,
        analysisTypeDescription: analysisParameter.description,
        categoryName: category.name,
      };
      promptKey = 'US/company-analysis-template';
    }

    // Use grounding with Gemini 2.5 Pro
    const llmResponse: LLMResponseObject<AnalysisInput, AnalysisOutput> = await getLLMResponseForPromptViaInvocation({
      spaceId: KoalaGainsSpaceId,
      inputJson,
      promptKey,
      llmProvider: LLMProvider.GEMINI_WITH_GROUNDING,
      model: getDefaultGeminiModel(),
      requestFrom: 'ui',
    });

    // Get source links from grounding response
    const sourceLinks = llmResponse.sourceLinks && llmResponse.sourceLinks.length > 0 ? llmResponse.sourceLinks : undefined;

    // Save result to database (create or update existing)
    await prisma.analysisTemplateParameterReport.upsert({
      where: {
        analysisTemplateReportId_analysisTemplateParameterId: {
          analysisTemplateReportId: analysisTemplateReportId,
          analysisTemplateParameterId: analysisParameterId,
        },
      },
      update: {
        output: llmResponse.response.output,
        result: llmResponse.response.result,
        sourceLinks: sourceLinks,
      },
      create: {
        analysisTemplateReportId: analysisTemplateReportId,
        analysisTemplateParameterId: analysisParameterId,
        output: llmResponse.response.output,
        result: llmResponse.response.result,
        sourceLinks: sourceLinks,
      },
    });

    return {
      success: true,
      parameterId: analysisParameterId,
      output: llmResponse.response.output,
      result: llmResponse.response.result,
    };
  } catch (error) {
    console.error(`Error generating analysis for parameter ${analysisParameter.name}:`, error);
    throw new Error(`Failed to generate analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const POST = withErrorHandlingV2<GenerateAnalysisResponse>(postHandler);
