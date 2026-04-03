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

export interface EtfStats {
  // Left column fields
  assets?: string; // e.g., "$190.08M", "$321.56M"
  expenseRatio?: string; // e.g., "0.60%", "0.41%"
  peRatio?: number; // e.g., 26.17, 19.19
  sharesOut?: string; // e.g., "1.13M", "8.13M"
  dividendTtm?: number; // e.g., 2.95, 0.87
  dividendYield?: string; // e.g., "1.76%", "2.28%"
  /** As shown on the site (e.g. "Mar 24, 2026") — not parsed to Date to avoid TZ shifts in JSON */
  exDividendDate?: string;
  payoutFrequency?: string; // e.g., "Quarterly", "Annual"
  payoutRatio?: string; // e.g., "45.94%", "43.72%"

  // Right column fields
  volume?: number; // e.g., 24577, 30812
  open?: number; // e.g., 163.14, 38.84
  previousClose?: number; // e.g., 167.72, 37.91
  daysRange?: Range; // e.g., 162.72 - 168.10
  week52Low?: number; // e.g., 97.44, 23.56
  week52High?: number; // e.g., 191.80, 41.03
  beta?: number; // e.g., 2.00, 0.58
  holdings?: number; // e.g., 511, 37
  /** As shown on the site (e.g. "May 28, 2014") — not parsed to Date to avoid TZ shifts in JSON */
  inceptionDate?: string;

  // Price info (from page header, not table)
  currentPrice?: number;
  priceChange?: number;
  priceChangePercent?: string;
}

export interface EtfSummaryResult {
  etfSummary: EtfStats;
  errors: ScrapeError[];
}

export async function scrapeEtfFundamentalsSummary(
  url: string
): Promise<EtfSummaryResult> {
  const { html, error } = await fetchHtml(url);
  if (!html)
    return {
      etfSummary: {},
      errors: [
        error ?? {
          where: "scrapeEtfFundamentalsSummary",
          message: "Unknown fetch error",
        },
      ],
    };
  return parseEtfFundamentalsSummary(html);
}

export function parseEtfFundamentalsSummary(html: Html): EtfSummaryResult {
  const $ = load(html);
  const errors: ScrapeError[] = [];
  const stats: EtfStats = {};

  const handlers: Record<string, (v: string) => void> = {
    Assets: (v) => (stats.assets = v),
    "Expense Ratio": (v) => (stats.expenseRatio = v),
    "PE Ratio": (v) => (stats.peRatio = parseNumberLike(v)),
    "Shares Out": (v) => (stats.sharesOut = v),
    "Dividend (ttm)": (v) => {
      const cleaned = v.replace(/^\$/, "").trim();
      stats.dividendTtm = parseNumberLike(cleaned);
    },
    "Dividend Yield": (v) => (stats.dividendYield = v),
    "Ex-Dividend Date": (v) => (stats.exDividendDate = v),
    "Payout Frequency": (v) => (stats.payoutFrequency = v),
    "Payout Ratio": (v) => (stats.payoutRatio = v),

    Volume: (v) => (stats.volume = parseNumberLike(v)),
    Open: (v) => (stats.open = parseNumberLike(v)),
    "Previous Close": (v) => (stats.previousClose = parseNumberLike(v)),
    "Day's Range": (v) => {
      const [lo, hi] = v.split("-").map((s) => parseNumberLike(s));
      if (lo != null && hi != null) stats.daysRange = { low: lo, high: hi };
    },
    "52-Week Low": (v) => (stats.week52Low = parseNumberLike(v)),
    "52-Week High": (v) => (stats.week52High = parseNumberLike(v)),
    Beta: (v) => (stats.beta = parseNumberLike(v)),
    Holdings: (v) => (stats.holdings = parseNumberLike(v)),
    "Inception Date": (v) => (stats.inceptionDate = v),
  };

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
    errors.push(makeError("parseEtfFundamentalsSummary:table", err));
  }

  try {
    const priceText = $('[data-test="price"]').text().trim();
    if (priceText) {
      stats.currentPrice = parseNumberLike(priceText);
    }

    const changeText = $('[data-test="change"]').text().trim();
    if (changeText) {
      const match = changeText.match(/^([+-]?\d+\.?\d*)\s*\(([+-]?\d+\.?\d*)%\)/);
      if (match) {
        stats.priceChange = parseNumberLike(match[1]);
        stats.priceChangePercent = `${match[2]}%`;
      } else {
        stats.priceChange = parseNumberLike(changeText);
      }
    }
  } catch (err) {
    errors.push(makeError("parseEtfFundamentalsSummary:price", err));
  }

  return { etfSummary: stats, errors };
}
