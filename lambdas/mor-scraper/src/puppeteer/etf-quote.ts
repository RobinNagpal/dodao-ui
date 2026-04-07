import { Browser, Page } from "puppeteer-core";

const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
let puppeteer: any;
let chromium: any;

if (isLambda) {
  puppeteer = require("puppeteer-core");
  chromium = require("@sparticuz/chromium");
} else {
  puppeteer = require("puppeteer-extra");
  const StealthPlugin = require("puppeteer-extra-plugin-stealth");
  puppeteer.use(StealthPlugin());
}

/* ========================= Types ========================= */

export interface ScrapeError {
  where: string;
  message: string;
}

export interface OverviewMetric {
  label: string;
  value: string;
}

export interface EtfOverview {
  name?: string;
  ticker?: string;
  exchange?: string;
  overviewMetrics: Record<string, string>;
  marketData: Record<string, string>;
}

export interface AnalysisSection {
  pillar: string;
  date?: string;
  rating?: string;
  author?: string;
  content: string;
}

export interface EtfAnalysis {
  available: boolean;
  medalistRating?: string;
  headline?: string;
  sections: AnalysisSection[];
}

export interface ReturnsRow {
  label: string;
  values: Record<string, string>;
}

export interface EtfReturns {
  annual: ReturnsRow[];
  trailing: ReturnsRow[];
}

export interface Holding {
  name: string;
  portfolioWeight?: string;
  marketValue?: string;
  sector?: string;
}

export interface EtfHoldings {
  currentPortfolioDate?: string;
  equityHoldings?: string;
  bondHoldings?: string;
  otherHoldings?: string;
  pctAssetsInTop10?: string;
  topHoldings: Holding[];
}

export interface EtfStrategy {
  text: string;
}

export interface EtfQuoteResult {
  overview?: EtfOverview;
  analysis?: EtfAnalysis;
  returns?: EtfReturns;
  holdings?: EtfHoldings;
  strategy?: EtfStrategy;
  errors: ScrapeError[];
}

/* ========================= Helpers ========================= */

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function makeError(where: string, err: unknown): ScrapeError {
  return { where, message: err instanceof Error ? err.message : String(err) };
}

async function launchBrowser(): Promise<Browser> {
  const launchOptions: any = {
    args: isLambda
      ? chromium.args
      : [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
          "--window-size=1920,1080",
        ],
    headless: true,
  };

  if (isLambda) {
    launchOptions.defaultViewport = chromium.defaultViewport;
    launchOptions.executablePath = await chromium.executablePath();
  }

  return puppeteer.launch(launchOptions);
}

async function navigateToPage(browser: Browser, url: string): Promise<Page> {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
  );

  // Mask webdriver detection
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    Object.defineProperty(navigator, "plugins", {
      get: () => [1, 2, 3, 4, 5],
    });
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"],
    });
    (window as any).chrome = { runtime: {} };
  });

  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
  await delay(3000);

  // Check for CAPTCHA and wait/retry if detected
  const pageText: string = await page.evaluate(() => document.body.innerText);
  if (
    pageText.includes("confirm you are human") ||
    pageText.includes("security check")
  ) {
      console.log(
        "[ETFQuoteScraper] CAPTCHA detected, waiting 15s and retrying..."
      );
    await delay(15000);
    await page.reload({ waitUntil: "networkidle2", timeout: 60000 });
    await delay(5000);

    // Check again after retry
    const retryText: string = await page.evaluate(
      () => document.body.innerText
    );
    if (
      retryText.includes("confirm you are human") ||
      retryText.includes("security check")
    ) {
      throw new Error(
        "CAPTCHA challenge detected. The target site is rate-limiting this IP. " +
          "Wait a few minutes or use a different IP/proxy."
      );
    }
  }

  return page;
}

/* ========================= Section Scrapers ========================= */

