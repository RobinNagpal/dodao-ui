import {
  fetchHtml,
  load,
  normalizeText,
  parseNumberLike,
  parseAbbrevNumber,
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
  yieldPct?: number; // e.g., 0.90 means 0.90%
}

/** All fields optional as requested */
export interface StockStats {
  marketCap?: number;
  revenueTtm?: number;
  netIncomeTtm?: number;
  sharesOut?: number;
  epsTtm?: number;
  peRatio?: number;
  forwardPE?: number;
  dividend?: DividendInfo;
  exDividendDate?: Date;
  volume?: number;
  averageVolume?: number;
  open?: number;
  previousClose?: number;
  daysRange?: Range;
  week52Range?: Range;
  beta?: number;
  rsi?: number;
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
    "Market Cap": (v) => (stats.marketCap = parseAbbrevNumber(v)),
    "Revenue (ttm)": (v) => (stats.revenueTtm = parseAbbrevNumber(v)),
    "Net Income (ttm)": (v) => (stats.netIncomeTtm = parseAbbrevNumber(v)),
    "Shares Out": (v) => (stats.sharesOut = parseAbbrevNumber(v)),
    "EPS (ttm)": (v) => (stats.epsTtm = parseNumberLike(v)),
    "PE Ratio": (v) => (stats.peRatio = parseNumberLike(v)),
    "Forward PE": (v) => (stats.forwardPE = parseNumberLike(v)),
    Dividend: (v) => {
      const mAmt = v.match(/^(-?\d+(?:\.\d+)?)/);
      const mY = v.match(/\(([-+]?\d+(?:\.\d+)?)%\)/);
      stats.dividend = {
        amount: mAmt ? Number(mAmt[1]) : undefined,
        yieldPct: mY ? Number(mY[1]) : undefined,
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
