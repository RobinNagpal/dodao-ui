import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { TickerAnalysisCategory } from '@/lib/mappingsV1';
import { EvaluationResult, TickerV1 } from '@prisma/client';
import { updateTickerCachedScore } from '@/utils/ticker-v1-model-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

interface PopulateCachedScoresResponse {
  success: boolean;
  message: string;
  processed: number;
  errors: string[];
}

async function postHandler(req: NextRequest): Promise<PopulateCachedScoresResponse> {
  const errors: string[] = [];
  let processed = 0;
  const BATCH_SIZE = 10; // Process in small batches to avoid memory issues

  try {
    // Get total count of tickers
    const totalTickers = await prisma.tickerV1.count();
    console.log(`Found ${totalTickers} tickers to process`);

    let processedInBatch = 0;
    let skip = 0;

    while (skip < totalTickers) {
      // Get tickers in batches
      const tickers = await prisma.tickerV1.findMany({
        select: {
          id: true,
          symbol: true,
          name: true,
          industryKey: true,
          subIndustryKey: true,
        },
        skip,
        take: BATCH_SIZE,
      });

      console.log(`Processing batch ${Math.floor(skip / BATCH_SIZE) + 1}/${Math.ceil(totalTickers / BATCH_SIZE)}`);

      for (const ticker of tickers) {
        try {
          // Get all category analysis results for this ticker with factor results
          const categoryResults = await prisma.tickerV1CategoryAnalysisResult.findMany({
            where: {
              tickerId: ticker.id,
            },
            include: {
              factorResults: {
                select: {
                  result: true,
                },
              },
            },
          });

          // Calculate scores for each category
          const categoryScores: Record<string, number> = {
            businessAndMoat: 0,
            financialStatementAnalysis: 0,
            pastPerformance: 0,
            futureGrowth: 0,
            fairValue: 0,
          };

          for (const categoryResult of categoryResults) {
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

          // Update cached score for each category that has results
          // Each call will preserve existing scores from other categories
          if (categoryResults.length > 0) {
            // Update each category that has results
            if (categoryScores.businessAndMoat > 0) {
              await updateTickerCachedScore(ticker as TickerV1, 'businessAndMoat', categoryScores.businessAndMoat);
            }
            if (categoryScores.financialStatementAnalysis > 0) {
              await updateTickerCachedScore(ticker as TickerV1, 'financialStatementAnalysis', categoryScores.financialStatementAnalysis);
            }
            if (categoryScores.pastPerformance > 0) {
              await updateTickerCachedScore(ticker as TickerV1, 'pastPerformance', categoryScores.pastPerformance);
            }
            if (categoryScores.futureGrowth > 0) {
              await updateTickerCachedScore(ticker as TickerV1, 'futureGrowth', categoryScores.futureGrowth);
            }
            if (categoryScores.fairValue > 0) {
              await updateTickerCachedScore(ticker as TickerV1, 'fairValue', categoryScores.fairValue);
            }
          }

          processed++;
          processedInBatch++;

          // Log progress every 50 tickers
          if (processed % 50 === 0) {
            console.log(`Processed ${processed}/${totalTickers} tickers`);
          }
        } catch (error) {
          const errorMsg = `Error processing ticker ${ticker.symbol}: ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      skip += BATCH_SIZE;

      // Small delay to prevent overwhelming the database
      if (skip < totalTickers) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log(`Completed processing all ${totalTickers} tickers`);

    return {
      success: true,
      message: `Successfully processed ${processed} tickers. ${errors.length} errors occurred.`,
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
