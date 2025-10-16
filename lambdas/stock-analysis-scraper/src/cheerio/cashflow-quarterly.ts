import {
  fetchHtml,
  load,
  normalizeText,
  cellText,
  makeError,
  ScrapeError,
  Html,
  toLowerCamelKey,
  parseValueRaw,
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

export interface CashFlowQuarterPeriodRaw {
  fiscalQuarter: string; // e.g., "Q4 2025"
  periodEnd?: string; // e.g., "Jun 30, 2025"
  values: Record<string, string | number | null>; // ORIGINAL row label -> string (for %), number, or null
}

export interface CashFlowQuarterlyResult<
  TValues = Record<string, string | number | null>
> {
  cashFlowQuarterly: {
    meta: CashFlowMeta;
    periods: Array<{
      fiscalQuarter: string;
      periodEnd?: string;
      values: TValues;
    }>;
  };
  errors: ScrapeError[];
}

/* ───────────────────── RAW (unchanged labels; unit-scaled) ───────────────────── */

export async function scrapeCashFlowQuarterlyRaw(
  url: string
): Promise<CashFlowQuarterlyResult<Record<string, string | number | null>>> {
  const { html, error } = await fetchHtml(url);
  if (!html) {
    return {
      cashFlowQuarterly: { meta: {}, periods: [] },
      errors: [
        error ?? {
          where: "scrapeCashFlowQuarterlyRaw",
          message: "Unknown fetch error",
        },
      ],
    };
  }
  return parseCashFlowQuarterlyRaw(html);
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

export function parseCashFlowQuarterlyRaw(
  html: Html
): CashFlowQuarterlyResult<Record<string, string | number | null>> {
  const $ = load(html);
  const errors: ScrapeError[] = [];

  // Parse currency + units note from the blurb
  const meta = extractFinancialsMeta($);
  const mult = unitMultiplier(meta.unit);

  const table = $("#main-table");
  if (table.length === 0) {
    return {
      cashFlowQuarterly: { meta, periods: [] },
      errors: [
        {
          where: "parseCashFlowQuarterlyRaw",
          message: "#main-table not found",
        },
      ],
    };
  }

  const headerRows = table.find("thead tr");
  if (headerRows.length < 2) {
    return {
      cashFlowQuarterly: { meta, periods: [] },
      errors: [
        { where: "parseCashFlowQuarterlyRaw", message: "thead not found" },
      ],
    };
  }

  // Row 0: Quarter labels (e.g., “Q4 2025”) + trailing “+20 Quarters” bucket to ignore
  // Row 1: Period-end dates in the same column positions
  const qRow = headerRows.eq(0).find("th");
  const peRow = headerRows.eq(1).find("th");

  interface ColInfo {
    idx: number;
    fiscalQuarter: string;
    periodEnd?: string;
  }
  const cols: ColInfo[] = [];
  qRow.each((i, th) => {
    if (i === 0) return; // first sticky column = row label (“Fiscal Quarter” / row header)
    const text = normalizeText($(th).text()); // e.g., “Q4 2025”
    if (/^Q[1-4]\s*\d{4}$/i.test(text)) {
      const rawPe = peRow.eq(i).text()
        ? normalizeText(peRow.eq(i).text())
        : undefined;
      const periodEnd = cleanPeriodEnd(rawPe);
      cols.push({ idx: i, fiscalQuarter: text, periodEnd });
    }
  });

  if (cols.length === 0) {
    errors.push({
      where: "parseCashFlowQuarterlyRaw",
      message: "No quarter columns detected",
    });
  }

  const periods: CashFlowQuarterPeriodRaw[] = cols.map((c) => ({
    fiscalQuarter: c.fiscalQuarter,
    periodEnd: c.periodEnd,
    values: {},
  }));

  try {
    table.find("tbody tr").each((_, tr) => {
      const $tr = $(tr);
      const tds = $tr.find("td");
      if (tds.length < 2) return;

      // First cell is the row label
      const $labelCell: cheerio.Cheerio<any> = tds.eq(0);
      const rowLabelRaw = cellText($labelCell, $).trim();
      const rowLabel = normalizeText(rowLabelRaw);
      if (!rowLabel) return;

      cols.forEach((c, colIdx) => {
        const cell = tds.eq(c.idx);
        if (!cell || cell.length === 0) return;
        const text = normalizeText(cell.text());

        // Handle “Upgrade” / blanks
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
    errors.push(makeError("parseCashFlowQuarterlyRaw.rows", err));
  }

  return { cashFlowQuarterly: { meta, periods }, errors };
}

/* ───────────────────── NORMALIZED (lowerCamelCase keys) ───────────────────── */

export async function scrapeCashFlowQuarterly(
  url: string
): Promise<CashFlowQuarterlyResult<Record<string, string | number | null>>> {
  const raw = await scrapeCashFlowQuarterlyRaw(url);
  return transformCashFlowQuarterlyKeysToLowerCamel(raw);
}

function transformCashFlowQuarterlyKeysToLowerCamel(
  raw: CashFlowQuarterlyResult<Record<string, string | number | null>>
): CashFlowQuarterlyResult<Record<string, string | number | null>> {
  const { cashFlowQuarterly, errors } = raw;

  const out = cashFlowQuarterly.periods.map((p) => {
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
    cashFlowQuarterly: { meta: cashFlowQuarterly.meta, periods: out },
    errors,
  };
}

/* ───────────────────── STRICT (explicit lowerCamelCase keys) ───────────────────── */

export interface CashFlowQuarterlyStrictValues {
  // Core adjustments / operating
  netIncome?: string | number | null;
  depreciationAndAmortization?: string | number | null;
  stockBasedCompensation?: string | number | null;
  deferredIncomeTax?: string | number | null;
  otherNonCashItems?: string | number | null;
  lossGainFromSaleOfAssets?: string | number | null;
  lossGainFromSaleOfInvestments?: string | number | null;
  lossGainOnEquityInvestments?: string | number | null;

  // Working capital changes (if reported individually)
  changeInWorkingCapital?: string | number | null;
  changeInAccountsReceivable?: string | number | null;
  changeInInventory?: string | number | null;
  changeInAccountsPayable?: string | number | null;
  changeInOtherWorkingCapital?: string | number | null;

  // Cash from operating activities
  operatingCashFlow?: string | number | null;

  // Investing
  capitalExpenditures?: string | number | null;
  purchaseOfPpAndE?: string | number | null;
  saleOfPpAndE?: string | number | null;
  acquisitions?: string | number | null;
  divestitures?: string | number | null;
  purchasesOfInvestments?: string | number | null;
  salesMaturitiesOfInvestments?: string | number | null;
  otherInvestingActivities?: string | number | null;
  investingCashFlow?: string | number | null;

  // Financing
  debtIssued?: string | number | null;
  debtRepaid?: string | number | null;
  commonStockIssued?: string | number | null;
  commonStockRepurchased?: string | number | null;
  dividendsPaid?: string | number | null;
  interestPaid?: string | number | null;
  incomeTaxesPaid?: string | number | null;
  otherFinancingActivities?: string | number | null;
  financingCashFlow?: string | number | null;

  // Summary
  effectOfForexChangesOnCash?: string | number | null;
  netChangeInCash?: string | number | null;
  freeCashFlow?: string | number | null;
  freeCashFlowPerShare?: string | number | null;
}

const CASHFLOW_QUARTERLY_KEYS = [
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

type CashFlowQuarterlyKey = (typeof CASHFLOW_QUARTERLY_KEYS)[number];
function isCashFlowQuarterlyStrictKey(k: string): k is CashFlowQuarterlyKey {
  return (CASHFLOW_QUARTERLY_KEYS as readonly string[]).includes(k);
}

export async function scrapeCashFlowQuarterlyStrict(
  url: string
): Promise<CashFlowQuarterlyResult<CashFlowQuarterlyStrictValues>> {
  const normalized = await scrapeCashFlowQuarterly(url);
  return toStrictCashFlowQuarterly(normalized);
}

function toStrictCashFlowQuarterly(
  normalized: CashFlowQuarterlyResult<Record<string, string | number | null>>
): CashFlowQuarterlyResult<CashFlowQuarterlyStrictValues> {
  const { cashFlowQuarterly, errors } = normalized;

  const periods = cashFlowQuarterly.periods.map((p) => {
    const strictVals: CashFlowQuarterlyStrictValues = {};
    for (const [k, v] of Object.entries(p.values)) {
      if (isCashFlowQuarterlyStrictKey(k)) {
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
    cashFlowQuarterly: { meta: cashFlowQuarterly.meta, periods },
    errors,
  };
}
