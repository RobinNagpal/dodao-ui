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

export interface KpisQuarterPeriodRaw {
  fiscalQuarter: string; // "TTM" or "Q3 2025"
  periodEnd?: string; // e.g. "Sep 30, 2025"
  values: KpisSectionValues; // section -> { key: value }
}

export interface KpisQuarterlyResult<TValues = KpisSectionValues> {
  kpisQuarterly: {
    meta: KpisMeta;
    periods: Array<{
      fiscalQuarter: string;
      periodEnd?: string;
      values: TValues;
    }>;
  };
  errors: ScrapeError[];
}

/* ───────────────────── RAW (unchanged labels) ───────────────────── */

export async function scrapeKpisQuarterlyRaw(
  url: string
): Promise<KpisQuarterlyResult<KpisSectionValues>> {
  const { html, error } = await fetchHtml(url);
  if (!html) {
    return {
      kpisQuarterly: { meta: {}, periods: [] },
      errors: [
        error ?? {
          where: "scrapeKpisQuarterlyRaw",
          message: "Unknown fetch error",
        },
      ],
    };
  }
  return parseKpisQuarterlyRaw(html);
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
 * KPIs quarterly page has multiple tables under different headings (Revenue, EBIT, etc.).
 * Each table shares the same column structure (TTM, Q3 2025, Q2 2025...).
 * We want only TTM and the most recent quarter column.
 * Values showing "Log In", "Upgrade" or similar should be skipped (null).
 * Values keep their suffix (B, M, K) as displayed on the website.
 */
export function parseKpisQuarterlyRaw(
  html: Html
): KpisQuarterlyResult<KpisSectionValues> {
  const $ = load(html);
  const errors: ScrapeError[] = [];

  // Extract meta from the blurb
  const meta = extractKpisMeta($);

  // KPIs page has multiple tables, we process all of them
  const tables = $("table");

  if (tables.length === 0) {
    return {
      kpisQuarterly: { meta, periods: [] },
      errors: [
        { where: "parseKpisQuarterlyRaw", message: "No tables found on KPIs page" },
      ],
    };
  }

  // We'll collect all values into periods map
  // Key = column header (TTM, Q3 2025, etc.), Value = { fiscalQuarter, periodEnd, values: { section: { key: value } } }
  const periodsMap: Map<string, KpisQuarterPeriodRaw> = new Map();

  tables.each((tableIdx, table) => {
    const $table = $(table);

    try {
      const headerRows = $table.find("thead tr");
      if (headerRows.length === 0) return; // skip tables without proper headers

      // Get section heading for this table
      const sectionName = getSectionHeading($, $table);

      // Row 0: "Fiscal Quarter" | "TTM" | "Q3 2025" | "Q2 2025" | ...
      // Row 1: "Period Ending" | "Sep 30, 2025" | "Sep 30, 2025" | ...
      const fqRow = headerRows.eq(0).find("th");
      const peRow = headerRows.length >= 2 ? headerRows.eq(1).find("th") : null;

      interface ColInfo {
        idx: number;
        fiscalQuarter: string;
        periodEnd?: string;
      }
      const cols: ColInfo[] = [];

      fqRow.each((i, th) => {
        if (i === 0) return; // first column is row label
        const text = normalizeText($(th).text());
        
        // We want: TTM, or Q# YYYY patterns (skip ranges like "2016 - 2020")
        const isTTM = /^TTM$/i.test(text);
        const isQuarter = /^Q[1-4]\s*'?(\d{2}|\d{4})$/i.test(text);
        
        if ((isTTM || isQuarter) && !text.includes("-")) {
          const rawPe = peRow && peRow.eq(i).length > 0
            ? normalizeText(peRow.eq(i).text())
            : undefined;
          const periodEnd = cleanPeriodEnd(rawPe);
          cols.push({ idx: i, fiscalQuarter: text, periodEnd });
        }
      });

      // We only want TTM and the first quarter column (most recent)
      const ttmCol = cols.find(c => /^TTM$/i.test(c.fiscalQuarter));
      const qtrCol = cols.find(c => !/^TTM$/i.test(c.fiscalQuarter));
      const targetCols = [ttmCol, qtrCol].filter((c): c is ColInfo => c !== undefined);

      if (targetCols.length === 0) return; // no valid columns in this table

      // Initialize periods if not exists
      targetCols.forEach(c => {
        if (!periodsMap.has(c.fiscalQuarter)) {
          periodsMap.set(c.fiscalQuarter, {
            fiscalQuarter: c.fiscalQuarter,
            periodEnd: c.periodEnd,
            values: {},
          });
        }
        // Initialize section if not exists
        const period = periodsMap.get(c.fiscalQuarter)!;
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
            periodsMap.get(c.fiscalQuarter)!.values[sectionName][rowLabel] = null;
            return;
          }

          // Also check for lock icon indicator
          const hasLockIcon = cell.find('svg, .lock-icon, [data-testid="lock"]').length > 0;
          if (hasLockIcon && /^(log\s*in|upgrade|sign\s*in)$/i.test(text)) {
            periodsMap.get(c.fiscalQuarter)!.values[sectionName][rowLabel] = null;
            return;
          }

          // Keep the value as-is with its suffix (e.g., "20.36B", "417.00M", "435.83K")
          periodsMap.get(c.fiscalQuarter)!.values[sectionName][rowLabel] = text;
        });
      });
    } catch (err) {
      errors.push(makeError(`parseKpisQuarterlyRaw.table[${tableIdx}]`, err));
    }
  });

  // Convert map to array, with TTM first, then most recent quarter
  const periodsArray = Array.from(periodsMap.values());
  
  // Sort: TTM first, then by quarter descending (Q4 2025 > Q3 2025 > Q2 2025...)
  periodsArray.sort((a, b) => {
    if (/^TTM$/i.test(a.fiscalQuarter)) return -1;
    if (/^TTM$/i.test(b.fiscalQuarter)) return 1;
    
    // Parse quarter info for comparison: "Q3 2025" -> { q: 3, year: 2025 }
    const parseQtr = (s: string) => {
      const m = s.match(/Q(\d)\s*'?(\d{2,4})/i);
      if (!m) return { q: 0, year: 0 };
      const q = parseInt(m[1]);
      let year = parseInt(m[2]);
      if (year < 100) year += 2000; // '25 -> 2025
      return { q, year };
    };
    
    const qA = parseQtr(a.fiscalQuarter);
    const qB = parseQtr(b.fiscalQuarter);
    
    // Sort by year descending, then by quarter descending
    if (qA.year !== qB.year) return qB.year - qA.year;
    return qB.q - qA.q;
  });

  return { kpisQuarterly: { meta, periods: periodsArray }, errors };
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

  // Pattern: "Financials in millions USD" - extract currency only (unit is in the values themselves)
  const m = blob.match(
    /\bFinancials\s+in\s+(millions?|thousands?|billions?)\s+([A-Z]{3})\b/i
  );
  if (m) {
    meta.currency = m[2].toUpperCase();
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

export async function scrapeKpisQuarterly(
  url: string
): Promise<KpisQuarterlyResult<KpisSectionValues>> {
  const raw = await scrapeKpisQuarterlyRaw(url);
  return transformKpisQuarterlyKeysToLowerCamel(raw);
}

function transformKpisQuarterlyKeysToLowerCamel(
  raw: KpisQuarterlyResult<KpisSectionValues>
): KpisQuarterlyResult<KpisSectionValues> {
  return {
    kpisQuarterly: {
      meta: raw.kpisQuarterly.meta,
      periods: raw.kpisQuarterly.periods.map((p) => ({
        fiscalQuarter: p.fiscalQuarter,
        periodEnd: p.periodEnd,
        values: Object.fromEntries(
          Object.entries(p.values).map(([sectionName, sectionValues]) => [
            toLowerCamelKey(sectionName),
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
export async function scrapeKpisQuarterlyStrict(
  url: string
): Promise<KpisQuarterlyResult<KpisSectionValues>> {
  // For KPIs, strict = normalized (dynamic keys based on what the page has)
  return scrapeKpisQuarterly(url);
}
