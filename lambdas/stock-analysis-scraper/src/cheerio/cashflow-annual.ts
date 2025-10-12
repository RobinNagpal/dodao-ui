import {
  fetchHtml,
  load,
  normalizeText,
  cellText,
  makeError,
  ScrapeError,
  Html,
  toLowerCamelKey,
  parseValueWithUnit,
  extractFinancialsMeta,
  unitMultiplier,
} from "./utils";
import * as cheerio from "cheerio";

export type Unit = "ones" | "thousands" | "millions" | "billions";

export interface CashFlowMeta {
  currency?: string;
  unit?: Unit;
  fiscalYearNote?: string;
}

export interface CashFlowPeriodRaw {
  fiscalYear: string; // e.g., "FY 2025"
  periodEnd?: string; // e.g., "Jun 30, 2025"
  values: Record<string, number | null>; // ORIGINAL row label -> numeric or null (already unit-scaled to ones)
}

export interface CashFlowAnnualResult<TValues = Record<string, number | null>> {
  cashFlowAnnual: {
    meta: CashFlowMeta;
    periods: Array<{
      fiscalYear: string;
      periodEnd?: string;
      values: TValues;
    }>;
  };
  errors: ScrapeError[];
}

/* ────────────────── RAW (unchanged labels; unit-scaled) ────────────────── */

export async function scrapeCashFlowAnnualRaw(
  url: string
): Promise<CashFlowAnnualResult<Record<string, number | null>>> {
  const { html, error } = await fetchHtml(url);
  if (!html) {
    return {
      cashFlowAnnual: { meta: {}, periods: [] },
      errors: [
        error ?? {
          where: "scrapeCashFlowAnnualRaw",
          message: "Unknown fetch error",
        },
      ],
    };
  }
  return parseCashFlowAnnualRaw(html);
}

export function parseCashFlowAnnualRaw(
  html: Html
): CashFlowAnnualResult<Record<string, number | null>> {
  const $ = load(html);
  const errors: ScrapeError[] = [];

  // Parse currency + units (Millions/Thousands/Billions) and FY note
  const meta = extractFinancialsMeta($);
  const mult = unitMultiplier(meta.unit);

  const table = $("#main-table");
  if (table.length === 0) {
    return {
      cashFlowAnnual: { meta, periods: [] },
      errors: [
        {
          where: "parseCashFlowAnnualRaw",
          message: "#main-table not found",
        },
      ],
    };
  }

  const headerRows = table.find("thead tr");
  if (headerRows.length < 2) {
    return {
      cashFlowAnnual: { meta, periods: [] },
      errors: [{ where: "parseCashFlowAnnualRaw", message: "thead not found" }],
    };
  }

  // Row 0: FY labels; Row 1: Period end; ignore buckets like "2016 - 2020"
  const fyRow = headerRows.eq(0).find("th");
  const peRow = headerRows.eq(1).find("th");

  interface ColInfo {
    idx: number;
    fiscalYear: string;
    periodEnd?: string;
  }

  const cols: ColInfo[] = [];
  fyRow.each((i, th) => {
    if (i === 0) return; // first sticky label column
    const text = normalizeText($(th).text()); // e.g., "FY 2025"
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
      where: "parseCashFlowAnnualRaw",
      message: "No fiscal-year columns detected",
    });
  }

  const periods: CashFlowPeriodRaw[] = cols.map((c) => ({
    fiscalYear: c.fiscalYear,
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

        // Let the shared parser decide % vs number, apply unit multiplier, handle negatives/() etc.
        const val = parseValueWithUnit(text, rowLabel, mult);
        periods[colIdx].values[rowLabel] = val;
      });
    });
  } catch (err) {
    errors.push(makeError("parseCashFlowAnnualRaw.rows", err));
  }

  return { cashFlowAnnual: { meta, periods }, errors };
}

/* ─────────────── NORMALIZED (lowerCamelCase keys via utils) ─────────────── */

export async function scrapeCashFlowAnnual(
  url: string
): Promise<CashFlowAnnualResult<Record<string, number | null>>> {
  const raw = await scrapeCashFlowAnnualRaw(url);
  return transformCashFlowKeysToLowerCamel(raw);
}

function transformCashFlowKeysToLowerCamel(
  raw: CashFlowAnnualResult<Record<string, number | null>>
): CashFlowAnnualResult<Record<string, number | null>> {
  const { cashFlowAnnual, errors } = raw;

  const outPeriods = cashFlowAnnual.periods.map((p) => {
    const next: Record<string, number | null> = {};
    for (const [label, value] of Object.entries(p.values)) {
      const key = toLowerCamelKey(label);
      if (!key) continue;
      if (!(key in next) || next[key] == null) next[key] = value;
    }
    return { fiscalYear: p.fiscalYear, periodEnd: p.periodEnd, values: next };
  });

  return {
    cashFlowAnnual: { meta: cashFlowAnnual.meta, periods: outPeriods },
    errors,
  };
}

