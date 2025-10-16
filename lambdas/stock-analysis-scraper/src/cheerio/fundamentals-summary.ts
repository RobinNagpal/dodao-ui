import {
  fetchHtml,
  load,
  normalizeText,
  parseNumberLike,
  makeError,
  ScrapeError,
  Html,
} from "./utils";

export interface Range {
  low: number;
  high: number;
}

export interface DividendInfo {
  amount?: number; // e.g., 4.00
  yieldPct?: string; // e.g., "3.82%" (with % symbol)
}

/** All fields optional as requested */
export interface StockStats {
  marketCap?: string; // Raw value like "26.09B"
  revenueTtm?: string; // Raw value like "3.02B"
  netIncomeTtm?: string; // Raw value like "1.16B"
  sharesOut?: string; // Raw value like "142.21M"
  epsTtm?: number; // Simple number
  peRatio?: number; // Simple number
  forwardPE?: number; // Simple number
  dividend?: DividendInfo;
  exDividendDate?: Date;
  volume?: number; // Simple number
  averageVolume?: number; // Simple number
  open?: number; // Simple number
  previousClose?: number; // Simple number
  daysRange?: Range;
  week52Range?: Range;
  beta?: number; // Simple number
  rsi?: number; // Simple number
  earningsDate?: Date;
}

export interface SummaryResult {
  financialSummary: StockStats;
  errors: ScrapeError[];
}

export async function scrapeFundamentalsSummary(
  url: string
): Promise<SummaryResult> {
  const { html, error } = await fetchHtml(url);
  if (!html)
    return {
      financialSummary: {},
      errors: [
        error ?? {
          where: "scrapeFundamentalsSummary",
          message: "Unknown fetch error",
        },
      ],
    };
  return parseFundamentalsSummary(html);
}

export function parseFundamentalsSummary(html: Html): SummaryResult {
  const $ = load(html);
  const errors: ScrapeError[] = [];
  const stats: StockStats = {};

  // Generic handlers by label
  const handlers: Record<string, (v: string) => void> = {
    "Market Cap": (v) => (stats.marketCap = v), // Keep raw value like "26.09B"
    "Revenue (ttm)": (v) => (stats.revenueTtm = v), // Keep raw value like "3.02B"
    "Net Income (ttm)": (v) => (stats.netIncomeTtm = v), // Keep raw value like "1.16B"
    "Shares Out": (v) => (stats.sharesOut = v), // Keep raw value like "142.21M"
    "EPS (ttm)": (v) => (stats.epsTtm = parseNumberLike(v)),
    "PE Ratio": (v) => (stats.peRatio = parseNumberLike(v)),
    "Forward PE": (v) => (stats.forwardPE = parseNumberLike(v)),
    Dividend: (v) => {
      const mAmt = v.match(/^(-?\d+(?:\.\d+)?)/);
      const mY = v.match(/\(([-+]?\d+(?:\.\d+)?)%\)/);
      stats.dividend = {
        amount: mAmt ? Number(mAmt[1]) : undefined,
        yieldPct: mY ? `${mY[1]}%` : undefined, // Keep % symbol
      };
    },
    "Ex-Dividend Date": (v) => {
      const d = new Date(v.trim());
      if (!Number.isNaN(d.getTime())) stats.exDividendDate = d;
    },
    Volume: (v) => (stats.volume = parseNumberLike(v)),
    "Average Volume": (v) => (stats.averageVolume = parseNumberLike(v)),
    Open: (v) => (stats.open = parseNumberLike(v)),
    "Previous Close": (v) => (stats.previousClose = parseNumberLike(v)),
    "Day's Range": (v) => {
      const [lo, hi] = v.split("-").map((s) => parseNumberLike(s));
      if (lo != null && hi != null) stats.daysRange = { low: lo, high: hi };
    },
    "52-Week Range": (v) => {
      const [lo, hi] = v.split("-").map((s) => parseNumberLike(s));
      if (lo != null && hi != null) stats.week52Range = { low: lo, high: hi };
    },
    Beta: (v) => (stats.beta = parseNumberLike(v)),
    RSI: (v) => (stats.rsi = parseNumberLike(v)),
    "Earnings Date": (v) => {
      const d = new Date(v.trim());
      if (!Number.isNaN(d.getTime())) stats.earningsDate = d;
    },
  };

  // Traverse two-column label/value rows
  try {
    $("tr").each((_, tr) => {
      const tds = $(tr).find("td");
      if (tds.length < 2) return;
      const label = normalizeText($(tds[0]).text());
      const value = normalizeText($(tds[1]).text());
      const handler = handlers[label];
      if (handler) handler(value);
    });
  } catch (err) {
    errors.push(makeError("parseFundamentalsSummary", err));
  }

  return { financialSummary: stats, errors };
}
