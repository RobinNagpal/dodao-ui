// tsconfig target: ES2020 or newer
// npm i axios cheerio

import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";

/** Numeric range like "445.11 - 463.49" */
export interface Range {
  low: number;
  high: number;
}

/** Dividend value like "4.00 (0.90%)" */
export interface DividendInfo {
  amount: number; // e.g., 4.00
  yield: number; // percentage as a number, e.g., 0.90
}

/** All fields are optional as requested */
export interface StockStats {
  marketCap?: number; // 660.54B => 660540000000
  revenueTtm?: number; // 449.63B
  netIncomeTtm?: number; // 76.96B
  sharesOut?: number; // 1.47B
  epsTtm?: number; // 52.53
  peRatio?: number; // 8.58
  forwardPE?: number; // 7.51
  dividend?: DividendInfo; // 4.00 (0.90%)
  exDividendDate?: Date; // Sep 17, 2025
  volume?: number; // 1,481,644
  averageVolume?: number; // 1,411,892
  open?: number; // 445.11
  previousClose?: number; // 443.95
  daysRange?: Range; // 445.11 - 463.49
  week52Range?: Range; // 165.40 - 494.50
  beta?: number; // 0.42
  rsi?: number; // 44.61
  earningsDate?: Date; // Oct 29, 2025
}

/** Wrapper that returns stats plus non-fatal parsing errors */
export interface ParseResult {
  stats: StockStats;
  errors: string[];
}

/** Fetches HTML and parses the stats */
export async function scrapeStatsFromUrl(
  url: string,
  timeoutMs: number = 15000
): Promise<ParseResult> {
  try {
    const resp: AxiosResponse<string> = await axios.get(url, {
      timeout: timeoutMs,
      responseType: "text",
    });
    const html: string = resp.data;
    return parseStatsFromHtml(html);
  } catch (err) {
    // Hard failure fetching the page
    const message = err instanceof Error ? err.message : String(err);
    return { stats: {}, errors: [`Request failed: ${message}`] };
  }
}

/** Parses the HTML into structured stats. Non-fatal issues are collected in errors[]. */
export function parseStatsFromHtml(html: string): ParseResult {
  const $ = cheerio.load(html);
  const stats: StockStats = {};
  const errors: string[] = [];

  // Map label -> handler
  const handlers: Record<string, (raw: string) => void> = {
    "Market Cap": (v) => (stats.marketCap = parseAbbrevNumber(v)),
    "Revenue (ttm)": (v) => (stats.revenueTtm = parseAbbrevNumber(v)),
    "Net Income (ttm)": (v) => (stats.netIncomeTtm = parseAbbrevNumber(v)),
    "Shares Out": (v) => (stats.sharesOut = parseAbbrevNumber(v)),
    "EPS (ttm)": (v) => (stats.epsTtm = parseNumber(v)),
    "PE Ratio": (v) => (stats.peRatio = parseNumber(v)),
    "Forward PE": (v) => (stats.forwardPE = parseNumber(v)),
    Dividend: (v) => (stats.dividend = parseDividend(v)),
    "Ex-Dividend Date": (v) => (stats.exDividendDate = parseDate(v)),
    Volume: (v) => (stats.volume = parseInteger(v)),
    "Average Volume": (v) => (stats.averageVolume = parseInteger(v)),
    Open: (v) => (stats.open = parseNumber(v)),
    "Previous Close": (v) => (stats.previousClose = parseNumber(v)),
    "Day's Range": (v) => (stats.daysRange = parseRange(v)),
    "52-Week Range": (v) => (stats.week52Range = parseRange(v)),
    Beta: (v) => (stats.beta = parseNumber(v)),
    RSI: (v) => (stats.rsi = parseNumber(v)),
    "Earnings Date": (v) => (stats.earningsDate = parseDate(v)),
  };

  // Find rows that look like label/value pairs.
  // The uploaded page places these in two adjacent tables, each with <tr><td>Label</td><td>Value</td></tr>
  $("tr").each((_, el) => {
    try {
      const $row = $(el);
      const $cells = $row.find("td");
      if ($cells.length < 2) return;

      const labelRaw: string = normalizeText($cells.eq(0).text());
      const valueRaw: string = normalizeText($cells.eq(1).text());
      if (!labelRaw || !valueRaw) return;

      // Some labels are inside <a> tags; normalize to exact keys used above.
      const labelKey: string = normalizeLabel(labelRaw);

      const handler = handlers[labelKey];
      if (handler) {
        handler(valueRaw);
      }
    } catch (rowErr) {
      const message = rowErr instanceof Error ? rowErr.message : String(rowErr);
      errors.push(`Row parse error: ${message}`);
    }
  });

  // Validate & record soft errors (optional fields left undefined are OK)
  // (Example validation: if a composite like dividend exists but is partial, we note it.)
  if (
    stats.dividend &&
    (Number.isNaN(stats.dividend.amount) || Number.isNaN(stats.dividend.yield))
  ) {
    errors.push("Dividend field parsed partially or contained NaN.");
  }
  if (
    stats.daysRange &&
    (Number.isNaN(stats.daysRange.low) || Number.isNaN(stats.daysRange.high))
  ) {
    errors.push("Day's Range parsed partially or contained NaN.");
  }
  if (
    stats.week52Range &&
    (Number.isNaN(stats.week52Range.low) ||
      Number.isNaN(stats.week52Range.high))
  ) {
    errors.push("52-Week Range parsed partially or contained NaN.");
  }

  return { stats, errors };
}