/* ───────────── STRICT (explicit lowerCamelCase keys; optional) ──────────── */

export interface CashFlowAnnualStrictValues {
  // Core adjustments / operating
  netIncome?: number | null;
  depreciationAndAmortization?: number | null;
  stockBasedCompensation?: number | null;
  deferredIncomeTax?: number | null;
  otherNonCashItems?: number | null;
  lossGainFromSaleOfAssets?: number | null;
  lossGainFromSaleOfInvestments?: number | null;
  lossGainOnEquityInvestments?: number | null;

  // Working capital changes (if reported individually)
  changeInWorkingCapital?: number | null;
  changeInAccountsReceivable?: number | null;
  changeInInventory?: number | null;
  changeInAccountsPayable?: number | null;
  changeInOtherWorkingCapital?: number | null;

  // Cash from operating activities
  operatingCashFlow?: number | null;

  // Investing
  capitalExpenditures?: number | null; // aka CapEx / Purchase of PP&E
  purchaseOfPpAndE?: number | null;
  saleOfPpAndE?: number | null;
  acquisitions?: number | null;
  divestitures?: number | null;
  purchasesOfInvestments?: number | null;
  salesMaturitiesOfInvestments?: number | null;
  otherInvestingActivities?: number | null;
  investingCashFlow?: number | null;

  // Financing
  debtIssued?: number | null;
  debtRepaid?: number | null;
  commonStockIssued?: number | null;
  commonStockRepurchased?: number | null;
  dividendsPaid?: number | null;
  interestPaid?: number | null;
  incomeTaxesPaid?: number | null;
  otherFinancingActivities?: number | null;
  financingCashFlow?: number | null;

  // Summary
  effectOfForexChangesOnCash?: number | null;
  netChangeInCash?: number | null;
  freeCashFlow?: number | null;
  freeCashFlowPerShare?: number | null;
}

const CASHFLOW_ANNUAL_KEYS = [
  "netIncome",
  "depreciationAndAmortization",
  "stockBasedCompensation",
  "deferredIncomeTax",
  "otherNonCashItems",
  "lossGainFromSaleOfAssets",
  "lossGainFromSaleOfInvestments",
  "lossGainOnEquityInvestments",
  "changeInWorkingCapital",
  "changeInAccountsReceivable",
  "changeInInventory",
  "changeInAccountsPayable",
  "changeInOtherWorkingCapital",
  "operatingCashFlow",
  "capitalExpenditures",
  "purchaseOfPpAndE",
  "saleOfPpAndE",
  "acquisitions",
  "divestitures",
  "purchasesOfInvestments",
  "salesMaturitiesOfInvestments",
  "otherInvestingActivities",
  "investingCashFlow",
  "debtIssued",
  "debtRepaid",
  "commonStockIssued",
  "commonStockRepurchased",
  "dividendsPaid",
  "interestPaid",
  "incomeTaxesPaid",
  "otherFinancingActivities",
  "financingCashFlow",
  "effectOfForexChangesOnCash",
  "netChangeInCash",
  "freeCashFlow",
  "freeCashFlowPerShare",
] as const;

type CashFlowAnnualKey = (typeof CASHFLOW_ANNUAL_KEYS)[number];
function isCashFlowAnnualStrictKey(k: string): k is CashFlowAnnualKey {
  return (CASHFLOW_ANNUAL_KEYS as readonly string[]).includes(k);
}

export async function scrapeCashFlowAnnualStrict(
  url: string
): Promise<CashFlowAnnualResult<CashFlowAnnualStrictValues>> {
  const normalized = await scrapeCashFlowAnnual(url);
  return toStrictCashFlowAnnual(normalized);
}

function toStrictCashFlowAnnual(
  normalized: CashFlowAnnualResult<Record<string, number | null>>
): CashFlowAnnualResult<CashFlowAnnualStrictValues> {
  const { cashFlowAnnual, errors } = normalized;

  const periods = cashFlowAnnual.periods.map((p) => {
    const strictVals: CashFlowAnnualStrictValues = {};
    for (const [k, v] of Object.entries(p.values)) {
      if (isCashFlowAnnualStrictKey(k)) {
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
    cashFlowAnnual: { meta: cashFlowAnnual.meta, periods },
    errors,
  };
}
