import { Browser, Page } from "puppeteer-core";

// Conditionally import puppeteer based on environment
const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
let puppeteer: any;
let chromium: any;

if (isLambda) {
  puppeteer = require("puppeteer-core");
  chromium = require("@sparticuz/chromium");
} else {
  puppeteer = require("puppeteer");
}

export interface ScreenedStock {
  symbol: string;
  companyName: string;
  marketCap: string;
  percentChange: string;
}

export interface ScreenerResult {
  stocks: ScreenedStock[];
  totalMatched: number;
  errors: Array<{ where: string; message: string }>;
}

export interface ScreenerFilters {
  marketCapMin?: string; // e.g., "Over 1B", "Over 10B"
  priceChange1DMin?: string; // e.g., "Over 1%", "Over 2%"
  limit?: number; // Number of stocks to return (default 15)
}

const SCREENER_URL = "https://www.macrotrends.net/stocks/charts/AAPL/apple";

// Helper to wait for a specified time
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Scrape stock screener with filters applied
 */
export async function scrapeScreener(
  filters: ScreenerFilters = {}
): Promise<ScreenerResult> {
  const {
    marketCapMin = "Over 1B",
    priceChange1DMin = "Over 1%",
    limit = 15,
  } = filters;

  const errors: Array<{ where: string; message: string }> = [];
  let browser: Browser | null = null;

  try {
    // Detect if running in Lambda
    const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

    // Launch browser
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

    // Add Lambda-specific options
    if (isLambda) {
      launchOptions.defaultViewport = chromium.defaultViewport;
      launchOptions.executablePath = await chromium.executablePath();
    }

    browser = await puppeteer.launch(launchOptions);

    const page = await browser!.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Set user agent to avoid bot detection
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Navigate to screener
    console.log("Navigating to screener...");
    await page.goto(SCREENER_URL, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Wait for the table to load
    await page.waitForSelector("table", { timeout: 10000 });
    console.log("Page loaded, table found");

    // Apply Market Cap filter
    console.log("Applying Market Cap filter...");
    const marketCapApplied = await applyFilter(
      page,
      "Market Cap",
      marketCapMin,
      errors
    );
    if (!marketCapApplied) {
      errors.push({
        where: "applyMarketCapFilter",
        message: "Failed to apply Market Cap filter",
      });
    }

    // Wait for the filter to apply
    await delay(2000);

    // Apply Price Change 1D filter
    console.log("Applying Price Change 1D filter...");
    const priceChangeApplied = await applyFilter(
      page,
      "Price Change 1D",
      priceChange1DMin,
      errors
    );
    if (!priceChangeApplied) {
      errors.push({
        where: "applyPriceChangeFilter",
        message: "Failed to apply Price Change 1D filter",
      });
    }

    // Wait for results to update
    await delay(2000);

    // Determine if we need to sort for losers (Under filters) or gainers (Over filters)
    const isUnderFilter = priceChange1DMin.toLowerCase().startsWith("under");
    
    // Sort by % Change column
    // - For "Over" filters: click once to sort highest first (top gainers)
    // - For "Under" filters: click twice to sort lowest first (top losers)
    const sortLabel = isUnderFilter ? "lowest first (losers)" : "highest first (gainers)";
    console.log(`Sorting by % Change (${sortLabel})...`);
    const sorted = await sortByPercentChange(page, errors, isUnderFilter);
    if (!sorted) {
      errors.push({
        where: "sortByPercentChange",
        message: "Failed to sort by % Change",
      });
    }

    // Wait for sort to apply
    await delay(1500);

    // Extract stock data
    console.log("Extracting stock data...");
    const result = await extractStockData(page, limit);

    console.log(
      `Found ${result.totalMatched} total, returning ${result.stocks.length} stocks`
    );

    return {
      stocks: result.stocks,
      totalMatched: result.totalMatched,
      errors,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push({ where: "scrapeScreener", message });
    return { stocks: [], totalMatched: 0, errors };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Apply a filter by searching and selecting the option
 */
async function applyFilter(
  page: Page,
  filterName: string,
  filterValue: string,
  errors: Array<{ where: string; message: string }>
): Promise<boolean> {
  try {
    // Step 1: Find and click the filter search box
    const searchBoxSelector =
      'input[placeholder*="Search"][placeholder*="filters"]';
    await page.waitForSelector(searchBoxSelector, { timeout: 5000 });

    // Clear and type the filter name
    await page.click(searchBoxSelector, { clickCount: 3 }); // Select all
    await page.type(searchBoxSelector, filterName, { delay: 30 });

    await delay(500);

    // Step 2: Click the filter button that matches our filter name
    // We need to find a button with the exact filter name
    const filterClicked = await page.evaluate((name: string) => {
      const buttons = document.querySelectorAll("button");
      for (const btn of Array.from(buttons)) {
        const text = btn.textContent?.trim();
        if (text === name) {
          btn.click();
          return true;
        }
      }
      return false;
    }, filterName);

    if (!filterClicked) {
      // Try pressing Enter to select the first option
      await page.keyboard.press("Enter");
    }

    await delay(800);

    // Step 3: Find and click the "Any" dropdown button that appeared
    // The dropdown is in a new section that appeared after adding the filter
    const anyClicked = await page.evaluate(() => {
      // Find the most recently added filter's dropdown
      const buttons = document.querySelectorAll("button");
      for (const btn of Array.from(buttons)) {
        const text = btn.textContent?.trim();
        if (text === "Any") {
          btn.click();
          return true;
        }
      }
      return false;
    });

    if (!anyClicked) {
      errors.push({
        where: `applyFilter:${filterName}`,
        message: "Could not find 'Any' dropdown",
      });
      return false;
    }

    await delay(500);

    // Step 4: Select the filter value from the dropdown
    const valueClicked = await page.evaluate((value: string) => {
      // Look for buttons in the dropdown menu
      const buttons = document.querySelectorAll("button");
      for (const btn of Array.from(buttons)) {
        const text = btn.textContent?.trim();
        if (text === value) {
          btn.click();
          return true;
        }
      }
      return false;
    }, filterValue);

    if (!valueClicked) {
      errors.push({
        where: `applyFilter:${filterName}`,
        message: `Could not select value: ${filterValue}`,
      });
      return false;
    }

    await delay(500);

    // Clear the search box by pressing Escape
    await page.keyboard.press("Escape");

    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push({ where: `applyFilter:${filterName}`, message });
    return false;
  }
}

/**
 * Sort the table by % Change column
 * @param sortForLosers - If true, click twice to sort lowest first (for "Under" filters)
 */
async function sortByPercentChange(
  page: Page,
  errors: Array<{ where: string; message: string }>,
  sortForLosers: boolean = false
): Promise<boolean> {
  try {
    // Find and click the "% Change" column header in the table
    // The header text might be "% Change" or similar
    const clickHeader = async () => {
      return await page.evaluate(() => {
        const table = document.querySelector("table");
        if (!table) return false;

        // Look for table header cells
        const headers = table.querySelectorAll("th");
        for (const th of Array.from(headers)) {
          const text = th.textContent?.trim() || "";
          // Match "% Change" or "Change" column
          if (text.includes("% Change") || text === "% Change") {
            // Click the header to sort
            const clickable = th.querySelector("button, a, span") || th;
            (clickable as HTMLElement).click();
            return true;
          }
        }
        return false;
      });
    };

    // First click - sorts by highest first (descending)
    const firstClick = await clickHeader();
    if (!firstClick) {
      errors.push({
        where: "sortByPercentChange",
        message: "Could not find % Change column header",
      });
      return false;
    }

    // For "Under" filters, we need to click again to sort lowest first (ascending)
    if (sortForLosers) {
      await delay(1000); // Wait for first sort to complete
      console.log("Clicking again to sort lowest first...");
      const secondClick = await clickHeader();
      if (!secondClick) {
        errors.push({
          where: "sortByPercentChange",
          message: "Could not click % Change header second time",
        });
        return false;
      }
    }

    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push({ where: "sortByPercentChange", message });
    return false;
  }
}

/**
 * Extract stock data from the table
 */
async function extractStockData(
  page: Page,
  limit: number
): Promise<{ stocks: ScreenedStock[]; totalMatched: number }> {
  // Get total matched count from heading like "922 Stocks"
  const totalMatched = await page.evaluate(() => {
    const heading = document.querySelector("h2");
    if (!heading) return 0;
    const text = heading.textContent || "";
    const match = text.match(/(\d[\d,]*)\s*Stocks?/i);
    return match ? parseInt(match[1].replace(/,/g, ""), 10) : 0;
  });

  // Extract table rows - handle the specific table structure
  // The table has columns: Symbol, Company Name, Market Cap, % Change (and possibly more)
  const stocks = await page.evaluate((maxRows: number) => {
    const table = document.querySelector("table");
    if (!table) return [];

    const rows = table.querySelectorAll("tbody tr");
    const results: ScreenedStock[] = [];

    for (let i = 0; i < Math.min(rows.length, maxRows); i++) {
      const row = rows[i];
      const cells = row.querySelectorAll("td");

      if (cells.length >= 4) {
        // Extract data from cells
        // The structure based on the filtered view:
        // Cell 0: Symbol (with link)
        // Cell 1: Company Name
        // Cell 2: Market Cap
        // Cell 3: % Change (this is the last column in filtered view)
        const symbol = cells[0]?.textContent?.trim() || "";
        const companyName = cells[1]?.textContent?.trim() || "";
        const marketCap = cells[2]?.textContent?.trim() || "";
        const percentChange = cells[3]?.textContent?.trim() || "";

        if (symbol) {
          results.push({
            symbol,
            companyName,
            marketCap,
            percentChange,
          });
        }
      }
    }

    return results;
  }, limit);

  return { stocks, totalMatched };
}
