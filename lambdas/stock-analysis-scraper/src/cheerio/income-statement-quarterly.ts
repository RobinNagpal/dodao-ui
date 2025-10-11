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
  currency?: string;
  unit?: Unit;
  fiscalYearNote?: string;
}

export interface IncomeQuarterPeriodRaw {
  fiscalQuarter: string; // e.g., "Q4 2025"
  periodEnd?: string; // e.g., "Jun 30, 2025"
  values: Record<string, number | null>; // ORIGINAL label -> numeric or null
}

export interface IncomeQuarterlyResult<
  TValues = Record<string, number | null>
> {
  incomeStatementQuarterly: {
    meta: IncomeMeta;
    periods: Array<{
      fiscalQuarter: string;
      periodEnd?: string;
      values: TValues;
    }>;
  };
  errors: ScrapeError[];
}

/* ───────────── RAW (unchanged keys) ───────────── */

export async function scrapeIncomeStatementQuarterlyRaw(
  url: string
): Promise<IncomeQuarterlyResult<Record<string, number | null>>> {
  const { html, error } = await fetchHtml(url);
  if (!html) {
    return {
      incomeStatementQuarterly: { meta: {}, periods: [] },
      errors: [
        error ?? {
          where: "scrapeIncomeStatementQuarterlyRaw",
          message: "Unknown fetch error",
        },
      ],
    };
  }
  return parseIncomeStatementQuarterlyRaw(html);
}

export function parseIncomeStatementQuarterlyRaw(
  html: Html
): IncomeQuarterlyResult<Record<string, number | null>> {
  const $ = load(html);
  const errors: ScrapeError[] = [];
  const meta = extractFinancialsMeta($);
  const mult = unitMultiplier(meta.unit);

  const table = $("#main-table");
  if (table.length === 0) {
    return {
      incomeStatementQuarterly: { meta, periods: [] },
      errors: [
        {
          where: "parseIncomeStatementQuarterlyRaw",
          message: "#main-table not found",
        },
      ],
    };
  }

  const headerRows = table.find("thead tr");
  if (headerRows.length < 2) {
    return {
      incomeStatementQuarterly: { meta, periods: [] },
      errors: [
        {
          where: "parseIncomeStatementQuarterlyRaw",
          message: "thead rows not found",
        },
      ],
    };
  }

  // Row 0: "Q4 2025", "Q3 2025", ... (ignore trailing "+20 Quarters" etc.)
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
    if (/^Q[1-4]\s+(?:\d{4}|\d{2})$/i.test(text)) {
      const periodEnd = peRow.eq(i).text()
        ? normalizeText(peRow.eq(i).text())
        : undefined;
      cols.push({ idx: i, fiscalQuarter: text, periodEnd });
    }
  });

  if (cols.length === 0) {
    errors.push({
      where: "parseIncomeStatementQuarterlyRaw",
      message: "No quarterly columns detected",
    });
  }

  const periods: IncomeQuarterPeriodRaw[] = cols.map((c) => ({
    fiscalQuarter: c.fiscalQuarter,
    periodEnd: c.periodEnd,
    values: {},
  }));

  try {
    table.find("tbody tr").each((_, tr) => {
      const $tr = $(tr);
      const tds = $tr.find("td");
      if (tds.length < 2) return;

      const $labelCell: cheerio.Cheerio<any> = tds.eq(0);
      const rowLabelRaw = cellText($labelCell, $).trim();
      const rowLabel = normalizeText(rowLabelRaw);
      if (!rowLabel) return;

      cols.forEach((c, colIdx) => {
        const cell = tds.eq(c.idx);
        if (!cell || cell.length === 0) return;

        const text = normalizeText(cell.text());
        if (!text || /^upgrade$/i.test(text)) {
          periods[colIdx].values[rowLabel] = null;
          return;
        }

        const val = parseValueWithUnit(text, rowLabel, mult);
        periods[colIdx].values[rowLabel] = Number.isFinite(val as number)
          ? (val as number)
          : null;
      });
    });
  } catch (err) {
    errors.push(makeError("parseIncomeStatementQuarterlyRaw.rows", err));
  }

  return { incomeStatementQuarterly: { meta, periods }, errors };
}

/** Same blurb style as annual */
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