function parseOverviewFromText(fullText: string, url: string): EtfOverview {
  const result: EtfOverview = {
    overviewMetrics: {},
    marketData: {},
  };

  const pathParts = new URL(url).pathname.split("/");
  const etfIdx = pathParts.findIndex((p) => p === "etfs" || p === "funds");
  if (etfIdx >= 0 && pathParts.length > etfIdx + 2) {
    result.exchange = pathParts[etfIdx + 1];
    result.ticker = pathParts[etfIdx + 2]?.toUpperCase();
  }

  const lines = fullText.split("\n").map((l) => l.trim()).filter(Boolean);

  // Extract ETF name: look for a line containing the ticker symbol
  // Title looks like "Vanguard Large-Cap Index Fund ETF Shares VV"
  const ticker = result.ticker;
  if (ticker) {
    for (const line of lines) {
      if (
        line.includes(ticker) &&
        line.length > ticker.length + 5 &&
        line.length < 200 &&
        !line.includes("More") &&
        !line.includes("Holdings") &&
        !line.includes("Analysis") &&
        !line.includes("Skip") &&
        !line.startsWith("Download")
      ) {
        result.name = line.replace(new RegExp(`\\s*${ticker}\\s*$`), "").trim();
        break;
      }
    }
  }

  // Overview metrics: look for known label patterns with the value on the same or next line
  const overviewLabels = [
    "NAV",
    "1-Day Return",
    "Total Assets",
    "Adj. Expense Ratio",
    "Prospectus Net Expense Ratio",
    "Category",
    "Equity Style Box",
    "SEC Yield",
    "TTM Yield",
    "Turnover",
    "Status",
  ];

  const marketLabels = [
    "Open Price",
    "Bid / Ask / Spread",
    "Volume / Avg",
    "Day Range",
    "Year Range",
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Dynamic style-box label: category-dependent but always contains "Style Box".
    // Keep Category as-is; store any "*Style Box*" value under a consistent key.
    if (
      !result.overviewMetrics["Style Box"] &&
      /style box/i.test(line) &&
      i + 1 < lines.length
    ) {
      const nextLine = lines[i + 1];
      if (
        nextLine &&
        !overviewLabels.includes(nextLine) &&
        !marketLabels.includes(nextLine) &&
        nextLine.length < 100
      ) {
        result.overviewMetrics["Style Box"] = nextLine;
      }
    }

    // Check overview labels
    for (const label of overviewLabels) {
      if (line === label && i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        if (
          nextLine &&
          !overviewLabels.includes(nextLine) &&
          !marketLabels.includes(nextLine) &&
          nextLine.length < 100
        ) {
          if (!result.overviewMetrics[label]) {
            result.overviewMetrics[label] = nextLine;
          }
        }
      }
    }

    // Market data: "NAV" in market context comes after "Market Closed" or similar
    for (const label of marketLabels) {
      if (line === label && i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        if (
          nextLine &&
          !overviewLabels.includes(nextLine) &&
          !marketLabels.includes(nextLine) &&
          nextLine.length < 100
        ) {
          result.marketData[label] = nextLine;
        }
      }
    }
  }

  // Special handling: grab the first NAV value specifically from the market data section
  // Look for the pattern where NAV appears after the chart/price area
  const marketSectionIdx = fullText.indexOf("Open Price");
  if (marketSectionIdx > 0) {
    const marketText = fullText.substring(
      Math.max(0, marketSectionIdx - 200),
      marketSectionIdx
    );
    const marketLines = marketText.split("\n").map((l) => l.trim()).filter(Boolean);
    for (let i = 0; i < marketLines.length; i++) {
      if (marketLines[i] === "NAV" && i + 1 < marketLines.length) {
        result.marketData["NAV"] = marketLines[i + 1];
        break;
      }
    }
  }

  return result;
}

