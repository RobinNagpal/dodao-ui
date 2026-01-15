import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { getLLMResponse } from '@/util/get-llm-response';
import { getGroundedResponse } from '@/util/llm-grounding-utils';
import { LLMProvider, GeminiModel } from '@/types/llmConstants';

export interface GenerateAnalysisTypeResponse {
  success: boolean;
  analysisTypeId: string;
  output: string;
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
    };
  }

  try {
    // Prepare the context for the analysis (simplified without unnecessary fields)
    const tickerContext = `
Stock Information:
- Company Name: ${tickerRecord.name}
- Symbol: ${tickerRecord.symbol}
- Exchange: ${tickerRecord.exchange}

You need to give very specific information for this stock on this analysis type.
Analysis Type: ${analysisType.name}
Summary: ${analysisType.oneLineSummary}
Description: ${analysisType.description}
`;

    // Build the full prompt, only add promptInstructions if it exists
    let fullPrompt = tickerContext;
    if (analysisType.promptInstructions) {
      fullPrompt += `\nPlease provide the analysis based on the following instructions:\n\n${analysisType.promptInstructions}`;
    }

    let analysisOutput: string;

    if (analysisType.outputSchema) {
      // Use structured output if schema is provided
      try {
        const schema = JSON.parse(analysisType.outputSchema);

        // Generate a unique invocation ID for tracking
        const invocationId = `ticker-analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Use Gemini with grounding for better analysis
        const response = await getLLMResponse({
          invocationId,
          llmProvider: LLMProvider.GEMINI_WITH_GROUNDING,
          modelName: GeminiModel.GEMINI_3_PRO_PREVIEW,
          prompt: fullPrompt,
          outputSchema: schema,
          maxRetries: 2,
          isTestInvocation: true,
        });

        analysisOutput = JSON.stringify(response);
      } catch (schemaError) {
        console.error('Error with structured output, falling back to text output:', schemaError);
        analysisOutput = await generateTextAnalysis(fullPrompt);
      }
    } else {
      // Use simple text output
      analysisOutput = await generateTextAnalysis(fullPrompt);
    }

    // Save result to database
    await prisma.tickerV1DetailedReport.create({
      data: {
        tickerId: tickerRecord.id,
        analysisTemplateId: analysisTemplateId,
        analysisTypeId: analysisTypeId,
        output: analysisOutput,
      },
    });

    return {
      success: true,
      analysisTypeId: analysisTypeId,
      output: analysisOutput,
    };
  } catch (error) {
    console.error(`Error generating analysis for type ${analysisType.name}:`, error);
    throw new Error(`Failed to generate analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/** ---------- Helper Functions ---------- */

async function generateTextAnalysis(prompt: string): Promise<string> {
  try {
    // Use Gemini with grounding for comprehensive analysis
    const response = await getGroundedResponse(prompt, GeminiModel.GEMINI_2_5_PRO_GROUNDING);
    return response;
  } catch (error) {
    console.error('Error with grounded response, falling back to simple text:', error);

    try {
      // Fallback to regular Gemini without grounding
      const invocationId = `ticker-text-analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Simple text schema for unstructured output
      const textSchema = {
        type: 'object',
        properties: {
          analysis: {
            type: 'string',
            description: 'The detailed analysis text',
          },
        },
        required: ['analysis'],
      };

      const response = await getLLMResponse({
        invocationId,
        llmProvider: LLMProvider.GEMINI,
        modelName: GeminiModel.GEMINI_3_PRO_PREVIEW,
        prompt,
        outputSchema: textSchema,
        maxRetries: 2,
        isTestInvocation: true,
      });

      return (response as any).analysis || 'Analysis completed but no content returned.';
    } catch (fallbackError) {
      throw new Error(`Failed to generate text analysis: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`);
    }
  }
}

export const POST = withErrorHandlingV2<GenerateAnalysisTypeResponse>(postHandler);
