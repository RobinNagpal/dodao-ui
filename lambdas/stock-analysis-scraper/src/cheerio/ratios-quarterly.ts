import {
  fetchHtml,
  load,
  normalizeText,
  cellText,
  makeError,
  ScrapeError,
  Html,
  toLowerCamelKey,
  extractRatiosMeta,
  unitMultiplier,
  parseValueRaw,
} from "./utils";
import * as cheerio from "cheerio";

export type Unit = "ones" | "thousands" | "millions" | "billions";

export interface RatiosMeta {
  currency?: string; // e.g. "PKR"
  unit?: Unit; // e.g. "millions" (applies to monetary rows like Market Cap / EV)
  fiscalYearNote?: string;
}

export interface RatiosQuarter {
  fiscalQuarter: string; // e.g. "Current", "Q4 2025"
  periodEnd?: string; // e.g. "Oct 9, 2025", "Jun 30, 2025"
}

export interface RatiosQuarterlyResult<
  TValues = Record<string, string | number | null>
> {
  ratiosQuarterly: {
    meta: RatiosMeta;
    periods: Array<RatiosQuarter & { values: TValues }>;
  };
  errors: ScrapeError[];
}

/* ───────────────────── RAW (unchanged labels) ───────────────────── */

export async function scrapeRatiosQuarterlyRaw(
  url: string
): Promise<RatiosQuarterlyResult<Record<string, string | number | null>>> {
  const { html, error } = await fetchHtml(url);
  if (!html) {
    return {
      ratiosQuarterly: { meta: {}, periods: [] },
      errors: [
        error ?? {
          where: "scrapeRatiosQuarterlyRaw",
          message: "Unknown fetch error",
        },
      ],
    };
  }
  return parseRatiosQuarterlyRaw(html);
}

function cleanPeriodEnd(raw?: string): string | undefined {
  if (!raw) return raw;
  // Match full date like "Dec 31, 2024"
  const full = raw.match(
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}\b/
  );
  if (full) return full[0];
  // fallback: just remove short year prefix like "Dec '24"
  return raw.replace(/^[A-Za-z]{3}\s*'?\d{2}\s*/, "").trim();
}

export function parseRatiosQuarterlyRaw(
  html: Html
): RatiosQuarterlyResult<Record<string, string | number | null>> {
  const $ = load(html);
  const errors: ScrapeError[] = [];

  const meta = extractRatiosMeta($); // e.g., "Market cap in millions PKR. Fiscal year is July - June."
  const mult = unitMultiplier(meta.unit);

  const table = $("#main-table");
  if (table.length === 0) {
    return {
      ratiosQuarterly: { meta, periods: [] },
      errors: [
        { where: "parseRatiosQuarterlyRaw", message: "#main-table not found" },
      ],
    };
  }

  const headerRows = table.find("thead tr");
  if (headerRows.length < 2) {
    return {
      ratiosQuarterly: { meta, periods: [] },
      errors: [
        { where: "parseRatiosQuarterlyRaw", message: "thead not found" },
      ],
    };
  }

  // Row 0 has "Current" and quarter headers like "Q4 2025"; row 1 has period-ending dates.
  const qRow = headerRows.eq(0).find("th");
  const peRow = headerRows.eq(1).find("th");

  interface ColInfo {
    idx: number;
    fiscalQuarter: string;
    periodEnd?: string;
  }

  const cols: ColInfo[] = [];
  qRow.each((i, th) => {
    if (i === 0) return; // first column is the row label
    const text = normalizeText($(th).text());
    // keep "Current" and "Q# YYYY", skip "+20 Quarters" column and any buckets
    const isCurrent = /^current$/i.test(text);
    const isQuarter = /^Q[1-4]\s+\d{4}$/.test(text);
    const isMoreQuarters = /\+\d+\s+quarters/i.test(text);

    if ((isCurrent || isQuarter) && !isMoreQuarters) {
      const rawPe = peRow.eq(i).text()
        ? normalizeText(peRow.eq(i).text())
        : undefined;
      const periodEnd = cleanPeriodEnd(rawPe);
      cols.push({ idx: i, fiscalQuarter: text, periodEnd });
    }
  });

  if (cols.length === 0) {
    errors.push({
      where: "parseRatiosQuarterlyRaw",
      message: "No quarter columns detected",
    });
  }

  const periods: Array<
    RatiosQuarter & { values: Record<string, string | number | null> }
  > = cols.map((c) => ({
    fiscalQuarter: c.fiscalQuarter,
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

        // Parse raw values without unit scaling
        const val = parseValueRaw(text, rowLabel);
        periods[colIdx].values[rowLabel] = val;
      });
    });
  } catch (err) {
    errors.push(makeError("parseRatiosQuarterlyRaw.rows", err));
  }

  return { ratiosQuarterly: { meta, periods }, errors };
}

