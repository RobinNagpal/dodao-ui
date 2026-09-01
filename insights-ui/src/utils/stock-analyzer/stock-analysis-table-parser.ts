import * as cheerio from 'cheerio';

/**
 * A DOM node as handed back by cheerio's `toArray()`.
 *
 * Derived from cheerio's own types rather than imported from `domhandler`,
 * which is a transitive dependency and not resolvable under pnpm's strict
 * `node_modules` layout.
 */
type DomNode = Parameters<typeof cheerio.contains>[0];

/**
 * Generic reader for the financial tables on the stock-analyze site.
 *
 * Every statement page (income statement, balance sheet, cash flow, ratios,
 * metrics) renders the same table shape, just with different rows:
 *
 * ```html
 * <thead>
 *   <tr>
 *     <th>Fiscal Quarter</th>
 *     <th id="2026-06-30">Q2 2026</th>   <!-- th id = period end date -->
 *     …
 * <tbody>
 *   <tr><td>Revenue</td><td>5,442</td>…
 * ```
 *
 * A page usually splits its rows across several such tables (e.g. the balance
 * sheet has assets / liabilities / equity / supplementary), all sharing the
 * same period columns. `parseFinancialTables` returns them separately so the
 * caller can either merge them into one flat row set (statements) or keep them
 * grouped by heading (KPIs).
 *
 * NOTE: the old Lambda scraper keyed off `#main-table`, an id the site dropped
 * in its SvelteKit redesign. That is why every statement silently became
 * `{ periods: [] }`. Nothing here depends on a generated class or id.
 */

/** A single period column of a financial table. */
export interface ParsedPeriodColumn {
  /** Column heading, e.g. `Q2 2026`, `FY 2025`, `TTM`, `Current`. */
  label: string;
  /** ISO date carried by the `<th id>`, when present — e.g. `2026-06-30`. */
  periodEnd: string | null;
}

/** A single metric row of a financial table. */
export interface ParsedTableRow {
  /** Row label as displayed, e.g. `Shares Outstanding (Diluted)`. */
  label: string;
  /** One raw cell string (or null for `-` / `n/a`) per period column. */
  cells: (string | null)[];
}

export interface ParsedFinancialTable {
  /** Nearest preceding `h1`/`h2`/`h3`, used to group the KPI tables. */
  sectionTitle: string | null;
  /** Label of the first (sticky) column, e.g. `Fiscal Quarter` / `Fiscal Year`. */
  periodColumnLabel: string | null;
  columns: ParsedPeriodColumn[];
  rows: ParsedTableRow[];
}

