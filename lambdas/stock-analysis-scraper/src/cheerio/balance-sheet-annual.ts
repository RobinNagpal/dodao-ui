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
  parseValueWithUnit,
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

export interface BalancePeriodRaw {
  fiscalYear: string;
  periodEnd?: string;
  values: Record<string, number | null>; // ORIGINAL label -> numeric or null
}

export interface BalanceAnnualResult<TValues = Record<string, number | null>> {
  balanceSheetAnnual: {
    meta: BalanceMeta;
    periods: Array<{
      fiscalYear: string;
      periodEnd?: string;
      values: TValues;
    }>;
  };
  errors: ScrapeError[];
}

/* ───────────── RAW (unchanged labels) ───────────── */

export async function scrapeBalanceSheetAnnualRaw(
  url: string
): Promise<BalanceAnnualResult<Record<string, number | null>>> {
  const { html, error } = await fetchHtml(url);
  if (!html) {
    return {
      balanceSheetAnnual: { meta: {}, periods: [] },
      errors: [
        error ?? {
          where: "scrapeBalanceSheetAnnualRaw",
          message: "Unknown fetch error",
        },
      ],
    };
  }
  return parseBalanceSheetAnnualRaw(html);
}

export function parseBalanceSheetAnnualRaw(
  html: Html
): BalanceAnnualResult<Record<string, number | null>> {
  const $ = load(html);
  const errors: ScrapeError[] = [];
  const meta = extractFinancialsMeta($);
  const mult = unitMultiplier(meta.unit);

  const table = $("#main-table");
  if (table.length === 0) {
    return {
      balanceSheetAnnual: { meta, periods: [] },
      errors: [
        {
          where: "parseBalanceSheetAnnualRaw",
          message: "#main-table not found",
        },
      ],
    };
  }

  const headerRows = table.find("thead tr");
  if (headerRows.length < 2) {
    return {
      balanceSheetAnnual: { meta, periods: [] },
      errors: [
        { where: "parseBalanceSheetAnnualRaw", message: "thead not found" },
      ],
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
    if (i === 0) return; // first sticky col = row label
    const text = normalizeText($(th).text());
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
      where: "parseBalanceSheetAnnualRaw",
      message: "No fiscal-year columns detected",
    });
  }

  const periods: BalancePeriodRaw[] = cols.map((c) => ({
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

        // Some rows are percentages (e.g., growth) — try % first, then number
        const val = parseValueWithUnit(text, rowLabel, mult);
        periods[colIdx].values[rowLabel] = val;
      });
    });
  } catch (err) {
    errors.push(makeError("parseBalanceSheetAnnualRaw.rows", err));
  }

  return { balanceSheetAnnual: { meta, periods }, errors };
}

/** Reuse the same meta-blurb logic as income pages */
function extractMeta($: cheerio.CheerioAPI): BalanceMeta {
  const meta: BalanceMeta = {};
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

export async function scrapeBalanceSheetAnnual(
  url: string
): Promise<BalanceAnnualResult<Record<string, number | null>>> {
  const raw = await scrapeBalanceSheetAnnualRaw(url);
  return transformBalanceKeysToLowerCamel(raw);
}

function transformBalanceKeysToLowerCamel(
  raw: BalanceAnnualResult<Record<string, number | null>>
): BalanceAnnualResult<Record<string, number | null>> {
  const { balanceSheetAnnual, errors } = raw;
  const out = balanceSheetAnnual.periods.map((p) => {
    const next: Record<string, number | null> = {};
    for (const [label, value] of Object.entries(p.values)) {
      const key = toLowerCamelKey(label);
      if (!key) continue;
      if (!(key in next) || next[key] == null) next[key] = value;
    }
    return { fiscalYear: p.fiscalYear, periodEnd: p.periodEnd, values: next };
  });

  return {
    balanceSheetAnnual: { meta: balanceSheetAnnual.meta, periods: out },
    errors,
  };
}

/* ───────── STRICT (explicit lowerCamelCase keys; optional) ───────── */

export interface BalanceAnnualStrictValues {
  // Cash & investments
  cashAndEquivalents?: number | null;
  shortTermInvestments?: number | null;
  tradingAssetSecurities?: number | null;
  cashAndShortTermInvestments?: number | null;
  cashGrowth?: number | null;

  // Current assets
  accountsReceivable?: number | null;
  accountsReceivableNet?: number | null;
  inventories?: number | null;
  prepaidExpenses?: number | null;
  otherCurrentAssets?: number | null;
  totalCurrentAssets?: number | null;

  // Long-term assets
  propertyPlantAndEquipment?: number | null;
  propertyPlantAndEquipmentNet?: number | null;
  accumulatedDepreciation?: number | null;
  longTermInvestments?: number | null;
  goodwill?: number | null;
  intangibleAssets?: number | null;
  rightOfUseAssets?: number | null;
  deferredTaxAssets?: number | null;
  otherLongTermAssets?: number | null;
  totalAssets?: number | null;

  // Current liabilities
  accountsPayable?: number | null;
  accruedLiabilities?: number | null;
  shortTermDebt?: number | null;
  currentPortionOfLongTermDebt?: number | null;
  currentLeaseLiability?: number | null;
  otherCurrentLiabilities?: number | null;
  totalCurrentLiabilities?: number | null;

  // Long-term liabilities
  longTermDebt?: number | null;
  longTermLeaseLiability?: number | null;
  deferredRevenue?: number | null;
  deferredTaxLiabilities?: number | null;
  otherLongTermLiabilities?: number | null;
  totalLiabilities?: number | null;

  // Equity
  commonStock?: number | null;
  additionalPaidInCapital?: number | null;
  retainedEarnings?: number | null;
  accumulatedOtherComprehensiveIncome?: number | null;
  minorityInterest?: number | null;
  totalShareholdersEquity?: number | null;
  totalEquity?: number | null;
  liabilitiesAndShareholdersEquity?: number | null;

  // Per-share & misc
  sharesOutstanding?: number | null;
  bookValuePerShare?: number | null;
  workingCapital?: number | null;
  currentRatio?: number | null;
}

const BALANCE_ANNUAL_KEYS = [
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

type BalanceAnnualKey = (typeof BALANCE_ANNUAL_KEYS)[number];
function isBalanceAnnualStrictKey(k: string): k is BalanceAnnualKey {
  return (BALANCE_ANNUAL_KEYS as readonly string[]).includes(k);
}

export async function scrapeBalanceSheetAnnualStrict(
  url: string
): Promise<BalanceAnnualResult<BalanceAnnualStrictValues>> {
  const normalized = await scrapeBalanceSheetAnnual(url);
  return toStrictBalanceAnnual(normalized);
}

function toStrictBalanceAnnual(
  normalized: BalanceAnnualResult<Record<string, number | null>>
): BalanceAnnualResult<BalanceAnnualStrictValues> {
  const { balanceSheetAnnual, errors } = normalized;

  const periods = balanceSheetAnnual.periods.map((p) => {
    const strictVals: BalanceAnnualStrictValues = {};
    for (const [k, v] of Object.entries(p.values)) {
      if (isBalanceAnnualStrictKey(k)) {
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
    balanceSheetAnnual: { meta: balanceSheetAnnual.meta, periods },
    errors,
  };
}
