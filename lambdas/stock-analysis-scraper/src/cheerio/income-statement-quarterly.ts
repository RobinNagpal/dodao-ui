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
  parseValueRaw,
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
  values: Record<string, string | number | null>; // ORIGINAL label -> string (for %), number, or null
}

export interface IncomeQuarterlyResult<
  TValues = Record<string, string | number | null>
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
): Promise<IncomeQuarterlyResult<Record<string, string | number | null>>> {
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

export function parseIncomeStatementQuarterlyRaw(
  html: Html
): IncomeQuarterlyResult<Record<string, string | number | null>> {
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
      const rawPe = peRow.eq(i).text()
        ? normalizeText(peRow.eq(i).text())
        : undefined;
      const periodEnd = cleanPeriodEnd(rawPe);
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

        const val = parseValueRaw(text, rowLabel);
        periods[colIdx].values[rowLabel] = val;
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
): Promise<IncomeQuarterlyResult<Record<string, string | number | null>>> {
  const raw = await scrapeIncomeStatementQuarterlyRaw(url);
  return transformQuarterlyKeysToLowerCamel(raw);
}

function transformQuarterlyKeysToLowerCamel(
  raw: IncomeQuarterlyResult<Record<string, string | number | null>>
): IncomeQuarterlyResult<Record<string, string | number | null>> {
  const { incomeStatementQuarterly, errors } = raw;

  const out = incomeStatementQuarterly.periods.map((p) => {
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
    incomeStatementQuarterly: {
      meta: incomeStatementQuarterly.meta,
      periods: out,
    },
    errors,
  };
}

/* ───────── STRICT (explicit lowerCamelCase keys; optional) ───────── */

export interface IncomeQuarterlyStrictValues {
  revenue?: string | number | null;
  revenueGrowth?: string | number | null;
  costOfRevenue?: string | number | null;
  grossProfit?: string | number | null;
  sellingGeneralAndAdmin?: string | number | null;
  otherOperatingExpenses?: string | number | null;
  operatingExpenses?: string | number | null;
  operatingIncome?: string | number | null;
  interestExpense?: string | number | null;
  interestAndInvestmentIncome?: string | number | null;
  earningsFromEquityInvestments?: string | number | null;
  currencyExchangeGain?: string | number | null;
  otherNonOperatingIncome?: string | number | null;
  ebtExcludingUnusualItems?: string | number | null;
  gainOnSaleOfInvestments?: string | number | null;
  gainOnSaleOfAssets?: string | number | null;
  otherUnusualItems?: string | number | null;
  pretaxIncome?: string | number | null;
  incomeTaxExpense?: string | number | null;
  netIncome?: string | number | null;
  netIncomeToCommon?: string | number | null;
  netIncomeGrowth?: string | number | null;
  sharesOutstanding?: string | number | null;
  eps?: string | number | null;
  epsGrowth?: string | number | null;
  freeCashFlow?: string | number | null;
  freeCashFlowPerShare?: string | number | null;
  dividendPerShare?: string | number | null;
  dividendGrowth?: string | number | null;
  grossMargin?: string | number | null;
  operatingMargin?: string | number | null;
  profitMargin?: string | number | null;
  freeCashFlowMargin?: string | number | null;
  ebitda?: string | number | null;
  ebitdaMargin?: string | number | null;
  dAndAForEbitda?: string | number | null;
  ebit?: string | number | null;
  ebitMargin?: string | number | null;
  effectiveTaxRate?: string | number | null;
  advertisingExpenses?: string | number | null;
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
  normalized: IncomeQuarterlyResult<Record<string, string | number | null>>
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