function parseAnalysisFromText(fullText: string): EtfAnalysis {
  const result: EtfAnalysis = {
    available: false,
    sections: [],
  };

  // Check if analysis exists
  if (
    fullText.includes("no Morningstar") &&
    fullText.includes("Analysis data available")
  ) {
    return result;
  }

  const analysisStart = fullText.indexOf("Morningstar\u2019s Analysis");
  if (analysisStart < 0) {
    const altStart = fullText.indexOf("Morningstar's Analysis");
    if (altStart < 0) return result;
  }

  result.available = true;

  // Find boundaries for the analysis section
  const startIdx =
    fullText.indexOf("Morningstar\u2019s Analysis") >= 0
      ? fullText.indexOf("Morningstar\u2019s Analysis")
      : fullText.indexOf("Morningstar's Analysis");

  // Analysis ends at "Portfolio Holdings" or "Growth of 10,000"
  let endIdx = fullText.indexOf("Close Full Analysis", startIdx);
  if (endIdx < 0) endIdx = fullText.indexOf("Growth of 10,000", startIdx);
  if (endIdx < 0) endIdx = fullText.indexOf("Portfolio Holdings", startIdx);
  if (endIdx < 0) endIdx = startIdx + 20000;

  const analysisText = fullText.substring(startIdx, endIdx);

  // Extract medalist rating
  const medalistMatch = analysisText.match(
    /Medalist rating as of ([^.]+)\./
  );
  if (medalistMatch) {
    result.medalistRating = medalistMatch[0];
  }

  // Extract gold/silver/bronze rating
  const ratingMatch = analysisText.match(
    /assigns\s+(Gold|Silver|Bronze|Neutral|Negative)\s+ratings/i
  );
  if (ratingMatch) {
    result.medalistRating = ratingMatch[1];
  }

  // Parse individual pillar sections
  // The analysis text contains sections that start with pillar headings
  // followed by a rating keyword (High, Above Average, etc.) and content paragraphs
  // ending with "by Author Name" and "Rated/Published on" lines
  const pillarNames = [
    "Summary",
    "Process",
    "People",
    "Parent",
    "Performance",
    "Price",
  ];

  const analysisLines = analysisText.split("\n").map((l) => l.trim());

  // Find line indices where each pillar heading appears as a standalone word
  // followed by content (not as part of "Process Pillar" or tab labels)
  const pillarIndices: { name: string; lineIdx: number }[] = [];

  for (let i = 0; i < analysisLines.length; i++) {
    const line = analysisLines[i];
    for (const pName of pillarNames) {
      // Match standalone pillar heading followed by a rating or content
      if (line === pName) {
        // Check next non-empty line: should be a rating keyword or content
        let nextIdx = i + 1;
        while (nextIdx < analysisLines.length && !analysisLines[nextIdx]) nextIdx++;
        if (nextIdx < analysisLines.length) {
          const nextLine = analysisLines[nextIdx];
          const isRating = /^(High|Above Average|Average|Below Average|Low)$/.test(nextLine);
          const isContent = nextLine.length > 30;
          const isPillarSubheading = pillarNames.includes(nextLine);
          // Only accept if followed by rating or content paragraph
          if (isRating || (isContent && !isPillarSubheading)) {
            pillarIndices.push({ name: pName, lineIdx: i });
          }
        }
      }
    }
  }

  for (let p = 0; p < pillarIndices.length; p++) {
    const { name: pillarName, lineIdx: startLine } = pillarIndices[p];
    const endLine = p + 1 < pillarIndices.length
      ? pillarIndices[p + 1].lineIdx
      : analysisLines.length;

    const sectionLines = analysisLines.slice(startLine, endLine);
    const sectionText = sectionLines.join("\n");

    const ratingMatch = sectionText.match(
      /\b(High|Above Average|Average|Below Average|Low)\b/
    );
    const dateMatch = sectionText.match(
      /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}/
    );
    const authorMatch = sectionText.match(
      /by\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/
    );

    const contentLines = sectionLines.filter(
      (l) =>
        l.length > 40 &&
        !l.startsWith("Rated on") &&
        !l.startsWith("Published on") &&
        !l.match(/^by\s/) &&
        !pillarNames.includes(l) &&
        l !== "Associate Analyst" &&
        l !== "Senior Analyst" &&
        !l.match(/^(High|Above Average|Average|Below Average|Low)$/) &&
        !l.match(/Pillar$/)
    );

    const content = contentLines.join("\n\n");

    if (content) {
      result.sections.push({
        pillar: pillarName,
        rating: ratingMatch?.[1],
        date: dateMatch?.[0],
        author: authorMatch?.[1],
        content,
      });
    }
  }

  // If no pillar-level sections found, extract the headline/intro as a summary
  if (result.sections.length === 0) {
    const contentLines = analysisLines.filter((l) => l.length > 40);
    if (contentLines.length > 0) {
      result.sections.push({
        pillar: "Full Analysis",
        content: contentLines.join("\n\n"),
      });
    }
  }

  return result;
}

