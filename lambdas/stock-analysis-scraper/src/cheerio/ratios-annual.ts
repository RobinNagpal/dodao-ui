import {
  fetchHtml,
  load,
  normalizeText,
  cellText,
  makeError,
  ScrapeError,
  Html,
  toLowerCamelKey,
  extractFinancialsMeta,
  unitMultiplier,
  parseValueWithUnit,
} from "./utils";
import * as cheerio from "cheerio";

export type Unit = "ones" | "thousands" | "millions" | "billions";

export interface RatiosMeta {
  currency?: string; // e.g. "PKR"
  unit?: Unit; // e.g. "millions"  (applies to monetary rows like Market Cap / EV)
  fiscalYearNote?: string;
}

export interface RatiosPeriodRaw {
  fiscalYear: string;
  periodEnd?: string;
  values: Record<string, number | null>; // ORIGINAL label -> numeric or null
}

export interface RatiosAnnualResult<TValues = Record<string, number | null>> {
  ratiosAnnual: {
    meta: RatiosMeta;
    periods: Array<{
      fiscalYear: string;
      periodEnd?: string;
      values: TValues;
    }>;
  };
  errors: ScrapeError[];
}

/* ───────────────────── RAW (unchanged labels) ───────────────────── */

export async function scrapeRatiosAnnualRaw(
  url: string
): Promise<RatiosAnnualResult<Record<string, number | null>>> {
  const { html, error } = await fetchHtml(url);
  if (!html) {
    return {
      ratiosAnnual: { meta: {}, periods: [] },
      errors: [
        error ?? {
          where: "scrapeRatiosAnnualRaw",
          message: "Unknown fetch error",
        },
      ],
    };
  }
  return parseRatiosAnnualRaw(html);
}

