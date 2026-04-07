/**
 * Local test script for the ETF quote scraper
 *
 * Run with:
 *   npx tsx src/test-local.ts
 *   npx tsx src/test-local.ts --url ...
 *   npx tsx src/test-local.ts --section overview
 *   npx tsx src/test-local.ts --section analysis
 *   npx tsx src/test-local.ts --section returns
 *   npx tsx src/test-local.ts --section holdings
 *   npx tsx src/test-local.ts --section strategy
 */

import { scrapeEtfQuote, ScrapeSection } from "./puppeteer/etf-quote";

const DEFAULT_URL = "";

function parseArgs(): { url: string; sections: ScrapeSection[] } {
  const args = process.argv.slice(2);
  let url = DEFAULT_URL;
  const sections: ScrapeSection[] = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--url" && args[i + 1]) {
      url = args[++i];
    } else if (args[i] === "--section" && args[i + 1]) {
      sections.push(args[++i] as ScrapeSection);
    }
  }

  return { url, sections: sections.length > 0 ? sections : ["all"] };
}

function printOverview(data: any) {
  if (!data) {
    console.log("  No overview data found.");
    return;
  }
  if (data.name) console.log(`  Name: ${data.name}`);
  if (data.ticker) console.log(`  Ticker: ${data.ticker}`);
  if (data.exchange) console.log(`  Exchange: ${data.exchange}`);

  if (data.overviewMetrics?.length > 0) {
    console.log("\n  Overview Metrics:");
    data.overviewMetrics.forEach((m: any) => {
      console.log(`    ${m.label}: ${m.value}`);
    });
  }

  if (data.marketData?.length > 0) {
    console.log("\n  Market Data:");
    data.marketData.forEach((m: any) => {
      console.log(`    ${m.label}: ${m.value}`);
    });
  }
}

function printAnalysis(data: any) {
  if (!data) {
    console.log("  No analysis data found.");
    return;
  }
  console.log(`  Available: ${data.available}`);
  if (data.medalistRating) console.log(`  Medalist Rating: ${data.medalistRating}`);
  if (data.headline) console.log(`  Headline: ${data.headline}`);

  if (data.sections?.length > 0) {
    data.sections.forEach((s: any, i: number) => {
      console.log(`\n  --- Section ${i + 1}: ${s.pillar} ---`);
      if (s.rating) console.log(`  Rating: ${s.rating}`);
      if (s.date) console.log(`  Date: ${s.date}`);
      if (s.author) console.log(`  Author: ${s.author}`);
      const preview = s.content?.substring(0, 200) || "(empty)";
      console.log(`  Content: ${preview}${s.content?.length > 200 ? "..." : ""}`);
    });
  }
}

function printReturns(data: any) {
  if (!data) {
    console.log("  No returns data found.");
    return;
  }

  if (data.annual?.length > 0) {
    console.log("\n  Annual Returns:");
    data.annual.forEach((r: any) => {
      const vals = Object.entries(r.values)
        .map(([k, v]) => `${k}:${v}`)
        .join(", ");
      console.log(`    ${r.label}: ${vals}`);
    });
  } else {
    console.log("  No annual returns found.");
  }

  if (data.trailing?.length > 0) {
    console.log("\n  Trailing Returns:");
    data.trailing.forEach((r: any) => {
      const vals = Object.entries(r.values)
        .map(([k, v]) => `${k}:${v}`)
        .join(", ");
      console.log(`    ${r.label}: ${vals}`);
    });
  } else {
    console.log("  No trailing returns found.");
  }
}

function printHoldings(data: any) {
  if (!data) {
    console.log("  No holdings data found.");
    return;
  }
  if (data.currentPortfolioDate) console.log(`  Portfolio Date: ${data.currentPortfolioDate}`);
  if (data.equityHoldings) console.log(`  Equity Holdings: ${data.equityHoldings}`);
  if (data.bondHoldings) console.log(`  Bond Holdings: ${data.bondHoldings}`);
  if (data.otherHoldings) console.log(`  Other Holdings: ${data.otherHoldings}`);
  if (data.pctAssetsInTop10) console.log(`  % Assets in Top 10: ${data.pctAssetsInTop10}`);

  if (data.topHoldings?.length > 0) {
    console.log("\n  Top Holdings:");
    console.log(
      "  " +
        "Name".padEnd(40) +
        "Weight".padEnd(12) +
        "Market Value".padEnd(15) +
        "Sector"
    );
    console.log("  " + "-".repeat(80));
    data.topHoldings.forEach((h: any) => {
      const name = (h.name || "").substring(0, 38).padEnd(40);
      const weight = (h.portfolioWeight || "").padEnd(12);
      const value = (h.marketValue || "").padEnd(15);
      const sector = h.sector || "";
      console.log(`  ${name}${weight}${value}${sector}`);
    });
  }
}

function printStrategy(data: any) {
  if (!data || !data.text) {
    console.log("  No strategy data found.");
    return;
  }
  const preview = data.text.substring(0, 500);
  console.log(`  ${preview}${data.text.length > 500 ? "..." : ""}`);
}

async function main() {
  const { url, sections } = parseArgs();

  console.log("=== ETF Quote Scraper - Local Test ===\n");
  console.log(`URL: ${url}`);
  console.log(`Sections: ${sections.join(", ")}\n`);

  const startTime = Date.now();
  const result = await scrapeEtfQuote(url, sections);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\nCompleted in ${elapsed}s\n`);

  if (result.errors.length > 0) {
    console.log("Errors:");
    result.errors.forEach((err) => {
      console.log(`  [${err.where}] ${err.message}`);
    });
    console.log("");
  }

  const scrapeAll = sections.includes("all");

  if (scrapeAll || sections.includes("overview")) {
    console.log("=== OVERVIEW ===");
    printOverview(result.overview);
    console.log("");
  }

  if (scrapeAll || sections.includes("analysis")) {
    console.log("=== ANALYSIS ===");
    printAnalysis(result.analysis);
    console.log("");
  }

  if (scrapeAll || sections.includes("returns")) {
    console.log("=== RETURNS ===");
    printReturns(result.returns);
    console.log("");
  }

  if (scrapeAll || sections.includes("holdings")) {
    console.log("=== HOLDINGS ===");
    printHoldings(result.holdings);
    console.log("");
  }

  if (scrapeAll || sections.includes("strategy")) {
    console.log("=== STRATEGY ===");
    printStrategy(result.strategy);
    console.log("");
  }

  console.log("=== Full JSON Output ===");
  console.log(JSON.stringify(result, null, 2));
  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