function parseReturnsFromText(fullText: string): EtfReturns {
  const result: EtfReturns = { annual: [], trailing: [] };

  // Find the returns section
  const returnsIdx = fullText.indexOf("Returns\n");
  if (returnsIdx < 0) return result;

  // Find end boundary
  let endIdx = fullText.indexOf("Portfolio Holdings", returnsIdx);
  if (endIdx < 0) endIdx = fullText.indexOf("Sponsor Center", returnsIdx);
  if (endIdx < 0) endIdx = returnsIdx + 5000;

  const returnsText = fullText.substring(returnsIdx, endIdx);

  // Normalize tabs to newlines (page mixes tabs and newlines as separators)
  const normalizedText = returnsText.replace(/\t/g, "\n");
  const lines = normalizedText.split("\n").map((l) => l.trim()).filter(Boolean);

  // Find year headers (consecutive years like 2016, 2017, ...)
  const yearPattern = /^(20\d{2}|YTD)$/;
  const yearHeaders: string[] = [];
  let yearStartIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    if (yearPattern.test(lines[i])) {
      if (yearStartIdx < 0) yearStartIdx = i;
      yearHeaders.push(lines[i]);
    } else if (yearStartIdx >= 0 && yearHeaders.length > 0) {
      break;
    }
  }

  if (yearHeaders.length === 0) return result;

  // After year headers, parse row labels and values
  const dataRowLabels = [
    "Investment (Price)",
    "Investment (NAV)",
    "Category (NAV)",
    "Index",
    "Quartile Rank",
    "Percentile Rank",
    "# of Invest. in Cat.",
    "Category Name",
  ];

  const afterYearsIdx = yearStartIdx + yearHeaders.length;

  for (const label of dataRowLabels) {
    const labelIdx = lines.indexOf(label, afterYearsIdx);
    if (labelIdx < 0) continue;

    const row: ReturnsRow = { label, values: {} };

    // Collect the next N values (where N = number of year columns)
    let collected = 0;
    for (
      let j = labelIdx + 1;
      j < lines.length && collected < yearHeaders.length;
      j++
    ) {
      const val = lines[j];
      // Skip if it's another known label
      if (dataRowLabels.includes(val)) break;
      // Skip screen-reader text like "Quartile Rank is"
      if (val.startsWith("Quartile Rank is")) {
        row.values[yearHeaders[collected]] = val.replace("Quartile Rank is", "").trim();
        collected++;
        continue;
      }
      // Skip tooltip text
      if (val.length > 50) continue;
      if (val === "US Fund Large Blend" || val === "LB") {
        // Category Name values alternate between abbreviation and full name
        if (!row.values[yearHeaders[collected]]) {
          row.values[yearHeaders[collected]] = val;
          collected++;
        }
        continue;
      }
      row.values[yearHeaders[collected]] = val;
      collected++;
    }

    if (Object.keys(row.values).length > 0) {
      result.annual.push(row);
    }
  }

  return result;
}

async function scrapeTrailingReturns(page: Page): Promise<ReturnsRow[]> {
  // Click the "Trailing" tab
  const clicked = await page.evaluate(() => {
    const buttons = document.querySelectorAll("button, [role='tab'], a");
    for (const btn of Array.from(buttons)) {
      const text = btn.textContent?.trim();
      if (text === "Trailing") {
        (btn as HTMLElement).click();
        return true;
      }
    }
    return false;
  });

  if (!clicked) return [];

  await delay(2000);

  // Get the updated page text and parse trailing returns
  const trailingText: string = await page.evaluate(
    () => document.body.innerText
  );

  const rows: ReturnsRow[] = [];

  // Scope to the Returns section only (between "Returns" and "Portfolio Holdings")
  const returnsIdx = trailingText.indexOf("Returns\n");
  if (returnsIdx < 0) return rows;
  let returnsEndIdx = trailingText.indexOf("Portfolio Holdings", returnsIdx);
  if (returnsEndIdx < 0) returnsEndIdx = trailingText.indexOf("Strategy\n", returnsIdx);
  if (returnsEndIdx < 0) returnsEndIdx = returnsIdx + 5000;

  const scopedText = trailingText.substring(returnsIdx, returnsEndIdx);
  // Normalize: replace tabs with newlines since the page sometimes uses
  // tabs to separate values that should be on separate lines
  const normalizedText = scopedText.replace(/\t/g, "\n");
  const lines = normalizedText.split("\n").map((l: string) => l.trim()).filter(Boolean);

  // Look for trailing period headers
  const trailingHeaders: string[] = [];
  const trailingPattern =
    /^(1-Day|1-Week|1-Month|3-Month|6-Month|YTD|1-Year|3-Year|5-Year|10-Year|15-Year)$/;
  let headerStartIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    if (trailingPattern.test(lines[i])) {
      if (headerStartIdx < 0) headerStartIdx = i;
      trailingHeaders.push(lines[i]);
    } else if (headerStartIdx >= 0 && trailingHeaders.length > 0) {
      break;
    }
  }

  if (trailingHeaders.length === 0) return rows;

  const dataRowLabels = [
    "Investment (Price)",
    "Investment (NAV)",
    "Category (NAV)",
    "Index",
    "Quartile Rank",
    "Percentile Rank",
    "# of Invest. in Cat.",
    "Category Name",
  ];

  // Boundary: stop collecting values at known section markers
  const stopMarkers = [
    "Portfolio Holdings",
    "Strategy",
    "Sponsor Center",
    "Site Index",
    "More",
  ];

  const afterHeadersIdx = headerStartIdx + trailingHeaders.length;

  for (const label of dataRowLabels) {
    const labelIdx = lines.indexOf(label, afterHeadersIdx);
    if (labelIdx < 0) continue;

    const row: ReturnsRow = { label, values: {} };
    let collected = 0;

    for (
      let j = labelIdx + 1;
      j < lines.length && collected < trailingHeaders.length;
      j++
    ) {
      const val = lines[j];
      // Stop if we hit another data row label or a section marker
      if (dataRowLabels.includes(val)) break;
      if (stopMarkers.some((m) => val.startsWith(m))) break;

      if (val.startsWith("Quartile Rank is")) {
        row.values[trailingHeaders[collected]] = val
          .replace("Quartile Rank is", "")
          .trim();
        collected++;
        continue;
      }
      // Skip tooltip/long text
      if (val.length > 50) continue;
      // Skip full category names that follow abbreviations
      if (val === "US Fund Large Blend" || val === "US Fund Defined Outcome") {
        continue;
      }
      row.values[trailingHeaders[collected]] = val;
      collected++;
    }

    if (Object.keys(row.values).length > 0) {
      rows.push(row);
    }
  }

  return rows;
}