/** Cell contents the site uses to mean "no value". */
const EMPTY_CELL_VALUES: ReadonlySet<string> = new Set(['', '-', '--', 'n/a', 'N/A', 'Upgrade', 'Upgrade to unlock']);

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function normalizeWhitespace(text: string): string {
  // `\s` covers the non-breaking spaces the site puts between value and unit.
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Row labels on the financials *overview* page embed a second, visually hidden
 * label for the growth sub-row (`<div aria-hidden="true">Revenue Growth</div>`),
 * which would otherwise be concatenated onto the real label. Strip anything
 * hidden from the accessibility tree before reading the text.
 */
function readRowLabel($: cheerio.CheerioAPI, cell: DomNode): string {
  const clone = $(cell).clone();
  clone.find('[aria-hidden="true"], button, svg, script, style').remove();

  const rowLabel: string = normalizeWhitespace(clone.find('.row-label').first().text());
  if (rowLabel) {
    return rowLabel;
  }

  return normalizeWhitespace(clone.text());
}

function readCellValue($: cheerio.CheerioAPI, cell: DomNode): string | null {
  const text: string = normalizeWhitespace($(cell).text());
  return EMPTY_CELL_VALUES.has(text) ? null : text;
}

/**
 * Map every `<table>` on the page to the nearest heading that precedes it.
 *
 * Done with one document-order walk (rather than an index lookup per table)
 * because these pages are ~300 KB and carry tens of thousands of nodes.
 */
function buildTableSectionTitles($: cheerio.CheerioAPI): Map<DomNode, string | null> {
  const titles: Map<DomNode, string | null> = new Map();
  let currentTitle: string | null = null;

  $('h1, h2, h3, table').each((_index, element) => {
    if ((element as { tagName?: string }).tagName === 'table') {
      titles.set(element, currentTitle);
      return;
    }
    const text: string = normalizeWhitespace($(element).text());
    if (text) {
      currentTitle = text;
    }
  });

  return titles;
}

/**
 * Parse every financial table on a source-site page.
 *
 * Tables without a `<thead>` period row (nav widgets, related-stock lists) are
 * skipped, so this is safe to run over a whole page.
 */
export function parseFinancialTables(html: string): ParsedFinancialTable[] {
  const $: cheerio.CheerioAPI = cheerio.load(html);
  const sectionTitles: Map<DomNode, string | null> = buildTableSectionTitles($);
  const tables: ParsedFinancialTable[] = [];

  $('table').each((_index, table) => {
    // Statement pages stack two header rows: `Fiscal Quarter | Q2 2026 | …`
    // followed by `Period Ending | Jun 30, 2026 | …`. The first row carries the
    // period labels we key on; the ISO period-end date lives in a `<th id>` on
    // either row, so fall through the remaining rows to fill it in.
    const headerRows = $(table).find('thead tr').toArray();
    if (headerRows.length === 0) {
      return;
    }
    const headerCells = $(headerRows[0]).find('th').toArray();
    if (headerCells.length < 2) {
      return;
    }

    const periodEndAt = (columnIndex: number): string | null => {
      for (const headerRow of headerRows) {
        const cell = $(headerRow).find('th').toArray()[columnIndex + 1];
        const id: string = (cell ? $(cell).attr('id') ?? '' : '').trim();
        if (ISO_DATE_PATTERN.test(id)) {
          return id;
        }
      }
      return null;
    };

    const periodColumnLabel: string | null = normalizeWhitespace($(headerCells[0]).text()) || null;
    const columns: ParsedPeriodColumn[] = headerCells.slice(1).map((cell, columnIndex) => ({
      label: normalizeWhitespace($(cell).text()),
      periodEnd: periodEndAt(columnIndex),
    }));

    const rows: ParsedTableRow[] = [];
    $(table)
      .find('tbody tr')
      .each((_rowIndex, row) => {
        const cells = $(row).find('td').toArray();
        if (cells.length < 2) {
          return;
        }
        const label: string = readRowLabel($, cells[0]);
        if (!label) {
          return;
        }
        rows.push({
          label,
          cells: cells.slice(1).map((cell) => readCellValue($, cell)),
        });
      });

    if (rows.length === 0) {
      return;
    }

    tables.push({
      sectionTitle: sectionTitles.get(table) ?? null,
      periodColumnLabel,
      columns,
      rows,
    });
  });

  return tables;
}

/**
 * Convert a displayed cell into the value we persist.
 *
 * Plain numbers (`5,442`, `-96`, `0.61`) become numbers; percentages and other
 * suffixed values (`70.49%`, `1.45B`) stay strings so no precision or unit is
 * invented. `extractNumericValue` in the chart route strips `,` and `%` when it
 * needs a number, and the analysis prompts get the value exactly as shown on
 * the source page.
 */
export function normalizeCellValue(raw: string | null): string | number | null {
  if (raw === null) {
    return null;
  }

  // Accounting-style negatives: (1,234) => -1234
  const parenthesised: RegExpMatchArray | null = raw.match(/^\((.*)\)$/);
  const candidate: string = (parenthesised ? `-${parenthesised[1]}` : raw).replace(/,/g, '').trim();

  if (/^-?\d+(\.\d+)?$/.test(candidate)) {
    return Number(candidate);
  }

  return raw;
}

/** Convert a displayed row label into a stable camelCase object key. */
export function toValueKey(label: string): string {
  const words: string[] = label
    .replace(/&/g, ' and ')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);

  if (words.length === 0) {
    return 'unknown';
  }

  return words
    .map((word, index) => {
      const lower: string = word.toLowerCase();
      return index === 0 ? lower : lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}
