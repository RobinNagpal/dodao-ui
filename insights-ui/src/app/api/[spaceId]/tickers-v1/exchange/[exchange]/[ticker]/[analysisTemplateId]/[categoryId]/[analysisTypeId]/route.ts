import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { getLLMResponseForPromptViaInvocation, LLMResponseObject } from '@/util/get-llm-response';
import { LLMProvider, GeminiModel } from '@/types/llmConstants';

// Input interface for analysis
interface AnalysisInput {
  tickerName: string;
  tickerSymbol: string;
  exchange: string;
  analysisTypeName: string;
  analysisTypeDescription: string;
  categoryName: string;
}

// Output interface for analysis
interface AnalysisOutput {
  output: string;
  result: 'poor' | 'fair' | 'good' | 'excellent' | 'unknown' | 'not_applicable';
}

export interface GenerateAnalysisTypeResponse {
  success: boolean;
  analysisTypeId: string;
  output: string;
  result: string;
}

async function postHandler(
  req: NextRequest,
  context: { params: Promise<{ spaceId: string; exchange: string; ticker: string; analysisTemplateId: string; categoryId: string; analysisTypeId: string }> }
): Promise<GenerateAnalysisTypeResponse> {
  const { spaceId, exchange, ticker, analysisTemplateId, categoryId, analysisTypeId } = await context.params;

  if (!analysisTypeId) {
    throw new Error('Missing required field: analysisTypeId');
  }

  const tickerRecord = await prisma.tickerV1.findFirstOrThrow({
    where: {
      spaceId: spaceId || KoalaGainsSpaceId,
      symbol: ticker.toUpperCase(),
      exchange: exchange.toUpperCase(),
    },
  });

  // Get the analysis template with prompt info and category/analysis type details
  const analysisTemplate = await prisma.analysisTemplate.findFirstOrThrow({
    where: {
      id: analysisTemplateId,
    },
    include: {
      categories: {
        where: {
          id: categoryId,
        },
        include: {
          analysisTypes: {
            where: {
              id: analysisTypeId,
            },
          },
        },
      },
    },
  });

  const category = analysisTemplate.categories[0];
  if (!category) {
    throw new Error('Category not found');
  }

  const analysisType = category.analysisTypes[0];
  if (!analysisType) {
    throw new Error('Analysis type not found');
  }

  if (!analysisTemplate.promptKey) {
    throw new Error('Analysis template does not have a prompt key configured');
  }

  // Check if analysis already exists
  const existingAnalysis = await prisma.tickerV1DetailedReport.findFirst({
    where: {
      tickerId: tickerRecord.id,
      analysisTemplateId: analysisTemplateId,
      analysisTypeId: analysisTypeId,
    },
  });

  if (existingAnalysis) {
    return {
      success: true,
      analysisTypeId: analysisTypeId,
      output: existingAnalysis.output,
      result: existingAnalysis.result,
    };
  }

  try {
    // Prepare input JSON for the prompt
    const inputJson: AnalysisInput = {
      tickerName: tickerRecord.name,
      tickerSymbol: tickerRecord.symbol,
      exchange: tickerRecord.exchange,
      analysisTypeName: analysisType.name,
      analysisTypeDescription: analysisType.description,
      categoryName: category.name,
    };

    // Use grounding with Gemini 2.5 Pro
    const llmResponse: LLMResponseObject<AnalysisInput, AnalysisOutput> = await getLLMResponseForPromptViaInvocation({
      spaceId: spaceId || KoalaGainsSpaceId,
      inputJson,
      promptKey: analysisTemplate.promptKey,
      llmProvider: LLMProvider.GEMINI_WITH_GROUNDING,
      model: GeminiModel.GEMINI_2_5_PRO_GROUNDING,
      requestFrom: 'ui',
    });

    // Get source links from grounding response
    const sourceLinks = llmResponse.sourceLinks && llmResponse.sourceLinks.length > 0 ? llmResponse.sourceLinks : undefined;

    // Save result to database
    await prisma.tickerV1DetailedReport.create({
      data: {
        tickerId: tickerRecord.id,
        analysisTemplateId: analysisTemplateId,
        analysisTypeId: analysisTypeId,
        output: llmResponse.response.output,
        result: llmResponse.response.result,
        sourceLinks: sourceLinks,
      },
    });

    return {
      success: true,
      analysisTypeId: analysisTypeId,
      output: llmResponse.response.output,
      result: llmResponse.response.result,
    };
  } catch (error) {
    console.error(`Error generating analysis for type ${analysisType.name}:`, error);
    throw new Error(`Failed to generate analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const POST = withErrorHandlingV2<GenerateAnalysisTypeResponse>(postHandler);
