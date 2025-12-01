/**
 * Local test script for the stock screener scraper
 * Run with: npx tsx src/test-local.ts
 * Run with losers: npx tsx src/test-local.ts --losers
 */

import { scrapeScreener, ScreenerFilters } from "./puppeteer/screener";

async function main() {
  console.log("🚀 Starting Stock Screener Scraper Test...\n");

  // Check for --losers flag to test "Under" filter
  const testLosers = process.argv.includes("--losers");

  const filters: ScreenerFilters = testLosers
    ? {
        marketCapMin: "Over 1B",
        priceChange1DMin: "Under -1%",
        limit: 15,
      }
    : {
        marketCapMin: "Over 1B",
        priceChange1DMin: "Over 1%",
        limit: 15,
      };

  const mode = testLosers ? "TOP LOSERS 📉" : "TOP GAINERS 📈";
  console.log(`📊 Mode: ${mode}`);
  console.log("📊 Filters:", JSON.stringify(filters, null, 2));
  console.log("\n⏳ Scraping screeners...\n");

  const startTime = Date.now();
  const result = await scrapeScreener(filters);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`✅ Completed in ${elapsed}s\n`);

  if (result.errors.length > 0) {
    console.log("⚠️  Errors encountered:");
    result.errors.forEach((err) => {
      console.log(`   - [${err.where}] ${err.message}`);
    });
    console.log("");
  }

  console.log(`📈 Total Matched: ${result.totalMatched}`);
  console.log(`📋 Returned: ${result.stocks.length} stocks\n`);

  if (result.stocks.length > 0) {
    console.log("┌─────────┬────────────────────────────────────────┬────────────┬───────────┐");
    console.log("│ Symbol  │ Company Name                           │ Market Cap │ % Change  │");
    console.log("├─────────┼────────────────────────────────────────┼────────────┼───────────┤");
    
    result.stocks.forEach((stock) => {
      const symbol = stock.symbol.padEnd(7);
      const company = stock.companyName.substring(0, 38).padEnd(38);
      const cap = stock.marketCap.padEnd(10);
      const change = stock.percentChange.padEnd(9);
      console.log(`│ ${symbol} │ ${company} │ ${cap} │ ${change} │`);
    });
    
    console.log("└─────────┴────────────────────────────────────────┴────────────┴───────────┘");
  } else {
    console.log("❌ No stocks found. Check errors above.");
  }

  console.log("\n✨ Done!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

