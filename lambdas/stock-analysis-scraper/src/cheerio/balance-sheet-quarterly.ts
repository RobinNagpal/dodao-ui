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

export interface BalanceMeta {
  currency?: string;
  unit?: Unit;
  fiscalYearNote?: string;
}

export interface BalanceQuarterPeriodRaw {
  fiscalQuarter: string; // e.g., "Q4 2025"
  periodEnd?: string; // e.g., "Jun 30, 2025"
  values: Record<string, string | number | null>; // ORIGINAL label -> string (for %), number, or null
}

export interface BalanceQuarterlyResult<
  TValues = Record<string, string | number | null>
> {
  balanceSheetQuarterly: {
    meta: BalanceMeta;
    periods: Array<{
      fiscalQuarter: string;
      periodEnd?: string;
      values: TValues;
    }>;
  };
  errors: ScrapeError[];
}

/* ───────────── RAW (unchanged labels) ───────────── */

export async function scrapeBalanceSheetQuarterlyRaw(
  url: string
): Promise<BalanceQuarterlyResult<Record<string, string | number | null>>> {
  const { html, error } = await fetchHtml(url);
  if (!html) {
    return {
      balanceSheetQuarterly: { meta: {}, periods: [] },
      errors: [
        error ?? {
          where: "scrapeBalanceSheetQuarterlyRaw",
          message: "Unknown fetch error",
        },
      ],
    };
  }
  return parseBalanceSheetQuarterlyRaw(html);
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

export function parseBalanceSheetQuarterlyRaw(
  html: Html
): BalanceQuarterlyResult<Record<string, string | number | null>> {
  const $ = load(html);
  const errors: ScrapeError[] = [];
  const meta = extractFinancialsMeta($);
  const mult = unitMultiplier(meta.unit);

  const table = $("#main-table");
  if (table.length === 0) {
    return {
      balanceSheetQuarterly: { meta, periods: [] },
      errors: [
        {
          where: "parseBalanceSheetQuarterlyRaw",
          message: "#main-table not found",
        },
      ],
    };
  }

  const headerRows = table.find("thead tr");
  if (headerRows.length < 2) {
    return {
      balanceSheetQuarterly: { meta, periods: [] },
      errors: [
        { where: "parseBalanceSheetQuarterlyRaw", message: "thead not found" },
      ],
    };
  }

  // Row 0: "Qx YYYY" headings; Row 1: Period end dates.
  const qRow = headerRows.eq(0).find("th");
  const peRow = headerRows.eq(1).find("th");

  interface ColInfo {
    idx: number;
    fiscalQuarter: string;
    periodEnd?: string;
  }
  const cols: ColInfo[] = [];
  qRow.each((i, th) => {
    if (i === 0) return; // first sticky col = row label
    const text = normalizeText($(th).text()); // e.g., "Q4 2025"
    // Skip the trailing "+20 Quarters" header cell and any buckets
    if (!/^Q[1-4]\s*\d{2,4}$/i.test(text)) return;

    const rawPe = peRow.eq(i).text()
      ? normalizeText(peRow.eq(i).text())
      : undefined;
    const periodEnd = cleanPeriodEnd(rawPe);

    cols.push({ idx: i, fiscalQuarter: text, periodEnd });
  });

  if (cols.length === 0) {
    errors.push({
      where: "parseBalanceSheetQuarterlyRaw",
      message: "No fiscal-quarter columns detected",
    });
  }

  const periods: BalanceQuarterPeriodRaw[] = cols.map((c) => ({
    fiscalQuarter: c.fiscalQuarter,
    periodEnd: c.periodEnd,
    values: {},
  }));

  try {
    table.find("tbody tr").each((_, tr) => {
      const $tr = $(tr);
      const tds = $tr.find("td");
      if (tds.length < 2) return;

      const label = normalizeText(cellText(tds.eq(0), $).trim());
      if (!label) return;

      cols.forEach((c, colIdx) => {
        const cell = tds.eq(c.idx);
        if (!cell || cell.length === 0) return;

        const text = normalizeText(cell.text());
        // Skip empty/Upgrade placeholders
        if (!text || /^upgrade$/i.test(text)) {
          periods[colIdx].values[label] = null;
          return;
        }
        const val = parseValueRaw(text, label);
        periods[colIdx].values[label] = val;
      });
    });
  } catch (err) {
    errors.push(makeError("parseBalanceSheetQuarterlyRaw.rows", err));
  }

  return { balanceSheetQuarterly: { meta, periods }, errors };
}

/* ─────────── NORMALIZED (lowerCamelCase keys) ─────────── */

export async function scrapeBalanceSheetQuarterly(
  url: string
): Promise<BalanceQuarterlyResult<Record<string, string | number | null>>> {
  const raw = await scrapeBalanceSheetQuarterlyRaw(url);
  return transformBalanceQuarterlyKeysToLowerCamel(raw);
}

function transformBalanceQuarterlyKeysToLowerCamel(
  raw: BalanceQuarterlyResult<Record<string, string | number | null>>
): BalanceQuarterlyResult<Record<string, string | number | null>> {
  const { balanceSheetQuarterly, errors } = raw;

  const out = balanceSheetQuarterly.periods.map((p) => {
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
    balanceSheetQuarterly: { meta: balanceSheetQuarterly.meta, periods: out },
    errors,
  };
}

/* ───────── STRICT (explicit lowerCamelCase keys; optional) ───────── */

export interface BalanceQuarterlyStrictValues {
  // Cash & investments
  cashAndEquivalents?: string | number | null;
  shortTermInvestments?: string | number | null;
  tradingAssetSecurities?: string | number | null;
  cashAndShortTermInvestments?: string | number | null;
  cashGrowth?: string | number | null;

  // Current assets
  accountsReceivable?: string | number | null;
  accountsReceivableNet?: string | number | null;
  inventories?: string | number | null;
  prepaidExpenses?: string | number | null;
  otherCurrentAssets?: string | number | null;
  totalCurrentAssets?: string | number | null;

  // Long-term assets
  propertyPlantAndEquipment?: string | number | null;
  propertyPlantAndEquipmentNet?: string | number | null;
  accumulatedDepreciation?: string | number | null;
  longTermInvestments?: string | number | null;
  goodwill?: string | number | null;
  intangibleAssets?: string | number | null;
  rightOfUseAssets?: string | number | null;
  deferredTaxAssets?: string | number | null;
  otherLongTermAssets?: string | number | null;
  totalAssets?: string | number | null;

  // Current liabilities
  accountsPayable?: string | number | null;
  accruedLiabilities?: string | number | null;
  shortTermDebt?: string | number | null;
  currentPortionOfLongTermDebt?: string | number | null;
  currentLeaseLiability?: string | number | null;
  otherCurrentLiabilities?: string | number | null;
  totalCurrentLiabilities?: string | number | null;

  // Long-term liabilities
  longTermDebt?: string | number | null;
  longTermLeaseLiability?: string | number | null;
  deferredRevenue?: string | number | null;
  deferredTaxLiabilities?: string | number | null;
  otherLongTermLiabilities?: string | number | null;
  totalLiabilities?: string | number | null;

  // Equity
  commonStock?: string | number | null;
  additionalPaidInCapital?: string | number | null;
  retainedEarnings?: string | number | null;
  accumulatedOtherComprehensiveIncome?: string | number | null;
  minorityInterest?: string | number | null;
  totalShareholdersEquity?: string | number | null;
  totalEquity?: string | number | null;
  liabilitiesAndShareholdersEquity?: string | number | null;

  // Per-share & misc
  sharesOutstanding?: string | number | null;
  bookValuePerShare?: string | number | null;
  workingCapital?: string | number | null;
  currentRatio?: string | number | null;
}

const BALANCE_QUARTERLY_KEYS = [
  "cashAndEquivalents",
  "shortTermInvestments",
  "tradingAssetSecurities",
  "cashAndShortTermInvestments",
  "cashGrowth",
  "accountsReceivable",
  "accountsReceivableNet",
  "inventories",
  "prepaidExpenses",
  "otherCurrentAssets",
  "totalCurrentAssets",
  "propertyPlantAndEquipment",
  "propertyPlantAndEquipmentNet",
  "accumulatedDepreciation",
  "longTermInvestments",
  "goodwill",
  "intangibleAssets",
  "rightOfUseAssets",
  "deferredTaxAssets",
  "otherLongTermAssets",
  "totalAssets",
  "accountsPayable",
  "accruedLiabilities",
  "shortTermDebt",
  "currentPortionOfLongTermDebt",
  "currentLeaseLiability",
  "otherCurrentLiabilities",
  "totalCurrentLiabilities",
  "longTermDebt",
  "longTermLeaseLiability",
  "deferredRevenue",
  "deferredTaxLiabilities",
  "otherLongTermLiabilities",
  "totalLiabilities",
  "commonStock",
  "additionalPaidInCapital",
  "retainedEarnings",
  "accumulatedOtherComprehensiveIncome",
  "minorityInterest",
  "totalShareholdersEquity",
  "totalEquity",
  "liabilitiesAndShareholdersEquity",
  "sharesOutstanding",
  "bookValuePerShare",
  "workingCapital",
  "currentRatio",
] as const;

type BalanceQuarterlyKey = (typeof BALANCE_QUARTERLY_KEYS)[number];
function isBalanceQuarterlyStrictKey(k: string): k is BalanceQuarterlyKey {
  return (BALANCE_QUARTERLY_KEYS as readonly string[]).includes(k);
}

export async function scrapeBalanceSheetQuarterlyStrict(
  url: string
): Promise<BalanceQuarterlyResult<BalanceQuarterlyStrictValues>> {
  const normalized = await scrapeBalanceSheetQuarterly(url);
  return toStrictBalanceQuarterly(normalized);
}

function toStrictBalanceQuarterly(
  normalized: BalanceQuarterlyResult<Record<string, string | number | null>>
): BalanceQuarterlyResult<BalanceQuarterlyStrictValues> {
  const { balanceSheetQuarterly, errors } = normalized;

  const periods = balanceSheetQuarterly.periods.map((p) => {
    const strictVals: BalanceQuarterlyStrictValues = {};
    for (const [k, v] of Object.entries(p.values)) {
      if (isBalanceQuarterlyStrictKey(k)) {
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
    balanceSheetQuarterly: { meta: balanceSheetQuarterly.meta, periods },
    errors,
  };
}