/* ───────────── NORMALIZED (lowerCamelCase keys) ───────────── */

export async function scrapeRatiosQuarterly(
  url: string
): Promise<RatiosQuarterlyResult<Record<string, string | number | null>>> {
  const raw = await scrapeRatiosQuarterlyRaw(url);
  return transformRatioQuarterlyKeysToLowerCamel(raw);
}

function transformRatioQuarterlyKeysToLowerCamel(
  raw: RatiosQuarterlyResult<Record<string, string | number | null>>
): RatiosQuarterlyResult<Record<string, string | number | null>> {
  const { ratiosQuarterly, errors } = raw;
  const out = ratiosQuarterly.periods.map((p) => {
    const next: Record<string, string | number | null> = {};
    for (const [label, value] of Object.entries(p.values)) {
      const key = toLowerCamelKey(label);
      if (!key) continue;
      if (!(key in next) || next[key] == null) next[key] = value;
    }
    return {
      fiscalQuarter: p.fiscalQuarter,
      periodEnd: p.periodEnd,
      values: next,
    };
  });

  return {
    ratiosQuarterly: { meta: ratiosQuarterly.meta, periods: out },
    errors,
  };
}

/* ───────────── STRICT (allow-listed lowerCamelCase keys) ───────────── */

export interface RatiosQuarterlyStrictValues {
  // Valuation
  marketCapitalization?: string | number | null;
  marketCapGrowth?: string | number | null; // %
  enterpriseValue?: string | number | null;
  lastClosePrice?: string | number | null;

  // Price multiples
  peRatio?: string | number | null;
  priceToSales?: string | number | null;
  priceToBook?: string | number | null;
  priceToFreeCashFlow?: string | number | null;
  enterpriseValueToEbitda?: string | number | null;
  evToRevenue?: string | number | null;
  evToEbit?: string | number | null;
  pegRatio?: string | number | null;

  // Profitability
  grossMargin?: string | number | null; // %
  operatingMargin?: string | number | null; // %
  profitMargin?: string | number | null; // %
  ebitdaMargin?: string | number | null; // %
  freeCashFlowMargin?: string | number | null; // %

  returnOnAssets?: string | number | null; // %
  returnOnEquity?: string | number | null; // %
  returnOnCapital?: string | number | null; // %

  // Efficiency
  assetTurnover?: string | number | null;
  inventoryTurnover?: string | number | null;
  receivablesTurnover?: string | number | null;
  daysSalesOutstanding?: string | number | null;
  daysInventoryOutstanding?: string | number | null;
  daysPayablesOutstanding?: string | number | null;
  cashConversionCycle?: string | number | null;

  // Liquidity & leverage
  currentRatio?: string | number | null;
  quickRatio?: string | number | null;
  debtToEquity?: string | number | null;
  debtToAssets?: string | number | null;
  interestCoverage?: string | number | null;

  // Dividends
  dividendYield?: string | number | null; // %
  payoutRatio?: string | number | null; // %
}

const RATIOS_QUARTERLY_KEYS = [
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

type RatiosQuarterlyKey = (typeof RATIOS_QUARTERLY_KEYS)[number];
function isRatiosQuarterlyKey(k: string): k is RatiosQuarterlyKey {
  return (RATIOS_QUARTERLY_KEYS as readonly string[]).includes(k);
}

export async function scrapeRatiosQuarterlyStrict(
  url: string
): Promise<RatiosQuarterlyResult<RatiosQuarterlyStrictValues>> {
  const normalized = await scrapeRatiosQuarterly(url); // build strict off normalized lowerCamel keys
  return toStrictRatiosQuarterly(normalized);
}

function toStrictRatiosQuarterly(
  normalized: RatiosQuarterlyResult<Record<string, string | number | null>>
): RatiosQuarterlyResult<RatiosQuarterlyStrictValues> {
  const { ratiosQuarterly, errors } = normalized;

  const periods = ratiosQuarterly.periods.map((p) => {
    const strictVals: RatiosQuarterlyStrictValues = {};
    for (const [k, v] of Object.entries(p.values)) {
      if (isRatiosQuarterlyKey(k)) {
        if (!(k in strictVals) || strictVals[k] == null) strictVals[k] = v;
      }
    }
    return {
      fiscalQuarter: p.fiscalQuarter,
      periodEnd: p.periodEnd,
      values: strictVals,
    };
  });

  return { ratiosQuarterly: { meta: ratiosQuarterly.meta, periods }, errors };
}
