import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { getLLMResponse } from '@/util/get-llm-response';
import { getGroundedResponse } from '@/util/llm-grounding-utils';
import { LLMProvider, GeminiModel } from '@/types/llmConstants';
import { NextRequest } from 'next/server';

/** ---------- Types ---------- */

interface GenerateAnalysisRequest {
  tickerId: string;
  analysisTemplateId: string;
  categoryId: string;
}

interface GeneratedAnalysis {
  id: string;
  tickerId: string;
  analysisTemplateId: string;
  categoryId: string;
  ticker: {
    name: string;
    symbol: string;
    exchange: string;
  };
  analysisTemplate: {
    name: string;
  };
  category: {
    name: string;
  };
  createdAt: string;
}

interface TickerAnalysisResult {
  analysisTypeId: string;
  analysisTypeName: string;
  output: string;
}

/** ---------- GET ---------- */

async function getHandler(): Promise<GeneratedAnalysis[]> {
  // Get unique combinations of ticker + analysis template + category that have been generated
  const generatedAnalyses = await prisma.tickerV1DetailedReport.findMany({
    select: {
      tickerId: true,
      analysisTemplateId: true,
      createdAt: true,
      ticker: {
        select: {
          name: true,
          symbol: true,
          exchange: true,
        },
      },
      analysisTemplate: {
        select: {
          name: true,
        },
      },
      analysisType: {
        select: {
          categoryId: true,
          category: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Group by unique combinations and get the most recent entry for each
  const uniqueAnalyses = new Map<string, any>();

  generatedAnalyses.forEach((analysis) => {
    const key = `${analysis.tickerId}-${analysis.analysisTemplateId}-${analysis.analysisType.categoryId}`;
    if (!uniqueAnalyses.has(key)) {
      uniqueAnalyses.set(key, {
        id: key,
        tickerId: analysis.tickerId,
        analysisTemplateId: analysis.analysisTemplateId,
        categoryId: analysis.analysisType.categoryId,
        ticker: analysis.ticker,
        analysisTemplate: analysis.analysisTemplate,
        category: analysis.analysisType.category,
        createdAt: analysis.createdAt.toISOString(),
      });
    }
  });

  return Array.from(uniqueAnalyses.values());
}

/** ---------- POST ---------- */

async function postHandler(req: NextRequest): Promise<GeneratedAnalysis> {
  const body: GenerateAnalysisRequest = await req.json();
  const { tickerId, analysisTemplateId, categoryId } = body;

  // Validate inputs
  if (!tickerId || !analysisTemplateId || !categoryId) {
    throw new Error('Missing required fields: tickerId, analysisTemplateId, or categoryId');
  }

  // Get ticker details
  const ticker = await prisma.tickerV1.findFirstOrThrow({
    where: { id: tickerId },
    select: {
      id: true,
      name: true,
      symbol: true,
      exchange: true,
      summary: true,
      websiteUrl: true,
      industryKey: true,
      subIndustryKey: true,
    },
  });

  // Get analysis template and category with analysis types
  const category = await prisma.detailedReportCategory.findFirstOrThrow({
    where: {
      id: categoryId,
      analysisTemplateId: analysisTemplateId,
    },
    include: {
      analysisTemplate: true,
      analysisTypes: true,
    },
  });

  // Generate analysis for each analysis type in the category
  const results: TickerAnalysisResult[] = [];

  for (const analysisType of category.analysisTypes) {
    try {
      // Prepare the context for the analysis
      const tickerContext = `
Stock Information:
- Company Name: ${ticker.name}
- Symbol: ${ticker.symbol}
- Exchange: ${ticker.exchange}
- Industry: ${ticker.industryKey}
- Sub-Industry: ${ticker.subIndustryKey}
- Website: ${ticker.websiteUrl || 'N/A'}
- Summary: ${ticker.summary || 'N/A'}

Analysis Type: ${analysisType.name}
Summary: ${analysisType.oneLineSummary}
Description: ${analysisType.description}

Please provide the analysis based on the following instructions:
`;

      const fullPrompt = `${tickerContext}\n\n${analysisType.promptInstructions}`;

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

      results.push({
        analysisTypeId: analysisType.id,
        analysisTypeName: analysisType.name,
        output: analysisOutput,
      });
    } catch (error) {
      console.error(`Error generating analysis for type ${analysisType.name}:`, error);
      results.push({
        analysisTypeId: analysisType.id,
        analysisTypeName: analysisType.name,
        output: `Error generating analysis: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  // Save all results to database
  await prisma.$transaction(
    results.map((result) =>
      prisma.tickerV1DetailedReport.create({
        data: {
          tickerId: ticker.id,
          analysisTemplateId: analysisTemplateId,
          analysisTypeId: result.analysisTypeId,
          output: result.output,
        },
      })
    )
  );

  // Return the generated analysis info
  return {
    id: `${tickerId}-${analysisTemplateId}-${categoryId}`,
    tickerId: ticker.id,
    analysisTemplateId: analysisTemplateId,
    categoryId: categoryId,
    ticker: {
      name: ticker.name,
      symbol: ticker.symbol,
      exchange: ticker.exchange,
    },
    analysisTemplate: {
      name: category.analysisTemplate.name,
    },
    category: {
      name: category.name,
    },
    createdAt: new Date().toISOString(),
  };
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

export const GET = withErrorHandlingV2<GeneratedAnalysis[]>(getHandler);
export const POST = withErrorHandlingV2<GeneratedAnalysis>(postHandler);
