import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { getLLMResponse } from '@/util/get-llm-response';
import { LLMProvider, GeminiModel, getDefaultGeminiModel } from '@/types/llmConstants';
import { AnalysisResult } from '@/utils/score-utils';

// Type for text analysis response
interface TextAnalysisResponse {
  analysis: string;
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

  // Get the analysis type
  const analysisType = await prisma.analysisType.findFirstOrThrow({
    where: {
      id: analysisTypeId,
    },
  });

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
    // Prepare the context for the analysis (simplified without unnecessary fields)
    const tickerContext = `
Provide stock specific information relevant to this Analysis Type, then decide the result (poor/fair/good/excellent). Use unknown if you can’t determine from available info; use not_applicable if it doesn’t apply to this business.

Stock Information:
- Company Name: ${tickerRecord.name}
- Symbol: ${tickerRecord.symbol}
- Exchange: ${tickerRecord.exchange}

You need to give very specific information for this stock on this analysis type.
Analysis Type: ${analysisType.name}
Description: ${analysisType.description}
`;

    // Build the full prompt, only add promptInstructions if it exists
    let fullPrompt = tickerContext;
    if (analysisType.promptInstructions) {
      fullPrompt += `\nPlease provide the analysis based on the following instructions:\n\n${analysisType.promptInstructions}`;
    }

    // Generate analysis using structured output
    const analysisResponse = await generateTextAnalysis(fullPrompt);

    // Save result to database
    await prisma.tickerV1DetailedReport.create({
      data: {
        tickerId: tickerRecord.id,
        analysisTemplateId: analysisTemplateId,
        analysisTypeId: analysisTypeId,
        output: analysisResponse.analysis,
        result: analysisResponse.result,
      },
    });

    return {
      success: true,
      analysisTypeId: analysisTypeId,
      output: analysisResponse.analysis,
      result: analysisResponse.result,
    };
  } catch (error) {
    console.error(`Error generating analysis for type ${analysisType.name}:`, error);
    throw new Error(`Failed to generate analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/** ---------- Helper Functions ---------- */

async function generateTextAnalysis(prompt: string): Promise<TextAnalysisResponse> {
  try {
    // Fallback to regular Gemini with structured output
    const invocationId = `ticker-text-analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Schema for analysis with result
    const textSchema = {
      type: 'object',
      properties: {
        analysis: {
          type: 'string',
          description: 'The detailed analysis text in markdown format',
        },
        result: {
          type: 'string',
          description: 'Overall assessment result',
          enum: ['poor', 'fair', 'good', 'excellent', 'unknown', 'not_applicable'],
        },
      },
      required: ['analysis', 'result'],
    };

    const response = await getLLMResponse<TextAnalysisResponse>({
      invocationId,
      llmProvider: LLMProvider.GEMINI,
      modelName: getDefaultGeminiModel(),
      prompt,
      outputSchema: textSchema,
      maxRetries: 2,
      skipInvocationTracking: true,
    });

    return {
      analysis: response.analysis || 'Analysis completed but no content returned.',
      result: response.result || 'fair',
    };
  } catch (error) {
    console.error('Error generating analysis:', error);
    throw new Error(`Failed to generate text analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const POST = withErrorHandlingV2<GenerateAnalysisTypeResponse>(postHandler);
