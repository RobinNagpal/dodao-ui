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

export interface BalancePeriodRaw {
  fiscalYear: string;
  periodEnd?: string;
  values: Record<string, string | number | null>; // ORIGINAL label -> string (for %), number, or null
}

export interface BalanceAnnualResult<TValues = Record<string, string | number | null>> {
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
): Promise<BalanceAnnualResult<Record<string, string | number | null>>> {
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

export function parseBalanceSheetAnnualRaw(
  html: Html
): BalanceAnnualResult<Record<string, string | number | null>> {
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
      const rawPe = peRow.eq(i).text()
        ? normalizeText(peRow.eq(i).text())
        : undefined;
      const periodEnd = cleanPeriodEnd(rawPe);
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

        // Parse raw values without unit scaling
        const val = parseValueRaw(text, rowLabel);
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
): Promise<BalanceAnnualResult<Record<string, string | number | null>>> {
  const raw = await scrapeBalanceSheetAnnualRaw(url);
  return transformBalanceKeysToLowerCamel(raw);
}

function transformBalanceKeysToLowerCamel(
  raw: BalanceAnnualResult<Record<string, string | number | null>>
): BalanceAnnualResult<Record<string, string | number | null>> {
  const { balanceSheetAnnual, errors } = raw;
  const out = balanceSheetAnnual.periods.map((p) => {
    const next: Record<string, string | number | null> = {};
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
  normalized: BalanceAnnualResult<Record<string, string | number | null>>
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
