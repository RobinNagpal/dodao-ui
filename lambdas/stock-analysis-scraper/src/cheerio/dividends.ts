// cheerio/dividends.ts
import {
  fetchHtml,
  load,
  normalizeText,
  parseNumberLike,
  parsePercent,
  makeError,
  ScrapeError,
  Html,
} from "./utils";
import * as cheerio from "cheerio";

/** Meta inferred from the page (e.g., header "Currency is PKR") */
export interface DividendMeta {
  currency?: string; // e.g., "PKR"
}

export type PayoutFrequency =
  | "Monthly"
  | "Quarterly"
  | "Semi-Annual"
  | "Semiannual"
  | "Annual"
  | string;

export interface DividendSummary {
  annualDividend?: number; // 15.05
  yieldPct?: number; // 5.63   (percent, not fraction)
  exDividendDate?: Date; // next ex-date if present
  payoutFrequency?: PayoutFrequency;
  payoutRatioPct?: number; // 59.58
  dividendGrowth1Y?: number; // 4.78
  currency?: string; // Redundant convenience (mirrors meta.currency if seen with the amount line)
}

export interface DividendHistoryRow {
  exDividendDate?: Date;
  amount?: number;
  currency?: string; // e.g., "PKR" if present beside amount
  recordDate?: Date;
  payDate?: Date;
}

export interface DividendsResult {
  dividends: {
    meta: DividendMeta;
    summary: DividendSummary;
    history: DividendHistoryRow[];
  };
  errors: ScrapeError[];
}

/** Public: fetch and parse the dividends page */
export async function scrapeDividends(url: string): Promise<DividendsResult> {
  const { html, error } = await fetchHtml(url);
  if (!html) {
    return {
      dividends: { meta: {}, summary: {}, history: [] },
      errors: [
        error ?? { where: "scrapeDividends", message: "Unknown fetch error" },
      ],
    };
  }
  return parseDividends(html);
}

/** Parse a numeric + optional currency like "5.000 PKR" */
function parseAmountWithCurrency(raw: string): {
  amount?: number;
  currency?: string;
} {
  const s = normalizeText(raw);
  // Match "5.000 PKR" or "5 PKR" or "5.00"
  const m = s.match(/(-?\d+(?:\.\d+)?)(?:\s*([A-Za-z]{3}))?/);
  if (!m) return {};
  const amount = parseNumberLike(m[1]);
  const currency = m[2]?.toUpperCase();
  return { amount, currency };
}

/** Read "Currency is PKR" from the header blurb if present */
function extractMetaCurrency($: cheerio.CheerioAPI): string | undefined {
  try {
    // Look for literal "Currency is XXX"
    const t = $("body").text();
    const m = t.match(/Currency is\s+([A-Z]{3})/i);
    if (m) return m[1].toUpperCase();
  } catch {
    /* noop */
  }
  return undefined;
}

/** Implementation: parse the HTML */
export function parseDividends(html: Html): DividendsResult {
  const $ = load(html);
  const errors: ScrapeError[] = [];
  const meta: DividendMeta = { currency: extractMetaCurrency($) };
  const summary: DividendSummary = {};
  const history: DividendHistoryRow[] = [];

  // ---------- Summary grid (labels on top, values in inner div) ----------
  try {
    // Grid blocks like:
    // <div>Dividend Yield <div>5.63%</div></div>
    // <div>Annual Dividend <div>15.05 PKR</div></div>
    // ...
    const blocks = $("main .grid div, main .grid > div");
    blocks.each((_, el) => {
      const $el = $(el);
      const label = normalizeText($el.clone().children().remove().end().text()); // text before inner value div
      const value =
        normalizeText($el.find("div").first().text()) ||
        normalizeText($el.contents().last().text());
      if (!label || !value) return;

      switch (true) {
        case /^dividend\s+yield$/i.test(label): {
          const n = parsePercent(value);
          if (n != null) summary.yieldPct = n;
          break;
        }
        case /^annual\s+dividend$/i.test(label): {
          const { amount, currency } = parseAmountWithCurrency(value);
          if (amount != null) summary.annualDividend = amount;
          if (currency) {
            summary.currency = currency;
            if (!meta.currency) meta.currency = currency;
          }
          break;
        }
        case /^ex-?dividend\s+date$/i.test(label): {
          const d = new Date(value);
          if (!Number.isNaN(d.getTime())) summary.exDividendDate = d;
          break;
        }
        case /^payout\s+frequency$/i.test(label): {
          summary.payoutFrequency = value;
          break;
        }
        case /^payout\s+ratio$/i.test(label): {
          const n = parsePercent(value);
          if (n != null) summary.payoutRatioPct = n;
          break;
        }
        case /^dividend\s+growth/i.test(label): {
          const n = parsePercent(value);
          if (n != null) summary.dividendGrowth1Y = n;
          break;
        }
        default:
          // ignore
          break;
      }
    });
  } catch (err) {
    errors.push(makeError("parseDividends.summary", err));
  }

  // ---------- Dividend history table ----------
  try {
    // Find a table that contains an "Ex-Div" or "Ex-Dividend Date" column
    const tables = $("table");
    let table: cheerio.Cheerio<any> | null = null;

    tables.each((_, t) => {
      const hasEx = $(t)
        .find("thead th")
        .toArray()
        .some(
          (th) =>
            /Ex-?Div/i.test(normalizeText($(th).text())) ||
            /Ex-?Dividend Date/i.test(normalizeText($(th).text()))
        );
      if (hasEx && !table) table = $(t);
    });

    if (table) {
      (table as cheerio.Cheerio<any>).find("tbody tr").each((_, tr) => {
        const tds = $(tr).find("td");
        if (!tds.length) return;

        const exDateStr = normalizeText($(tds[0]).text());
        const amountStr = normalizeText($(tds[1]).text());
        const recordStr = normalizeText($(tds[2])?.text() ?? "");
        const payStr = normalizeText($(tds[3])?.text() ?? "");

        const row: DividendHistoryRow = {};
        const ex = new Date(exDateStr);
        if (!Number.isNaN(ex.getTime())) row.exDividendDate = ex;

        const { amount, currency } = parseAmountWithCurrency(amountStr);
        if (amount != null) row.amount = amount;
        if (currency) row.currency = currency;

        if (recordStr) {
          const rd = new Date(recordStr);
          if (!Number.isNaN(rd.getTime())) row.recordDate = rd;
        }
        if (payStr) {
          const pd = new Date(payStr);
          if (!Number.isNaN(pd.getTime())) row.payDate = pd;
        }

        // Only push meaningful rows
        if (row.exDividendDate || row.amount != null) history.push(row);
      });
    } else {
      errors.push({
        where: "parseDividends.history",
        message: "Dividend history table not found",
      });
    }
  } catch (err) {
    errors.push(makeError("parseDividends.history", err));
  }

  return {
    dividends: { meta, summary, history },
    errors,
  };
}