export function parseRatiosAnnualRaw(
  html: Html
): RatiosAnnualResult<Record<string, number | null>> {
  const $ = load(html);
  const errors: ScrapeError[] = [];

  const meta = extractFinancialsMeta($); // reads blurb like “Millions PKR. Fiscal year is …”
  const mult = unitMultiplier(meta.unit);

  const table = $("#main-table");
  if (table.length === 0) {
    return {
      ratiosAnnual: { meta, periods: [] },
      errors: [
        { where: "parseRatiosAnnualRaw", message: "#main-table not found" },
      ],
    };
  }

  const headerRows = table.find("thead tr");
  if (headerRows.length < 2) {
    return {
      ratiosAnnual: { meta, periods: [] },
      errors: [{ where: "parseRatiosAnnualRaw", message: "thead not found" }],
    };
  }

  // Row 0 has "Current" and FY headers like "FY 2025"…; row 1 has period-ending dates.
  const fyRow = headerRows.eq(0).find("th");
  const peRow = headerRows.eq(1).find("th");

  interface ColInfo {
    idx: number;
    fiscalYear: string;
    periodEnd?: string;
  }
  const cols: ColInfo[] = [];
  fyRow.each((i, th) => {
    if (i === 0) return; // first col is row label
    const text = normalizeText($(th).text());
    // Keep only explicit FY columns; skip "Current" and "2016 - 2020" buckets
    if (
      (/^FY\s*'?(\d{2}|\d{4})$/i.test(text) || /^\d{4}$/.test(text)) &&
      !text.includes("-")
    ) {
      const periodEnd = peRow.eq(i).text()
        ? normalizeText(peRow.eq(i).text())
        : undefined;
      cols.push({ idx: i, fiscalYear: text, periodEnd });
    }
  });

  if (cols.length === 0) {
    errors.push({
      where: "parseRatiosAnnualRaw",
      message: "No fiscal-year columns detected",
    });
  }

  const periods: RatiosPeriodRaw[] = cols.map((c) => ({
    fiscalYear: c.fiscalYear,
    periodEnd: c.periodEnd,
    values: {},
  }));

  try {
    table.find("tbody tr").each((_, tr) => {
      const $tr = $(tr);
      const tds = $tr.find("td");
      if (tds.length < 2) return;

      const rowLabel = normalizeText(cellText(tds.eq(0), $).trim());
      if (!rowLabel) return;

      cols.forEach((c, colIdx) => {
        const cell = tds.eq(c.idx);
        if (!cell || cell.length === 0) return;

        const text = normalizeText(cell.text());
        if (!text || /^upgrade$/i.test(text)) {
          periods[colIdx].values[rowLabel] = null;
          return;
        }

        // Use the same smart parser that:
        //  - returns % as numeric (no multiplier),
        //  - applies unit multiplier only to monetary rows (e.g., Market Cap / EV),
        //  - leaves pure ratios (e.g., current ratio) as-is.
        const val = parseValueWithUnit(text, rowLabel, mult);
        periods[colIdx].values[rowLabel] = val;
      });
    });
  } catch (err) {
    errors.push(makeError("parseRatiosAnnualRaw.rows", err));
  }

  return { ratiosAnnual: { meta, periods }, errors };
}

/* ───────────── NORMALIZED (lowerCamelCase keys) ───────────── */

export async function scrapeRatiosAnnual(
  url: string
): Promise<RatiosAnnualResult<Record<string, number | null>>> {
  const raw = await scrapeRatiosAnnualRaw(url);
  return transformRatioKeysToLowerCamel(raw);
}

function transformRatioKeysToLowerCamel(
  raw: RatiosAnnualResult<Record<string, number | null>>
): RatiosAnnualResult<Record<string, number | null>> {
  const { ratiosAnnual, errors } = raw;
  const out = ratiosAnnual.periods.map((p) => {
    const next: Record<string, number | null> = {};
    for (const [label, value] of Object.entries(p.values)) {
      const key = toLowerCamelKey(label);
      if (!key) continue;
      if (!(key in next) || next[key] == null) next[key] = value;
    }
    return { fiscalYear: p.fiscalYear, periodEnd: p.periodEnd, values: next };
  });

  return { ratiosAnnual: { meta: ratiosAnnual.meta, periods: out }, errors };
}

/* ───────────── STRICT (allow-listed lowerCamelCase keys) ───────────── */

export interface RatiosAnnualStrictValues {
  // Valuation
  marketCapitalization?: number | null;
  marketCapGrowth?: number | null; // %
  enterpriseValue?: number | null;
  lastClosePrice?: number | null;

  // Price multiples
  peRatio?: number | null;
  priceToSales?: number | null;
  priceToBook?: number | null;
  priceToFreeCashFlow?: number | null;
  enterpriseValueToEbitda?: number | null;
  evToRevenue?: number | null;
  evToEbit?: number | null;
  pegRatio?: number | null;

  // Profitability
  grossMargin?: number | null; // %
  operatingMargin?: number | null; // %
  profitMargin?: number | null; // %
  ebitdaMargin?: number | null; // %
  freeCashFlowMargin?: number | null; // %

  returnOnAssets?: number | null; // %
  returnOnEquity?: number | null; // %
  returnOnCapital?: number | null; // %

  // Efficiency
  assetTurnover?: number | null;
  inventoryTurnover?: number | null;
  receivablesTurnover?: number | null;
  daysSalesOutstanding?: number | null;
  daysInventoryOutstanding?: number | null;
  daysPayablesOutstanding?: number | null;
  cashConversionCycle?: number | null;

  // Liquidity & leverage
  currentRatio?: number | null;
  quickRatio?: number | null;
  debtToEquity?: number | null;
  debtToAssets?: number | null;
  interestCoverage?: number | null;

  // Dividends
  dividendYield?: number | null; // %
  payoutRatio?: number | null; // %
}

const RATIOS_ANNUAL_KEYS = [
  "marketCapitalization",
  "marketCapGrowth",
  "enterpriseValue",
  "lastClosePrice",

  "peRatio",
  "priceToSales",
  "priceToBook",
  "priceToFreeCashFlow",
  "enterpriseValueToEbitda",
  "evToRevenue",
  "evToEbit",
  "pegRatio",

  "grossMargin",
  "operatingMargin",
  "profitMargin",
  "ebitdaMargin",
  "freeCashFlowMargin",

  "returnOnAssets",
  "returnOnEquity",
  "returnOnCapital",

  "assetTurnover",
  "inventoryTurnover",
  "receivablesTurnover",
  "daysSalesOutstanding",
  "daysInventoryOutstanding",
  "daysPayablesOutstanding",
  "cashConversionCycle",

  "currentRatio",
  "quickRatio",
  "debtToEquity",
  "debtToAssets",
  "interestCoverage",

  "dividendYield",
  "payoutRatio",
] as const;
type RatiosAnnualKey = (typeof RATIOS_ANNUAL_KEYS)[number];
function isRatiosAnnualKey(k: string): k is RatiosAnnualKey {
  return (RATIOS_ANNUAL_KEYS as readonly string[]).includes(k);
}

export async function scrapeRatiosAnnualStrict(
  url: string
): Promise<RatiosAnnualResult<RatiosAnnualStrictValues>> {
  const normalized = await scrapeRatiosAnnual(url); // build strict off normalized lowerCamel keys
  return toStrictRatiosAnnual(normalized);
}

function toStrictRatiosAnnual(
  normalized: RatiosAnnualResult<Record<string, number | null>>
): RatiosAnnualResult<RatiosAnnualStrictValues> {
  const { ratiosAnnual, errors } = normalized;

  const periods = ratiosAnnual.periods.map((p) => {
    const strictVals: RatiosAnnualStrictValues = {};
    for (const [k, v] of Object.entries(p.values)) {
      if (isRatiosAnnualKey(k)) {
        if (!(k in strictVals) || strictVals[k] == null) strictVals[k] = v;
      }
    }
    return {
      fiscalYear: p.fiscalYear,
      periodEnd: p.periodEnd,
      values: strictVals,
    };
  });

  return { ratiosAnnual: { meta: ratiosAnnual.meta, periods }, errors };
}
