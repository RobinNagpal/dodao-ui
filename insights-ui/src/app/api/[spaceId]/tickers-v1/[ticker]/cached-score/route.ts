import { revalidateTickerAndExchangeTag } from '@/utils/ticker-v1-cache-utils';
import { FullTickerV1CategoryAnalysisResult } from '@/utils/ticker-v1-model-utils';
import { CATEGORY_MAPPINGS, EvaluationResult, INVESTOR_MAPPINGS } from '@/lib/mappingsV1';
import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { getLlmResponse } from '@/scripts/llm‑utils‑gemini';
import { GeminiModelType } from '@/types/llmConstants';
import { z, ZodObject } from 'zod';
import { TickerV1 } from '@prisma/client';
import { CompetitionAnalysis } from '@/types/public-equity/analysis-factors-types';

// Zod schema for the aboutReport response
const AboutReportSchema: ZodObject<{ aboutReport: z.ZodString }> = z.object({
  aboutReport: z.string().describe('A 2-3 sentence summary for the stock analysis report'),
});

// Function to get first 3 competitors from the competition analysis
function getTopCompetitors(tickerRecord: TickerV1 & { vsCompetition?: { competitionAnalysisArray: CompetitionAnalysis[] } | null }): {
  comp1: string;
  comp2: string;
  comp3: string;
  totalCount: number;
} {
  const defaultComp1 = 'Apple Inc. (AAPL)';
  const defaultComp2 = 'Microsoft Corporation (MSFT)';
  const defaultComp3 = 'Google Inc. (GOOGL)';

  if (!tickerRecord.vsCompetition?.competitionAnalysisArray) {
    return { comp1: defaultComp1, comp2: defaultComp2, comp3: defaultComp3, totalCount: 3 };
  }

  const allCompetitors = tickerRecord.vsCompetition.competitionAnalysisArray.filter((comp: CompetitionAnalysis) => comp.companyName && comp.companySymbol);

  const competitors = allCompetitors.slice(0, 3); // Get first 3
  const totalCount = allCompetitors.length;

  if (competitors.length === 0) {
    return { comp1: defaultComp1, comp2: defaultComp2, comp3: defaultComp3, totalCount: 3 };
  }

  if (competitors.length === 1) {
    return {
      comp1: `${competitors[0].companyName} (${competitors[0].companySymbol})`,
      comp2: defaultComp2,
      comp3: defaultComp3,
      totalCount,
    };
  }

  if (competitors.length === 2) {
    return {
      comp1: `${competitors[0].companyName} (${competitors[0].companySymbol})`,
      comp2: `${competitors[1].companyName} (${competitors[1].companySymbol})`,
      comp3: defaultComp3,
      totalCount,
    };
  }

  return {
    comp1: `${competitors[0].companyName} (${competitors[0].companySymbol})`,
    comp2: `${competitors[1].companyName} (${competitors[1].companySymbol})`,
    comp3: `${competitors[2].companyName} (${competitors[2].companySymbol})`,
    totalCount,
  };
}

// Function to build the base aboutReport text
function buildBaseAboutReport(tickerRecord: TickerV1 & { vsCompetition?: { competitionAnalysisArray: CompetitionAnalysis[] } | null }): string {
  const { comp1, comp2, comp3, totalCount } = getTopCompetitors(tickerRecord);

  // Get all category names (factors)
  const factors = Object.values(CATEGORY_MAPPINGS).join(', ');

  // Get 2 investor names
  const investorKeys = Object.keys(INVESTOR_MAPPINGS);
  const investor1 = INVESTOR_MAPPINGS[investorKeys[0] as keyof typeof INVESTOR_MAPPINGS];
  const investor2 = INVESTOR_MAPPINGS[investorKeys[1] as keyof typeof INVESTOR_MAPPINGS];

  // Use today's date instead of ticker's updatedAt
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Build competitors string with "and X more" logic
  let competitorsText = '';
  if (totalCount <= 3) {
    // Show all competitors if 3 or fewer
    if (totalCount === 1) {
      competitorsText = comp1;
    } else if (totalCount === 2) {
      competitorsText = `${comp1} and ${comp2}`;
    } else {
      competitorsText = `${comp1}, ${comp2} and ${comp3}`;
    }
  } else {
    // Show first 3 and mention how many more
    const remainingCount = totalCount - 3;
    competitorsText = `${comp1}, ${comp2}, ${comp3} and ${remainingCount} more`;
  }

  const baseInfo = `This report examines ${tickerRecord.name} (${tickerRecord.symbol}) on five angles—${factors}. It also benchmarks against ${competitorsText}, and maps takeaways to ${investor1}/${investor2} styles. Last updated ${today}.`;

  return baseInfo;
}

// Function to generate aboutReport using LLM
async function generateAboutReport(tickerRecord: TickerV1 & { vsCompetition?: { competitionAnalysisArray: CompetitionAnalysis[] } | null }): Promise<string> {
  const baseInfo = buildBaseAboutReport(tickerRecord);

  const prompt = `You are an expert financial writer creating compelling, SEO-friendly introductions for detailed stock analysis reports. Your primary goal is to generate a unique 2-3 sentence summary for each stock to avoid duplicate content penalties from search engines.

**Instructions:**
1. Rewrite the "Base Information" below into a fresh and engaging summary for an investor.
2. The summary MUST be between 2 and 3 sentences.
3. Naturally incorporate all the provided.
4. Vary the sentence structure and vocabulary significantly with each request to ensure uniqueness.
5. The tone should be professional, insightful, and authoritative.

**Base Information:**
${baseInfo}`;

  try {
    const response = await getLlmResponse<{ aboutReport: string }>(prompt, AboutReportSchema, GeminiModelType.GEMINI_2_5_PRO);
    return response.aboutReport;
  } catch (error) {
    console.error('Failed to generate aboutReport:', error);
    return baseInfo;
  }
}

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<{ success: boolean }> {
  const { spaceId, ticker } = await params;

  // Get ticker from DB
  const tickerRecord = await prisma.tickerV1.findFirstOrThrow({
    where: {
      spaceId: spaceId || KoalaGainsSpaceId,
      symbol: ticker.toUpperCase(),
    },
    include: {
      categoryAnalysisResults: {
        include: {
          factorResults: {
            include: {
              analysisCategoryFactor: true,
            },
          },
        },
      },
      investorAnalysisResults: true,
      futureRisks: true,
      vsCompetition: true,
    },
  });

  const totalScore = Object.entries(CATEGORY_MAPPINGS)
    .map(([categoryKey]) => {
      const report: FullTickerV1CategoryAnalysisResult | undefined = (tickerRecord.categoryAnalysisResults || []).find((r) => r.categoryKey === categoryKey);

      const scoresArray = report?.factorResults?.map((factorResult) => (factorResult.result === EvaluationResult.Pass ? 1 : 0)) || [];

      const categorysScoreSum: number = scoresArray.reduce((partialSum: number, a) => partialSum + a, 0);

      return categorysScoreSum;
    })
    .reduce((partialSum: number, a) => partialSum + a, 0);

  // Generate aboutReport using LLM
  const aboutReport = await generateAboutReport(tickerRecord);

  await prisma.tickerV1.update({
    data: {
      cachedScore: totalScore,
      aboutReport: aboutReport,
    },
    where: {
      id: tickerRecord.id,
    },
  });
  revalidateTickerAndExchangeTag(tickerRecord.symbol, tickerRecord.exchange);

  return {
    success: true,
  };
}

export const POST = withErrorHandlingV2<{ success: boolean }>(postHandler);
