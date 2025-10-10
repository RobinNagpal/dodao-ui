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
} from "./utils";
import * as cheerio from "cheerio";

export type Unit = "ones" | "thousands" | "millions" | "billions";
export interface IncomeMeta {
  currency?: string; // e.g., "PKR"
  unit?: Unit; // e.g., "millions"
  fiscalYearNote?: string; // e.g., "Fiscal year is July - June."
}

export interface IncomePeriod {
  fiscalYear: string; // e.g., "FY 2025"
  periodEnd?: string; // e.g., "Jun 30, 2025"
  values: Record<string, number | null>; // label -> numeric (number or %), null if missing
}

export interface IncomeAnnualResult {
  incomeStatementAnnual: {
    meta: IncomeMeta;
    periods: IncomePeriod[];
  };
  errors: ScrapeError[];
}

export async function scrapeIncomeStatementAnnual(
  url: string
): Promise<IncomeAnnualResult> {
  const { html, error } = await fetchHtml(url);
  if (!html) {
    return {
      incomeStatementAnnual: {
        meta: {},
        periods: [],
      },
      errors: [
        error ?? {
          where: "scrapeIncomeStatementAnnual",
          message: "Unknown fetch error",
        },
      ],
    };
  }
  return parseIncomeStatementAnnual(html);
}

export function parseIncomeStatementAnnual(html: Html): IncomeAnnualResult {
  const $ = load(html);
  const errors: ScrapeError[] = [];
  const meta: IncomeMeta = extractMeta($);
  const table = $("#main-table");
  if (table.length === 0) {
    return {
      incomeStatementAnnual: { meta, periods: [] },
      errors: [
        {
          where: "parseIncomeStatementAnnual",
          message: "#main-table not found",
        },
      ],
    };
  }

  // 1) Identify fiscal-year columns (skip first sticky label col + trailing "Upgrade" col)
  // We rely on the first THEAD row that contains "FY 2025", "FY 2024", etc.
  const headerRows = table.find("thead tr");
  if (headerRows.length === 0) {
    return {
      incomeStatementAnnual: { meta, periods: [] },
      errors: [
        { where: "parseIncomeStatementAnnual", message: "thead not found" },
      ],
    };
  }

  // Fiscal-year labels come from row 1 (e.g., "FY 2025") and period-end dates from row 2 (e.g., "Jun 30, 2025")
  const fyRow = headerRows.eq(0).find("th");
  const peRow = headerRows.eq(1).find("th");

  // Build column map (index in row -> fiscal-year label + period end)
  interface ColInfo {
    idx: number;
    fiscalYear: string;
    periodEnd?: string;
  }
  const cols: ColInfo[] = [];
  fyRow.each((i, th) => {
    if (i === 0) return; // first column is the row label
    const text = normalizeText($(th).text()); // "FY 2025" or "2016 - 2020" (to ignore)
    if (!/^FY\s+\d{4}/i.test(text)) return; // ignore "2016 - 2020"
    const periodEnd = peRow.eq(i).text()
      ? normalizeText(peRow.eq(i).text())
      : undefined;
    cols.push({ idx: i, fiscalYear: text, periodEnd });
  });

  if (cols.length === 0) {
    errors.push({
      where: "parseIncomeStatementAnnual",
      message: "No fiscal-year columns detected",
    });
  }

  // 2) Collect row labels and numeric/percentage values
  // Construct periods scaffold
  const periods: IncomePeriod[] = cols.map((c) => ({
    fiscalYear: c.fiscalYear,
    periodEnd: c.periodEnd,
    values: {},
  }));

  try {
    table.find("tbody tr").each((_, tr) => {
      const $tr = $(tr);
      const tds = $tr.find("td");
      if (tds.length < 2) return;

      // First cell = row label (e.g., "Revenue", "Revenue Growth (YoY)", "Gross Profit", ...)
      const $cell: cheerio.Cheerio<any> = tds.eq(0);
      const rowLabelRaw = cellText($cell, $).trim();
      const rowLabel = normalizeText(rowLabelRaw);
      if (!rowLabel) return;

      // For each fiscal-year column, read & parse the cell
      cols.forEach((c, colIdx) => {
        const cell = tds.eq(c.idx);
        if (!cell || cell.length === 0) return;

        const text = normalizeText(cell.text());

        // Skip placeholders like "Upgrade" or empty cells
        if (!text || /^upgrade$/i.test(text)) {
          periods[colIdx].values[rowLabel] = null;
          return;
        }

        // Try percentage first (e.g., "12.11%"), else number (e.g., "401,178")
        let val: number | undefined = parsePercent(text);
        if (val == null) val = parseNumberLike(text);

        // Non-numeric rows (rare) become null; we keep the label map stable
        periods[colIdx].values[rowLabel] = Number.isFinite(val as number)
          ? (val as number)
          : null;
      });
    });
  } catch (err) {
    errors.push(makeError("parseIncomeStatementAnnual.rows", err));
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
      const currencyMatch = s.match(/\b[A-Z]{3}\b/); // crude but effective (e.g., PKR, USD, EUR)
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
