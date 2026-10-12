import type { TariffProductGroup, TariffRateTableRow } from '@/types/tariff-chapter-prototype';

// The chapter rate table as an accordion of 4-digit headings (issue #1819). Pure helpers, shared by
// the server-rendered overview (heading tiles) and the client rate table.

// A heading's rate summary lists every distinct rate ("Free · 5% · 4.2% · 40¢/kg + 10.4% · …"),
// which turns into noise past a few. Tiles and heading rows show the first three; the lines have them all.
const MAX_SUMMARY_RATES = 3;

/** "Free · 6.8% · 4.4¢/kg · 2% · 1%" → "Free · 6.8% · 4.4¢/kg · +2 more". */
export function shortRateSummary(summary: string): string {
  const rates = summary.split(' · ');
  if (rates.length <= MAX_SUMMARY_RATES) return summary;
  return `${rates.slice(0, MAX_SUMMARY_RATES).join(' · ')} · +${rates.length - MAX_SUMMARY_RATES} more`;
}

/** Chapters with at most this many 10-digit lines open with every heading expanded. */
export const EXPAND_ALL_MAX_LINES = 40;

export interface RateTableHeadingGroup {
  /** Four-digit heading, e.g. "0102". */
  heading: string;
  /** Short plain name from the product groups, e.g. "Cattle & buffalo". */
  label: string;
  /** The heading's official wording, e.g. "Live bovine animals" (no trailing colon). */
  description: string;
  /** Short rate summary, e.g. "Free · 1¢/kg". */
  rateSummary: string;
  /** 10-digit lines in the heading. */
  lineCount: number;
  /**
   * The heading's rows for the table body. The heading's own grouping row is left out — the
   * group's toggle row shows its code and wording — unless it is itself a rated line
   * (e.g. 0205.00.00.00), in which case it stays.
   */
  rows: TariffRateTableRow[];
}

function cleanDescription(description: string): string {
  return description.replace(/:\s*$/, '').trim();
}

/** Splits the rate table into its 4-digit headings, in schedule order. */
export function groupRowsByHeading(rows: TariffRateTableRow[], productGroups: TariffProductGroup[]): RateTableHeadingGroup[] {
  const groupInfo = new Map(productGroups.map((group) => [group.heading, group]));
  const byHeading = new Map<string, TariffRateTableRow[]>();
  for (const row of rows) {
    // Every migrated chapter sets `heading` on every row; fall back to the code just in case.
    const heading = row.heading ?? row.hts?.slice(0, 4) ?? 'other';
    const list = byHeading.get(heading);
    if (list) list.push(row);
    else byHeading.set(heading, [row]);
  }

  return Array.from(byHeading, ([heading, headingRows]) => {
    const headingRow = headingRows.find((row) => row.indent === 0) ?? headingRows[0];
    const info = groupInfo.get(heading);
    const description = cleanDescription(headingRow.description);
    const lineCount = headingRows.filter((row) => row.htsCode10).length;
    const rates = Array.from(new Set(headingRows.filter((row) => row.htsCode10 && row.effectiveGeneral).map((row) => row.effectiveGeneral as string)));
    return {
      heading,
      label: info?.label ?? description,
      description,
      rateSummary: shortRateSummary(info?.rateSummary ?? rates.join(' · ')),
      lineCount: info?.lineCount ?? lineCount,
      rows: headingRows.filter((row) => !(row === headingRow && row.isHeaderRow && !row.effectiveGeneral)),
    };
  });
}

/**
 * Parses an anchor such as "0102", "0102.29.40.54" or "0102294054" into the heading to open and,
 * for a line anchor, the row to scroll to. Returns null for anything else.
 */
export function parseRateTableAnchor(hash: string, groups: RateTableHeadingGroup[]): { heading: string; row: TariffRateTableRow | null } | null {
  let digits: string;
  try {
    digits = decodeURIComponent(hash.replace(/^#/, '')).replace(/\./g, '');
  } catch {
    return null;
  }
  if (!/^\d{4}(\d{2}){0,3}$/.test(digits)) return null;
  const group = groups.find((g) => g.heading === digits.slice(0, 4));
  if (!group) return null;
  if (digits.length === 4) return { heading: group.heading, row: null };
  const row = group.rows.find((r) => r.hts?.replace(/\./g, '') === digits) ?? null;
  return { heading: group.heading, row };
}