function parseHoldingsFromText(fullText: string): EtfHoldings {
  const result: EtfHoldings = { topHoldings: [] };

  const holdingsIdx = fullText.indexOf("Portfolio Holdings");
  if (holdingsIdx < 0) return result;

  let endIdx = fullText.indexOf("Strategy\n", holdingsIdx);
  if (endIdx < 0) endIdx = fullText.indexOf("Sponsor Center", holdingsIdx);
  if (endIdx < 0) endIdx = holdingsIdx + 5000;

  const holdingsText = fullText.substring(holdingsIdx, endIdx);
  const lines = holdingsText.split("\n").map((l) => l.trim()).filter(Boolean);

  // Parse metadata
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === "Current Portfolio Date" && i + 1 < lines.length) {
      result.currentPortfolioDate = lines[i + 1];
    }
    if (line === "Equity Holdings" && i + 1 < lines.length) {
      result.equityHoldings = lines[i + 1];
    }
    if (line === "Bond Holdings" && i + 1 < lines.length) {
      result.bondHoldings = lines[i + 1];
    }
    if (line === "Other Holdings" && i + 1 < lines.length) {
      result.otherHoldings = lines[i + 1];
    }
    if (line.includes("% Assets in Top 10") && i + 1 < lines.length) {
      result.pctAssetsInTop10 = lines[i + 1];
    }
  }

  // Parse top holdings table
  // Find "Sector" header as an anchor for the table data
  const sectorIdx = lines.indexOf("Sector");
  if (sectorIdx < 0) return result;

  // After "Sector", we have holding rows: Name, Weight, Market Value, Sector (repeated)
  // The pattern is: holding name, then numeric values, then sector name
  const holdingData = lines.slice(sectorIdx + 1);

  let i = 0;
  while (i < holdingData.length) {
    const name = holdingData[i];
    // A holding name is non-numeric and not too short
    if (!name || name.length < 3 || /^\d/.test(name) || name === "—") {
      i++;
      continue;
    }

    // Check if this looks like a holding name (not a number or known non-name)
    const isNumber = /^[-−]?\d/.test(name) || /^\d/.test(name.replace(/[,$%]/g, ""));
    if (isNumber) {
      i++;
      continue;
    }

    const holding: Holding = { name };

    // Next values should be: weight, market value, sector
    if (i + 1 < holdingData.length) {
      const w = holdingData[i + 1];
      if (/^[-−]?\d/.test(w)) {
        holding.portfolioWeight = w;

        if (i + 2 < holdingData.length) {
          const mv = holdingData[i + 2];
          if (/^[-−]?\d/.test(mv) || /\d/.test(mv)) {
            holding.marketValue = mv;

            if (i + 3 < holdingData.length) {
              const sec = holdingData[i + 3];
              if (sec && !/^[-−]?\d/.test(sec) && sec !== "—") {
                holding.sector = sec;
                i += 4;
              } else if (sec === "—") {
                holding.sector = "—";
                i += 4;
              } else {
                i += 3;
              }
            } else {
              i += 3;
            }
          } else {
            // mv is actually sector (no market value)
            holding.sector = mv;
            i += 3;
          }
        } else {
          i += 2;
        }
      } else {
        // Next line is not numeric, this might be a sector-less holding
        i++;
        continue;
      }
    } else {
      i++;
      continue;
    }

    result.topHoldings.push(holding);
  }

  return result;
}

