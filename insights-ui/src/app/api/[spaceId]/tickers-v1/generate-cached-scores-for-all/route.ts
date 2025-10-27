import { TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { EvaluationResult } from '@prisma/client';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

interface PopulateCachedScoresResponse {
  success: boolean;
  message: string;
  processed: number;
  errors: string[];
}

interface TickerScoreData {
  tickerId: string;
  businessAndMoatScore: number;
  financialStatementAnalysisScore: number;
  pastPerformanceScore: number;
  futureGrowthScore: number;
  fairValueScore: number;
  finalScore: number;
}

async function postHandler(req: NextRequest): Promise<PopulateCachedScoresResponse> {
  const errors: string[] = [];
  let processed = 0;

  try {
    // Get all industries with their sub-industries
    const industries = await prisma.tickerV1Industry.findMany({
      include: {
        subIndustries: true,
      },
    });

    console.log(`Found ${industries.length} industries to process`);

    for (const industry of industries) {
      console.log(`Processing industry: ${industry.name} (${industry.industryKey})`);

      // Process each sub-industry within the industry
      for (const subIndustry of industry.subIndustries) {
        console.log(`Processing sub-industry: ${subIndustry.name} (${subIndustry.subIndustryKey})`);

        try {
          // Get all tickers for this industry/sub-industry combination
          const tickers = await prisma.tickerV1.findMany({
            where: {
              industryKey: industry.industryKey,
              subIndustryKey: subIndustry.subIndustryKey,
            },
            select: {
              id: true,
              symbol: true,
              name: true,
            },
          });

          if (tickers.length === 0) {
            console.log(`No tickers found for ${industry.industryKey}/${subIndustry.subIndustryKey}`);
            continue;
          }

          console.log(`Found ${tickers.length} tickers to process`);

          // Get all category analysis results for all tickers in this sub-industry in one query
          const categoryResults = await prisma.tickerV1CategoryAnalysisResult.findMany({
            where: {
              tickerId: {
                in: tickers.map((t) => t.id),
              },
            },
            include: {
              factorResults: {
                select: {
                  result: true,
                },
              },
            },
          });

          // Calculate scores for all tickers in memory
          const tickerScoresData: TickerScoreData[] = [];

          for (const ticker of tickers) {
            // Get category results for this specific ticker
            const tickerCategoryResults = categoryResults.filter((cr) => cr.tickerId === ticker.id);

            // Initialize scores
            const categoryScores = {
              businessAndMoat: 0,
              financialStatementAnalysis: 0,
              pastPerformance: 0,
              futureGrowth: 0,
              fairValue: 0,
            };

            // Calculate scores for each category
            for (const categoryResult of tickerCategoryResults) {
              const passedFactors = categoryResult.factorResults.filter((factor) => factor.result === EvaluationResult.Pass).length;

              switch (categoryResult.categoryKey) {
                case TickerAnalysisCategory.BusinessAndMoat:
                  categoryScores.businessAndMoat = passedFactors;
                  break;
                case TickerAnalysisCategory.FinancialStatementAnalysis:
                  categoryScores.financialStatementAnalysis = passedFactors;
                  break;
                case TickerAnalysisCategory.PastPerformance:
                  categoryScores.pastPerformance = passedFactors;
                  break;
                case TickerAnalysisCategory.FutureGrowth:
                  categoryScores.futureGrowth = passedFactors;
                  break;
                case TickerAnalysisCategory.FairValue:
                  categoryScores.fairValue = passedFactors;
                  break;
              }
            }

            // Calculate final score (sum of all category scores)
            const finalScore =
              categoryScores.businessAndMoat +
              categoryScores.financialStatementAnalysis +
              categoryScores.pastPerformance +
              categoryScores.futureGrowth +
              categoryScores.fairValue;

            // Only add to batch if ticker has some analysis results
            if (tickerCategoryResults.length > 0) {
              tickerScoresData.push({
                tickerId: ticker.id,
                businessAndMoatScore: categoryScores.businessAndMoat,
                financialStatementAnalysisScore: categoryScores.financialStatementAnalysis,
                pastPerformanceScore: categoryScores.pastPerformance,
                futureGrowthScore: categoryScores.futureGrowth,
                fairValueScore: categoryScores.fairValue,
                finalScore,
              });
            }
          }

          // Batch upsert all cached scores for this sub-industry in one transaction
          if (tickerScoresData.length > 0) {
            await prisma.$transaction(async (tx) => {
              for (const scoreData of tickerScoresData) {
                await tx.tickerV1CachedScore.upsert({
                  where: { tickerId: scoreData.tickerId },
                  update: {
                    businessAndMoatScore: scoreData.businessAndMoatScore,
                    financialStatementAnalysisScore: scoreData.financialStatementAnalysisScore,
                    pastPerformanceScore: scoreData.pastPerformanceScore,
                    futureGrowthScore: scoreData.futureGrowthScore,
                    fairValueScore: scoreData.fairValueScore,
                    finalScore: scoreData.finalScore,
                    updatedAt: new Date(),
                  },
                  create: {
                    tickerId: scoreData.tickerId,
                    businessAndMoatScore: scoreData.businessAndMoatScore,
                    financialStatementAnalysisScore: scoreData.financialStatementAnalysisScore,
                    pastPerformanceScore: scoreData.pastPerformanceScore,
                    futureGrowthScore: scoreData.futureGrowthScore,
                    fairValueScore: scoreData.fairValueScore,
                    finalScore: scoreData.finalScore,
                  },
                });
              }
            });

            processed += tickerScoresData.length;
            console.log(`Successfully processed ${tickerScoresData.length} tickers for ${industry.industryKey}/${subIndustry.subIndustryKey}`);
          }

          // Small delay to prevent overwhelming the database
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          const errorMsg = `Error processing sub-industry ${industry.industryKey}/${subIndustry.subIndustryKey}: ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      console.log(`Completed industry: ${industry.name}`);
    }

    console.log(`Completed processing all industries. Total tickers processed: ${processed}`);

    return {
      success: true,
      message: `Successfully processed ${processed} tickers across all industries. ${errors.length} errors occurred.`,
      processed,
      errors,
    };
  } catch (error) {
    console.error('Error in populate cached scores:', error);
    return {
      success: false,
      message: `Failed to populate cached scores: ${error}`,
      processed,
      errors: [error as string],
    };
  }
}

export const POST = withErrorHandlingV2<PopulateCachedScoresResponse>(postHandler);