/* ----------------------- helpers ----------------------- */

function normalizeText(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/** Map minor label variations to our canonical keys */
function normalizeLabel(label: string): string {
  // The page uses these exact labels; keep a conservative mapping.
  // If you need to be looser, add more cases with regexes here.
  const map: Record<string, string> = {
    "Market Cap": "Market Cap",
    "Revenue (ttm)": "Revenue (ttm)",
    "Net Income (ttm)": "Net Income (ttm)",
    "Shares Out": "Shares Out",
    "EPS (ttm)": "EPS (ttm)",
    "PE Ratio": "PE Ratio",
    "Forward PE": "Forward PE",
    Dividend: "Dividend",
    "Ex-Dividend Date": "Ex-Dividend Date",
    Volume: "Volume",
    "Average Volume": "Average Volume",
    Open: "Open",
    "Previous Close": "Previous Close",
    "Day's Range": "Day's Range",
    "52-Week Range": "52-Week Range",
    Beta: "Beta",
    RSI: "RSI",
    "Earnings Date": "Earnings Date",
  };
  return map[label] ?? label;
}

/** Parses numbers with suffixes like 1.47B / 660.54B / 12.3M / 9.2K */
function parseAbbrevNumber(raw: string): number | undefined {
  const s = raw.replace(/,/g, "").trim();
  const match = /^(-?\d+(?:\.\d+)?)([KMBT])?$/i.exec(s);
  if (!match) return undefined;

  const value = parseFloat(match[1]);
  if (Number.isNaN(value)) return undefined;

  const unit = (match[2] || "").toUpperCase();
  const multipliers: Record<string, number> = {
    K: 1e3,
    M: 1e6,
    B: 1e9,
    T: 1e12,
  };
  return unit ? value * multipliers[unit] : value;
}

/** Parses plain numbers that may contain thousands separators */
function parseNumber(raw: string): number | undefined {
  const s = raw.replace(/,/g, "").trim();
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

/** Integer version (e.g., Volume, Average Volume) */
function parseInteger(raw: string): number | undefined {
  const s = raw.replace(/,/g, "").trim();
  if (!/^-?\d+(\.\d+)?$/.test(s)) return undefined;
  const n = Math.round(Number(s));
  return Number.isFinite(n) ? n : undefined;
}

/** Parses "X - Y" numeric ranges */
function parseRange(raw: string): Range | undefined {
  const s = raw.replace(/\s+/g, " ").trim();
  const parts = s.split("-").map((p) => p.trim());
  if (parts.length !== 2) return undefined;
  const low = parseNumber(parts[0]);
  const high = parseNumber(parts[1]);
  if (low == null || high == null) return undefined;
  return { low, high };
}

/** Parses "4.00 (0.90%)" into { amount: 4, yield: 0.9 } */
function parseDividend(raw: string): DividendInfo | undefined {
  const s = raw.trim();
  // amount
  const amountMatch = /^(-?\d+(?:\.\d+)?)/.exec(s);
  if (!amountMatch) return undefined;
  const amount = parseFloat(amountMatch[1]);

  // yield
  const yieldMatch = /\(([-+]?\d+(?:\.\d+)?)%\)/.exec(s);
  const pct = yieldMatch ? parseFloat(yieldMatch[1]) : undefined;

  if (!Number.isFinite(amount)) return undefined;
  if (pct == null || !Number.isFinite(pct)) {
    // It's valid to have amount only; return amount and omit yield
    return { amount, yield: NaN };
  }
  return { amount, yield: pct };
}

/** Parses "Sep 17, 2025" safely; returns undefined when invalid */
function parseDate(raw: string): Date | undefined {
  const s = raw.trim();
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/* ----------------------- example usage ----------------------- */

// (async () => {
//   const { stats, errors } = await scrapeStatsFromUrl("https://stockanalysis.com/quote/psx/LUCK/");
//   console.log({ stats, errors });
// })();
