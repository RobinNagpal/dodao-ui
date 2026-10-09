// Builds the SQL that brings `hts_codes` base rates (General / Special / Column 2) and units up to an
// HTS revision. No DB access: the SQL itself compares (IS DISTINCT FROM) and only touches rows whose
// values differ, so it is idempotent and safe to re-run.
//
// Value formats mirror the original per-chapter CSV ingest (`hts:import-chapter`, commit cca8b5131, since removed):
// rate cells trimmed, blank → NULL; "Unit of Quantity" → TEXT[] of the unit strings as published
// (e.g. {"No.","kg"}); rows matched on `hts_number` (dotted, e.g. "0101.21.00.10").

import type { HtsJsonRow } from './hts-source';
import { chunk, compareCodes, sqlText, sqlTextArray } from './sql';

export interface HtsBaseRateRow {
  htsNumber: string;
  general: string | null;
  special: string | null;
  column2: string | null;
  units: string[];
}

function nullIfEmpty(raw: string | null | undefined): string | null {
  const trimmed = (raw ?? '').trim();
  return trimmed.length === 0 ? null : trimmed;
}

/** Every numbered HTS row (4/6/8/10-digit), sorted by HTS number, first occurrence wins on duplicates. */
export function extractBaseRateRows(rows: readonly HtsJsonRow[]): { rows: HtsBaseRateRow[]; duplicates: string[] } {
  const byNumber = new Map<string, HtsBaseRateRow>();
  const duplicates: string[] = [];
  for (const row of rows) {
    const htsNumber = (row.htsno ?? '').trim();
    if (!htsNumber) continue;
    if (byNumber.has(htsNumber)) {
      duplicates.push(htsNumber);
      continue;
    }
    byNumber.set(htsNumber, {
      htsNumber,
      general: nullIfEmpty(row.general),
      special: nullIfEmpty(row.special),
      column2: nullIfEmpty(row.other),
      units: (row.units ?? []).map((u) => u.trim()).filter((u) => u.length > 0),
    });
  }
  return { rows: [...byNumber.values()].sort((a, b) => compareCodes(a.htsNumber, b.htsNumber)), duplicates };
}

/**
 * SQL statements (no BEGIN/COMMIT — the caller wraps them) that stage the edition's rows in a temp
 * table, update the differing `hts_codes` rows and SELECT the affected counts.
 */
export function buildBaseRatesSql(rows: readonly HtsBaseRateRow[], edition: string, spaceId = 'koala_gains'): string {
  const out: string[] = [];
  out.push(`-- ---------------------------------------------------------------------------`);
  out.push(`-- hts_codes base rates + units → ${edition} (${rows.length} numbered HTS rows; only differing rows change)`);
  out.push(`-- ---------------------------------------------------------------------------`);
  out.push(`CREATE TEMP TABLE tmp_hts_base_rates (`);
  out.push(`  hts_number TEXT PRIMARY KEY,`);
  out.push(`  general_rate_of_duty TEXT,`);
  out.push(`  special_rate_of_duty TEXT,`);
  out.push(`  column2_rate_of_duty TEXT,`);
  out.push(`  unit_of_quantity TEXT[] NOT NULL`);
  out.push(`) ON COMMIT DROP;`);
  out.push('');
  for (const part of chunk(rows, 1000)) {
    out.push(`INSERT INTO tmp_hts_base_rates (hts_number, general_rate_of_duty, special_rate_of_duty, column2_rate_of_duty, unit_of_quantity) VALUES`);
    out.push(
      part
        .map((r) => `  (${sqlText(r.htsNumber)}, ${sqlText(r.general)}, ${sqlText(r.special)}, ${sqlText(r.column2)}, ${sqlTextArray(r.units)})`)
        .join(',\n') + ';'
    );
  }
  out.push('');
  out.push(`WITH updated AS (`);
  out.push(`  UPDATE hts_codes h`);
  out.push(`     SET general_rate_of_duty = t.general_rate_of_duty,`);
  out.push(`         special_rate_of_duty = t.special_rate_of_duty,`);
  out.push(`         column2_rate_of_duty = t.column2_rate_of_duty,`);
  out.push(`         unit_of_quantity     = t.unit_of_quantity,`);
  out.push(`         updated_at           = now()`);
  out.push(`    FROM tmp_hts_base_rates t`);
  out.push(`   WHERE h.space_id = ${sqlText(spaceId)}`);
  out.push(`     AND h.hts_number = t.hts_number`);
  out.push(`     AND (h.general_rate_of_duty IS DISTINCT FROM t.general_rate_of_duty`);
  out.push(`       OR h.special_rate_of_duty IS DISTINCT FROM t.special_rate_of_duty`);
  out.push(`       OR h.column2_rate_of_duty IS DISTINCT FROM t.column2_rate_of_duty`);
  out.push(`       OR h.unit_of_quantity IS DISTINCT FROM t.unit_of_quantity)`);
  out.push(`  RETURNING h.hts_number`);
  out.push(`)`);
  out.push(`SELECT 'hts_codes rows updated to ${edition.replace(/'/g, "''")}' AS step, count(*) AS rows FROM updated;`);
  out.push('');
  out.push(`-- Edition rows that hts_codes does not have (new lines, or chapters never ingested) — reported, not inserted.`);
  out.push(`SELECT 'HTS rows not in hts_codes' AS step, count(*) AS rows`);
  out.push(`  FROM tmp_hts_base_rates t`);
  out.push(` WHERE NOT EXISTS (SELECT 1 FROM hts_codes h WHERE h.space_id = ${sqlText(spaceId)} AND h.hts_number = t.hts_number);`);
  out.push('');
  out.push(`-- hts_codes lines the edition no longer has (deleted/renumbered) — reported, not deleted.`);
  out.push(`SELECT 'hts_codes rows not in this edition' AS step, count(*) AS rows`);
  out.push(`  FROM hts_codes h`);
  out.push(` WHERE h.space_id = ${sqlText(spaceId)} AND h.hts_number IS NOT NULL`);
  out.push(`   AND NOT EXISTS (SELECT 1 FROM tmp_hts_base_rates t WHERE t.hts_number = h.hts_number);`);
  out.push('');
  return out.join('\n');
}
