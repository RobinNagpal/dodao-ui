import {
  fetchHtml,
  load,
  normalizeText,
  parseNumberLike,
  parsePercent,
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

export interface IncomeMeta {
  currency?: string; // e.g., "USD"
  unit?: Unit; // e.g., "millions"
  fiscalYearNote?: string; // e.g., "Fiscal year is July - June."
}

export interface IncomePeriodRaw {
  fiscalYear: string;
  periodEnd?: string;
  values: Record<string, number | null>; // ORIGINAL LABEL -> numeric or null
}

export interface IncomeAnnualResult<TValues = Record<string, number | null>> {
  incomeStatementAnnual: {
    meta: IncomeMeta;
    periods: Array<{
      fiscalYear: string;
      periodEnd?: string;
      values: TValues;
    }>;
  };
  errors: ScrapeError[];
}

/* --------------------------- RAW (unchanged keys) --------------------------- */

export async function scrapeIncomeStatementAnnualRaw(
  url: string
): Promise<IncomeAnnualResult<Record<string, number | null>>> {
  const { html, error } = await fetchHtml(url);
  if (!html) {
    return {
      incomeStatementAnnual: { meta: {}, periods: [] },
      errors: [
        error ?? {
          where: "scrapeIncomeStatementAnnualRaw",
          message: "Unknown fetch error",
        },
      ],
    };
  }
  return parseIncomeStatementAnnualRaw(html);
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

export function parseIncomeStatementAnnualRaw(
  html: Html
): IncomeAnnualResult<Record<string, number | null>> {
  const $ = load(html);
  const errors: ScrapeError[] = [];

  const meta = extractFinancialsMeta($); // ⬅️ new
  const mult = unitMultiplier(meta.unit);
  const table = $("#main-table");
  if (table.length === 0) {
    return {
      incomeStatementAnnual: { meta, periods: [] },
      errors: [
        {
          where: "parseIncomeStatementAnnualRaw",
          message: "#main-table not found",
        },
      ],
    };
  }

  const headerRows = table.find("thead tr");
  if (headerRows.length === 0) {
    return {
      incomeStatementAnnual: { meta, periods: [] },
      errors: [
        { where: "parseIncomeStatementAnnualRaw", message: "thead not found" },
      ],
    };
  }

  // Row 0: "FY 2025" or "FY2025" or "2025"; ignore "2016 - 2020" buckets
  const fyRow = headerRows.eq(0).find("th");
  const peRow = headerRows.eq(1).find("th");

  interface ColInfo {
    idx: number;
    fiscalYear: string;
    periodEnd?: string;
  }
  const cols: ColInfo[] = [];
  fyRow.each((i, th) => {
    if (i === 0) return; // first column is the row label
    const text = normalizeText($(th).text());
    if (
      (/^FY\s*'?(\d{2}|\d{4})$/i.test(text) || /^\d{4}$/.test(text)) &&
      !text.includes("-")
    ) {
      const rawPe = peRow.eq(i).text()
        ? normalizeText(peRow.eq(i).text())
        : undefined;
      const periodEnd = cleanPeriodEnd(rawPe);
      cols.push({ idx: i, fiscalYear: text, periodEnd });
    }
  });

  if (cols.length === 0) {
    errors.push({
      where: "parseIncomeStatementAnnualRaw",
      message: "No fiscal-year columns detected",
    });
  }

  const periods: IncomePeriodRaw[] = cols.map((c) => ({
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

        const val = parseValueWithUnit(text, rowLabel, mult); // ⬅️ scale here
        periods[colIdx].values[rowLabel] = val;
      });
    });
  } catch (err) {
    errors.push(makeError("parseIncomeStatementAnnualRaw.rows", err));
  }
  return { incomeStatementAnnual: { meta, periods }, errors };
}

/** Attempts to read "Financials in millions PKR. Fiscal year is July - June." style blurb above the table */
function extractMeta($: cheerio.CheerioAPI): IncomeMeta {
  const meta: IncomeMeta = {};
  try {
    const blurb = $("main .text-faded")
      .filter((_, el) =>
        /Financials.*(million|thousand|billion)|Millions|Thousands|Billions/i.test(
          $(el).text()
        )
      )
      .first()
      .text();
    const s = normalizeText(blurb);
    if (s) {
      const unitMatch = s.match(/\b(Millions|Thousands|Billions)\b/i);
      const currencyMatch = s.match(/\b[A-Z]{3}\b/);
      if (unitMatch) meta.unit = unitMatch[1].toLowerCase() as Unit;
      if (currencyMatch) meta.currency = currencyMatch[0];
      const fyNoteMatch = s.match(/Fiscal year is.*$/i);
      if (fyNoteMatch) meta.fiscalYearNote = fyNoteMatch[0];
    }
  } catch {
    /* non-fatal */
  }
  return meta;
}

/* -------- NORMALIZED (lowerCamelCase keys via utils.toLowerCamelKey) ------- */

export async function scrapeIncomeStatementAnnual(
  url: string
): Promise<IncomeAnnualResult<Record<string, number | null>>> {
  const raw = await scrapeIncomeStatementAnnualRaw(url);
  return transformPeriodsKeysToLowerCamel(raw);
}

function transformPeriodsKeysToLowerCamel(
  raw: IncomeAnnualResult<Record<string, number | null>>
): IncomeAnnualResult<Record<string, number | null>> {
  const { incomeStatementAnnual, errors } = raw;
  const outPeriods = incomeStatementAnnual.periods.map((p) => {
    const next: Record<string, number | null> = {};
    for (const [label, value] of Object.entries(p.values)) {
      const key = toLowerCamelKey(label);
      if (!key) continue;
      if (!(key in next) || next[key] == null) next[key] = value;
    }
    return { fiscalYear: p.fiscalYear, periodEnd: p.periodEnd, values: next };
  });

  return {
    incomeStatementAnnual: {
      meta: incomeStatementAnnual.meta,
      periods: outPeriods,
    },
    errors,
  };
}

/* ---------------- STRICT (explicit lowerCamelCase keys; optional) ---------- */

export interface IncomeAnnualStrictValues {
  revenue?: number | null;
  revenueGrowth?: number | null;
  costOfRevenue?: number | null;
  grossProfit?: number | null;
  sellingGeneralAndAdmin?: number | null;
  researchAndDevelopment?: number | null;
  otherOperatingExpenses?: number | null;
  operatingExpenses?: number | null;
  operatingIncome?: number | null;
  interestExpense?: number | null;
  interestAndInvestmentIncome?: number | null;
  earningsFromEquityInvestments?: number | null;
  currencyExchangeGain?: number | null;
  otherNonOperatingIncome?: number | null;
  ebtExcludingUnusualItems?: number | null;
  mergerAndRestructuringCharges?: number | null;
  legalSettlements?: number | null;
  gainOnSaleOfInvestments?: number | null;
  gainOnSaleOfAssets?: number | null;
  otherUnusualItems?: number | null;
  pretaxIncome?: number | null;
  incomeTaxExpense?: number | null;
  earningsFromContinuingOperations?: number | null;
  earningsFromDiscontinuedOperations?: number | null;
  netIncomeToCompany?: number | null;
  minorityInterestInEarnings?: number | null;
  netIncome?: number | null;
  preferredDividendsAndOtherAdjustments?: number | null;
  netIncomeToCommon?: number | null;
  netIncomeGrowth?: number | null;
  sharesOutstanding?: number | null;
  sharesOutstandingDiluted?: number | null;
  sharesChange?: number | null;
  eps?: number | null;
  epsGrowth?: number | null;
  freeCashFlow?: number | null;
  freeCashFlowPerShare?: number | null;
  dividendPerShare?: number | null;
  dividendGrowth?: number | null;
  grossMargin?: number | null;
  operatingMargin?: number | null;
  profitMargin?: number | null;
  freeCashFlowMargin?: number | null;
  ebitda?: number | null;
  ebitdaMargin?: number | null;
  dAndAForEbitda?: number | null;
  ebit?: number | null;
  ebitMargin?: number | null;
  effectiveTaxRate?: number | null;
  advertisingExpenses?: number | null;
  revenueAsReported?: number | null;
}

// Strongly-typed allowlist of strict keys
const INCOME_ANNUAL_KEYS = [
  "revenue",
  "revenueGrowth",
  "costOfRevenue",
  "grossProfit",
  "sellingGeneralAndAdmin",
  "researchAndDevelopment",
  "otherOperatingExpenses",
  "operatingExpenses",
  "operatingIncome",
  "interestExpense",
  "interestAndInvestmentIncome",
  "earningsFromEquityInvestments",
  "currencyExchangeGain",
  "otherNonOperatingIncome",
  "ebtExcludingUnusualItems",
  "mergerAndRestructuringCharges",
  "legalSettlements",
  "gainOnSaleOfInvestments",
  "gainOnSaleOfAssets",
  "otherUnusualItems",
  "pretaxIncome",
  "incomeTaxExpense",
  "earningsFromContinuingOperations",
  "earningsFromDiscontinuedOperations",
  "netIncomeToCompany",
  "minorityInterestInEarnings",
  "netIncome",
  "preferredDividendsAndOtherAdjustments",
  "netIncomeToCommon",
  "netIncomeGrowth",
  "sharesOutstanding",
  "sharesOutstandingDiluted",
  "sharesChange",
  "eps",
  "epsGrowth",
  "freeCashFlow",
  "freeCashFlowPerShare",
  "dividendPerShare",
  "dividendGrowth",
  "grossMargin",
  "operatingMargin",
  "profitMargin",
  "freeCashFlowMargin",
  "ebitda",
  "ebitdaMargin",
  "dAndAForEbitda",
  "ebit",
  "ebitMargin",
  "effectiveTaxRate",
  "advertisingExpenses",
  "revenueAsReported",
] as const;

type IncomeAnnualKey = (typeof INCOME_ANNUAL_KEYS)[number];

function isIncomeAnnualStrictKey(k: string): k is IncomeAnnualKey {
  return (INCOME_ANNUAL_KEYS as readonly string[]).includes(k);
}

export async function scrapeIncomeStatementAnnualStrict(
  url: string
): Promise<IncomeAnnualResult<IncomeAnnualStrictValues>> {
  // IMPORTANT: make strict from the *normalized* output
  const normalized = await scrapeIncomeStatementAnnual(url);
  return toStrict(normalized);
}

function toStrict(
  normalized: IncomeAnnualResult<Record<string, number | null>>
): IncomeAnnualResult<IncomeAnnualStrictValues> {
  const { incomeStatementAnnual, errors } = normalized;

  const periods = incomeStatementAnnual.periods.map((p) => {
    const strictVals: IncomeAnnualStrictValues = {};
    for (const [k, v] of Object.entries(p.values)) {
      if (isIncomeAnnualStrictKey(k)) {
        // keep only expected keys
        if (!(k in strictVals) || strictVals[k] == null) strictVals[k] = v;
      }
    }
    return {
      fiscalYear: p.fiscalYear,
      periodEnd: p.periodEnd,
      values: strictVals,
    };
  });

  return {
    incomeStatementAnnual: { meta: incomeStatementAnnual.meta, periods },
    errors,
  };
}