function parseStrategyFromText(fullText: string): EtfStrategy {
  const result: EtfStrategy = { text: "" };

  const strategyIdx = fullText.indexOf("\nStrategy\n");
  if (strategyIdx < 0) {
    const altIdx = fullText.lastIndexOf("Strategy\n");
    if (altIdx < 0) return result;
  }

  const startIdx =
    fullText.indexOf("\nStrategy\n") >= 0
      ? fullText.indexOf("\nStrategy\n")
      : fullText.lastIndexOf("Strategy\n");

  let endIdx = fullText.indexOf("Sponsor Center", startIdx);
  if (endIdx < 0) endIdx = fullText.indexOf("Site Index", startIdx);
  if (endIdx < 0) endIdx = startIdx + 3000;

  const strategyText = fullText.substring(startIdx, endIdx);
  const lines = strategyText
    .split("\n")
    .map((l) => l.trim())
    .filter(
      (l) =>
        l.length > 20 &&
        l !== "Strategy" &&
        !l.startsWith("More") &&
        !l.startsWith("Download") &&
        !l.includes("See Innovator") &&
        !l.includes("See Vanguard")
    );

  result.text = lines.join("\n\n");
  return result;
}

/* ========================= Public API ========================= */

export type ScrapeSection =
  | "overview"
  | "analysis"
  | "returns"
  | "holdings"
  | "strategy"
  | "all";

export async function scrapeEtfQuote(
  url: string,
  sections: ScrapeSection[] = ["all"]
): Promise<EtfQuoteResult> {
  const errors: ScrapeError[] = [];
  let browser: Browser | null = null;

  try {
    console.log(`[ETFQuoteScraper] Launching browser for: ${url}`);
    browser = await launchBrowser();
    const page = await navigateToPage(browser, url);
    console.log("[ETFQuoteScraper] Page loaded, starting extraction...");

    const scrapeAll = sections.includes("all");
    const result: EtfQuoteResult = { errors };

    // Get the full page text once
    const fullText: string = await page.evaluate(
      () => document.body.innerText
    );

    if (process.env.DEBUG_DUMP) {
      const fs = require("fs");
      fs.writeFileSync("debug-innertext.txt", fullText, "utf-8");
      console.log(
        `[ETFQuoteScraper] Debug: dumped ${fullText.length} chars to debug-innertext.txt`
      );
    }

    console.log(`[ETFQuoteScraper] Page text length: ${fullText.length} chars`);

    if (scrapeAll || sections.includes("overview")) {
      try {
        console.log("[ETFQuoteScraper] Scraping overview...");
        result.overview = parseOverviewFromText(fullText, url);
      } catch (err) {
        errors.push(makeError("scrapeOverview", err));
      }
    }

    if (scrapeAll || sections.includes("analysis")) {
      try {
        console.log("[ETFQuoteScraper] Scraping analysis...");
        result.analysis = parseAnalysisFromText(fullText);
      } catch (err) {
        errors.push(makeError("scrapeAnalysis", err));
      }
    }

    if (scrapeAll || sections.includes("returns")) {
      try {
        console.log("[ETFQuoteScraper] Scraping returns (annual)...");
        result.returns = parseReturnsFromText(fullText);

        console.log("[ETFQuoteScraper] Scraping returns (trailing)...");
        const trailing = await scrapeTrailingReturns(page);
        if (result.returns) {
          result.returns.trailing = trailing;
        }
      } catch (err) {
        errors.push(makeError("scrapeReturns", err));
      }
    }

    if (scrapeAll || sections.includes("holdings")) {
      try {
        console.log("[ETFQuoteScraper] Scraping holdings...");
        result.holdings = parseHoldingsFromText(fullText);
      } catch (err) {
        errors.push(makeError("scrapeHoldings", err));
      }
    }

    if (scrapeAll || sections.includes("strategy")) {
      try {
        console.log("[ETFQuoteScraper] Scraping strategy...");
        result.strategy = parseStrategyFromText(fullText);
      } catch (err) {
        errors.push(makeError("scrapeStrategy", err));
      }
    }

    console.log("[ETFQuoteScraper] Extraction complete.");
    return result;
  } catch (err) {
    errors.push(makeError("scrapeEtfQuote", err));
    return { errors };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
