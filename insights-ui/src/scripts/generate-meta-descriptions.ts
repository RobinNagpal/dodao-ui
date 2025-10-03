import 'dotenv/config';
import { prisma } from '@/prisma';
import { z } from 'zod';
import { getLlmResponse } from './llm‑utils‑gemini';
import { generateMetaDescriptionPrompt } from '@/lib/promptForMetaDescriptionV1';

// Zod schema for meta description response
const MetaDescriptionResponse = z.object({
  metaDescription: z.string().min(1).max(160).describe('A concise meta description for the ticker analysis page'),
});

type MetaDescriptionResponseType = z.infer<typeof MetaDescriptionResponse>;

async function generateMetaDescriptionsForExistingTickers() {
  console.log('🚀 Starting meta description generation for existing tickers...');

  try {
    // Fetch all tickers that have a summary but no metaDescription
    const tickersWithoutMetaDescription = await prisma.tickerV1.findMany({
      where: {
        summary: {
          not: null,
        },
        metaDescription: null,
      },
      select: {
        id: true,
        symbol: true,
        name: true,
        summary: true,
        exchange: true,
      },
    });

    console.log(`📊 Found ${tickersWithoutMetaDescription.length} tickers without meta descriptions`);

    if (tickersWithoutMetaDescription.length === 0) {
      console.log('✅ All tickers already have meta descriptions!');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const ticker of tickersWithoutMetaDescription) {
      try {
        console.log(`🔄 Processing ${ticker.symbol} (${ticker.name})...`);

        if (!ticker.summary) {
          console.log(`⚠️  Skipping ${ticker.symbol} - no summary available`);
          continue;
        }

        const metaDescriptionPrompt = generateMetaDescriptionPrompt(ticker.summary);

        const metaDescriptionResult = await getLlmResponse<MetaDescriptionResponseType>(metaDescriptionPrompt, MetaDescriptionResponse, 'gemini', 3, 1000);

        const metaDescription = metaDescriptionResult.metaDescription;

        // Update the ticker with the new meta description
        await prisma.tickerV1.update({
          where: {
            id: ticker.id,
          },
          data: {
            metaDescription: metaDescription,
            updatedAt: new Date(),
          },
        });

        console.log(`✅ Generated meta description for ${ticker.symbol}: ${metaDescription.substring(0, 50)}...`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to generate meta description for ${ticker.symbol}:`, error);
        errorCount++;
      }

      // Add a small delay to avoid overwhelming the API
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log(`\n📈 Generation complete!`);
    console.log(`✅ Success: ${successCount} tickers updated`);
    console.log(`❌ Errors: ${errorCount} tickers failed`);
    console.log(`📊 Total processed: ${tickersWithoutMetaDescription.length}`);
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }
}

// Run the script
generateMetaDescriptionsForExistingTickers()
  .then(() => {
    console.log('🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
