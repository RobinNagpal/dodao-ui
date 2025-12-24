import {
  fetchHtml,
  load,
  normalizeText,
  cellText,
  makeError,
  ScrapeError,
  Html,
  toLowerCamelKey,
} from "./utils";
import * as cheerio from "cheerio";

export interface KpisMeta {
  currency?: string; // e.g. "USD"
  fiscalYearNote?: string;
}

/** Values grouped by section heading */
export interface KpisSectionValues {
  [sectionName: string]: Record<string, string | null>; // key -> value with suffix (e.g. "20.36B")
}

export interface KpisPeriodRaw {
  fiscalYear: string; // "TTM" or "FY 2024"
  periodEnd?: string; // e.g. "Sep 30, 2025"
  values: KpisSectionValues; // section -> { key: value }
}

export interface KpisAnnualResult<TValues = KpisSectionValues> {
  kpisAnnual: {
    meta: KpisMeta;
    periods: Array<{
      fiscalYear: string;
      periodEnd?: string;
      values: TValues;
    }>;
  };
  errors: ScrapeError[];
}

/* ───────────────────── RAW (unchanged labels) ───────────────────── */

export async function scrapeKpisAnnualRaw(
  url: string
): Promise<KpisAnnualResult<KpisSectionValues>> {
  const { html, error } = await fetchHtml(url);
  if (!html) {
    return {
      kpisAnnual: { meta: {}, periods: [] },
      errors: [
        error ?? {
          where: "scrapeKpisAnnualRaw",
          message: "Unknown fetch error",
        },
      ],
    };
  }
  return parseKpisAnnualRaw(html);
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

/**
 * Get section heading for a table.
 * Walks backwards through the DOM to find the preceding h1 or h2 element.
 * Structure: sections are typically wrapped in divs with h1/h2 as the heading.
 */
function getSectionHeading($: cheerio.CheerioAPI, $table: cheerio.Cheerio<any>): string {
  let heading = "";
  
  // Strategy 1: Look for h1/h2 inside the same parent container (section wrapper)
  // The table is usually wrapped in a div that also contains the heading
  const $wrapper = $table.parent();
  if ($wrapper.length > 0) {
    // Check for heading before the table within the same wrapper
    const $prevAll = $table.prevAll('h1, h2');
    if ($prevAll.length > 0) {
      heading = $prevAll.first().text();
    }
    
    // Also check if heading is inside a flex container or button group before the table
    if (!heading) {
      $table.prevAll().each((_, el) => {
        const $el = $(el);
        const $h = $el.find('h1, h2').first();
        if ($h.length > 0) {
          heading = $h.text();
          return false; // break
        }
        // Check if the element itself is a heading
        if ($el.is('h1, h2')) {
          heading = $el.text();
          return false; // break
        }
      });
    }
  }
  
  // Strategy 2: Walk up the DOM and look for headings in parent containers
  if (!heading) {
    let $current = $table.parent();
    let maxDepth = 5; // Limit how far we go up
    while ($current.length > 0 && maxDepth-- > 0) {
      // Look for h1/h2 as a direct child of this container, before the table's wrapper
      const $headings = $current.children('h1, h2');
      if ($headings.length > 0) {
        // Get the last heading that comes before our table wrapper
        const tableIdx = $current.children().index($table.parent());
        $headings.each((_, h) => {
          const hIdx = $current.children().index($(h).closest($current.children()));
          if (hIdx < tableIdx || tableIdx === -1) {
            heading = $(h).text();
          }
        });
        if (heading) break;
      }
      
      // Also check inside child divs for headings
      const $childHeadings = $current.children().find('h1, h2');
      if ($childHeadings.length > 0) {
        heading = $childHeadings.first().text();
        if (heading) break;
      }
      
      $current = $current.parent();
    }
  }
  
  // Strategy 3: Use document order - find all h1/h2 and tables, match by position
  if (!heading) {
    const allHeadings: { el: cheerio.Cheerio<any>; text: string }[] = [];
    const allTables: cheerio.Cheerio<any>[] = [];
    
    $('h1, h2').each((_, h) => {
      const text = normalizeText($(h).text());
      // Filter to relevant section headings (skip things like page title, nav items)
      if (text && !text.includes('Tesla') && !text.includes('TSLA') && text.length < 50) {
        allHeadings.push({ el: $(h), text });
      }
    });
    
    $('table').each((_, t) => {
      allTables.push($(t));
    });
    
    // Find table index
    const tableIdx = allTables.findIndex(t => t.is($table));
    
    // Match heading to table by relative position in document
    if (tableIdx >= 0 && allHeadings.length > 0) {
      // Find the heading that comes just before this table
      // by checking DOM positions
      for (let i = allHeadings.length - 1; i >= 0; i--) {
        const hEl = allHeadings[i].el;
        // Compare document positions using index in flattened view
        const hPos = $('*').index(hEl);
        const tPos = $('*').index($table);
        if (hPos < tPos) {
          heading = allHeadings[i].text;
          break;
        }
      }
    }
  }
  
  return normalizeText(heading || "Other");
}

/**
 * KPIs page has multiple tables under different headings (Revenue, EBIT, etc.).
 * Each table shares the same column structure (TTM, FY 2024, FY 2023...).
 * We want only TTM and the most recent FY column.
 * Values showing "Log In", "Upgrade" or similar should be skipped (null).
 * Values keep their suffix (B, M, K) as displayed on the website.
 */
export function parseKpisAnnualRaw(
  html: Html
): KpisAnnualResult<KpisSectionValues> {
  const $ = load(html);
  const errors: ScrapeError[] = [];

  // Extract meta from the blurb
  const meta = extractKpisMeta($);

  // KPIs page has multiple tables, we process all of them
  const tables = $("table");

  if (tables.length === 0) {
    return {
      kpisAnnual: { meta, periods: [] },
      errors: [
        { where: "parseKpisAnnualRaw", message: "No tables found on KPIs page" },
      ],
    };
  }

  // We'll collect all values into periods map
  // Key = column header (TTM, FY 2024, etc.), Value = { fiscalYear, periodEnd, values: { section: { key: value } } }
  const periodsMap: Map<string, KpisPeriodRaw> = new Map();

  tables.each((tableIdx, table) => {
    const $table = $(table);

    try {
      const headerRows = $table.find("thead tr");
      if (headerRows.length === 0) return; // skip tables without proper headers

      // Get section heading for this table
      const sectionName = getSectionHeading($, $table);

      // Row 0: "Fiscal Year" | "TTM" | "FY 2024" | "FY 2023" | ...
      // Row 1: "Period Ending" | "Sep 30, 2025" | "Dec 31, 2024" | ...
      const fyRow = headerRows.eq(0).find("th");
      const peRow = headerRows.length >= 2 ? headerRows.eq(1).find("th") : null;

      interface ColInfo {
        idx: number;
        fiscalYear: string;
        periodEnd?: string;
      }
      const cols: ColInfo[] = [];

      fyRow.each((i, th) => {
        if (i === 0) return; // first column is row label
        const text = normalizeText($(th).text());
        
        // We want: TTM, or FY YYYY patterns (skip ranges like "2016 - 2020")
        const isTTM = /^TTM$/i.test(text);
        const isFY = /^FY\s*'?(\d{2}|\d{4})$/i.test(text) || /^\d{4}$/.test(text);
        
        if ((isTTM || isFY) && !text.includes("-")) {
          const rawPe = peRow && peRow.eq(i).length > 0
            ? normalizeText(peRow.eq(i).text())
            : undefined;
          const periodEnd = cleanPeriodEnd(rawPe);
          cols.push({ idx: i, fiscalYear: text, periodEnd });
        }
      });

      // We only want TTM and the first FY column (most recent)
      const ttmCol = cols.find(c => /^TTM$/i.test(c.fiscalYear));
      const fyCol = cols.find(c => !/^TTM$/i.test(c.fiscalYear));
      const targetCols = [ttmCol, fyCol].filter((c): c is ColInfo => c !== undefined);

      if (targetCols.length === 0) return; // no valid columns in this table

      // Initialize periods if not exists
      targetCols.forEach(c => {
        if (!periodsMap.has(c.fiscalYear)) {
          periodsMap.set(c.fiscalYear, {
            fiscalYear: c.fiscalYear,
            periodEnd: c.periodEnd,
            values: {},
          });
        }
        // Initialize section if not exists
        const period = periodsMap.get(c.fiscalYear)!;
        if (!period.values[sectionName]) {
          period.values[sectionName] = {};
        }
      });

      // Parse data rows
      $table.find("tbody tr").each((_, tr) => {
        const $tr = $(tr);
        const tds = $tr.find("td");
        if (tds.length < 2) return;

        const rowLabel = normalizeText(cellText(tds.eq(0), $).trim());
        if (!rowLabel) return;

        targetCols.forEach(c => {
          const cell = tds.eq(c.idx);
          if (!cell || cell.length === 0) return;

          const text = normalizeText(cell.text());
          
          // Skip locked values: "Log In", "Upgrade", empty
          if (!text || /^(log\s*in|upgrade|sign\s*in|\*|-)$/i.test(text)) {
            periodsMap.get(c.fiscalYear)!.values[sectionName][rowLabel] = null;
            return;
          }

          // Also check for lock icon indicator (some cells have 🔒 icon)
          const hasLockIcon = cell.find('svg, .lock-icon, [data-testid="lock"]').length > 0;
          if (hasLockIcon && /^(log\s*in|upgrade|sign\s*in)$/i.test(text)) {
            periodsMap.get(c.fiscalYear)!.values[sectionName][rowLabel] = null;
            return;
          }

          // Keep the value as-is with its suffix (e.g., "20.36B", "417.00M", "435.83K")
          periodsMap.get(c.fiscalYear)!.values[sectionName][rowLabel] = text;
        });
      });
    } catch (err) {
      errors.push(makeError(`parseKpisAnnualRaw.table[${tableIdx}]`, err));
    }
  });

  // Convert map to array, with TTM first, then FY
  const periodsArray = Array.from(periodsMap.values());
  
  // Sort: TTM first, then by fiscal year descending
  periodsArray.sort((a, b) => {
    if (/^TTM$/i.test(a.fiscalYear)) return -1;
    if (/^TTM$/i.test(b.fiscalYear)) return 1;
    // Extract year for comparison
    const yearA = parseInt(a.fiscalYear.replace(/\D/g, '')) || 0;
    const yearB = parseInt(b.fiscalYear.replace(/\D/g, '')) || 0;
    return yearB - yearA; // descending
  });

  return { kpisAnnual: { meta, periods: periodsArray }, errors };
}

/** Extract metadata for KPIs pages */
function extractKpisMeta($: cheerio.CheerioAPI): KpisMeta {
  const meta: KpisMeta = {};

  // Look for blurbs like "Financials in millions USD. Fiscal year is January - December."
  const texts: string[] = [];
  
  // Check for text-faded elements which typically contain the meta info
  $(".text-faded, .text-muted, .text-gray-500").each((_, el) => {
    const t = normalizeText($(el).text());
    if (t && (t.includes("Financials") || t.includes("Fiscal") || t.includes("Currency"))) {
      texts.push(t);
    }
  });

  const blob = normalizeText(texts.join(" "));

  // Pattern: "Financials in millions USD" - extract currency only (no unit since values have suffixes)
  const m = blob.match(
    /\bFinancials\s+in\s+(?:millions?|thousands?|billions?)\s+([A-Z]{3})\b/i
  );
  if (m) {
    meta.currency = m[1].toUpperCase();
  }

  // Secondary currency: "Currency is USD"
  if (!meta.currency) {
    const m2 = blob.match(/\bCurrency\s+is\s+([A-Z]{3})\b/i);
    if (m2) meta.currency = m2[1].toUpperCase();
  }

  // Fiscal year note
  const fy = blob.match(/fiscal year is[^.]+(?:\.)?/i);
  if (fy) meta.fiscalYearNote = normalizeText(fy[0]);

  return meta;
}

/* ───────────── NORMALIZED (lowerCamelCase keys) ───────────── */

export async function scrapeKpisAnnual(
  url: string
): Promise<KpisAnnualResult<KpisSectionValues>> {
  const raw = await scrapeKpisAnnualRaw(url);
  return transformKpisKeysToLowerCamel(raw);
}

function transformKpisKeysToLowerCamel(
  raw: KpisAnnualResult<KpisSectionValues>
): KpisAnnualResult<KpisSectionValues> {
  return {
    kpisAnnual: {
      meta: raw.kpisAnnual.meta,
      periods: raw.kpisAnnual.periods.map((p) => ({
        fiscalYear: p.fiscalYear,
        periodEnd: p.periodEnd,
        values: Object.fromEntries(
          Object.entries(p.values).map(([section, sectionValues]) => [
            toLowerCamelKey(section),
            Object.fromEntries(
              Object.entries(sectionValues).map(([k, v]) => [toLowerCamelKey(k), v])
            ),
          ])
        ),
      })),
    },
    errors: raw.errors,
  };
}

/* ───────────── STRICT (keep dynamic keys - KPIs vary by stock) ───────────── */

/**
 * Note: KPIs have dynamic keys that vary by stock type (e.g., Tesla has "Automotive Sales Revenue"
 * while AVB has "Total Same-Store Revenue"). Therefore, we keep the dynamic normalized keys
 * rather than filtering to a fixed allowlist.
 */
export async function scrapeKpisAnnualStrict(
  url: string
): Promise<KpisAnnualResult<KpisSectionValues>> {
  // For KPIs, strict = normalized (dynamic keys based on what the page has)
  return scrapeKpisAnnual(url);
}