/* ─────────── NORMALIZED (lowerCamelCase keys) ─────────── */

export async function scrapeIncomeStatementQuarterly(
  url: string
): Promise<IncomeQuarterlyResult<Record<string, number | null>>> {
  const raw = await scrapeIncomeStatementQuarterlyRaw(url);
  return transformQuarterlyKeysToLowerCamel(raw);
}

function transformQuarterlyKeysToLowerCamel(
  raw: IncomeQuarterlyResult<Record<string, number | null>>
): IncomeQuarterlyResult<Record<string, number | null>> {
  const { incomeStatementQuarterly, errors } = raw;

  const out = incomeStatementQuarterly.periods.map((p) => {
    const next: Record<string, number | null> = {};
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
    incomeStatementQuarterly: {
      meta: incomeStatementQuarterly.meta,
      periods: out,
    },
    errors,
  };
}

/* ───────── STRICT (explicit lowerCamelCase keys; optional) ───────── */

export interface IncomeQuarterlyStrictValues {
  revenue?: number | null;
  revenueGrowth?: number | null;
  costOfRevenue?: number | null;
  grossProfit?: number | null;
  sellingGeneralAndAdmin?: number | null;
  otherOperatingExpenses?: number | null;
  operatingExpenses?: number | null;
  operatingIncome?: number | null;
  interestExpense?: number | null;
  interestAndInvestmentIncome?: number | null;
  earningsFromEquityInvestments?: number | null;
  currencyExchangeGain?: number | null;
  otherNonOperatingIncome?: number | null;
  ebtExcludingUnusualItems?: number | null;
  gainOnSaleOfInvestments?: number | null;
  gainOnSaleOfAssets?: number | null;
  otherUnusualItems?: number | null;
  pretaxIncome?: number | null;
  incomeTaxExpense?: number | null;
  netIncome?: number | null;
  netIncomeToCommon?: number | null;
  netIncomeGrowth?: number | null;
  sharesOutstanding?: number | null;
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
}

// allowlist for strict quarterly keys (same as annual to keep schema aligned)
const INCOME_QUARTERLY_KEYS = [
  "revenue",
  "revenueGrowth",
  "costOfRevenue",
  "grossProfit",
  "sellingGeneralAndAdmin",
  "otherOperatingExpenses",
  "operatingExpenses",
  "operatingIncome",
  "interestExpense",
  "interestAndInvestmentIncome",
  "earningsFromEquityInvestments",
  "currencyExchangeGain",
  "otherNonOperatingIncome",
  "ebtExcludingUnusualItems",
  "gainOnSaleOfInvestments",
  "gainOnSaleOfAssets",
  "otherUnusualItems",
  "pretaxIncome",
  "incomeTaxExpense",
  "netIncome",
  "netIncomeToCommon",
  "netIncomeGrowth",
  "sharesOutstanding",
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
] as const;

type IncomeQuarterlyKey = (typeof INCOME_QUARTERLY_KEYS)[number];
function isIncomeQuarterlyStrictKey(k: string): k is IncomeQuarterlyKey {
  return (INCOME_QUARTERLY_KEYS as readonly string[]).includes(k);
}

export async function scrapeIncomeStatementQuarterlyStrict(
  url: string
): Promise<IncomeQuarterlyResult<IncomeQuarterlyStrictValues>> {
  const normalized = await scrapeIncomeStatementQuarterly(url); // build from normalized
  return toStrictQuarterly(normalized);
}

function toStrictQuarterly(
  normalized: IncomeQuarterlyResult<Record<string, number | null>>
): IncomeQuarterlyResult<IncomeQuarterlyStrictValues> {
  const { incomeStatementQuarterly, errors } = normalized;

  const periods = incomeStatementQuarterly.periods.map((p) => {
    const strictVals: IncomeQuarterlyStrictValues = {};
    for (const [k, v] of Object.entries(p.values)) {
      if (isIncomeQuarterlyStrictKey(k)) {
        if (!(k in strictVals) || strictVals[k] == null) strictVals[k] = v;
      }
    }
    return {
      fiscalQuarter: p.fiscalQuarter,
      periodEnd: p.periodEnd,
      values: strictVals,
    };
  });

  return {
    incomeStatementQuarterly: { meta: incomeStatementQuarterly.meta, periods },
    errors,
  };
}
