/**
 * Converts an ETF screener CSV export into a .sql file that upserts
 * the ETFs into `etfs`, `etf_financial_info` and `etf_stock_analyzer_info`.
 *
 * Usage:
 *   yarn etfs:csv-to-sql --file public/screener-etf-2026-10-19.csv --exchange XETRA [--min-aum 100000000] [--out path/to/output.sql]
 *
 * The generated SQL runs in a single transaction and is safe to re-run: ETFs are matched on
 * (space_id, symbol, exchange) and child rows on etf_id, so existing rows are updated instead of duplicated.
 *
 * One record per share class: a listing whose ISIN already belongs to another ETF (e.g. XETRA:SXR8
 * for LSE:CSPX), or that is already some ETF's alternative listing, is not inserted. It is added to
 * that ETF's `alternative_listings` instead, and its screener data is skipped so it never
 * overwrites the owning ETF's. Every inserted or refreshed ETF gets its `isin`.
 *
 * Size floor: a listing whose "Assets" value is below `--min-aum` is not inserted, though an existing
 * row for it is still refreshed. XETRA defaults to 100M (euros), because the small XETRA-only funds
 * were removed by prisma/data-sql/etfs/20261025-remove-small-unreported-xetra-etfs.sql and must not come back.
 * Pass `--min-aum 0` to import everything. Listings with no parseable "Assets" value are not filtered.
 */
import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import Papa from 'papaparse';
import { normalizeEtfIsin } from '@/utils/etf-isin-utils';
import { SPACE_ID, parseArgs } from './lib';

type CsvRow = Record<string, string>;

const DEFAULT_MIN_AUM: Record<string, number> = { XETRA: 100_000_000 };

// text: stored as-is. float: parsed number. float2: parsed number rounded to 2 decimals.
// int / bigint: parsed integer. Percent signs and thousands separators are stripped before parsing.
type ColumnKind = 'text' | 'float' | 'float2' | 'int' | 'bigint';

interface ColumnMapping {
  column: string;
  csv: string;
  kind: ColumnKind;
}

const FINANCIAL_INFO_COLUMNS: ColumnMapping[] = [
  { column: 'aum', csv: 'Assets', kind: 'text' },
  { column: 'expense_ratio', csv: 'Exp. Ratio', kind: 'float2' },
  { column: 'pe', csv: 'PE Ratio', kind: 'float2' },
  { column: 'shares_out', csv: 'Shares', kind: 'text' },
  { column: 'dividend_ttm', csv: 'Dividend', kind: 'float2' },
  { column: 'dividend_yield', csv: 'Div. Yield', kind: 'float2' },
  { column: 'payout_frequency', csv: 'Payout Freq.', kind: 'text' },
  { column: 'payout_ratio', csv: 'Payout Ratio', kind: 'float2' },
  { column: 'volume', csv: 'Volume', kind: 'float' },
  { column: 'year_high', csv: '52W High', kind: 'float2' },
  { column: 'year_low', csv: '52W Low', kind: 'float2' },
  { column: 'beta', csv: 'Beta (5Y)', kind: 'float2' },
  { column: 'holdings', csv: 'Holdings', kind: 'int' },
];

const STOCK_ANALYZER_COLUMNS: ColumnMapping[] = [
  { column: 'fund_name', csv: 'Fund Name', kind: 'text' },
  { column: 'asset_class', csv: 'Asset Class', kind: 'text' },
  { column: 'stock_price', csv: 'Stock Price', kind: 'text' },
  { column: 'percent_change', csv: '% Change', kind: 'text' },
  { column: 'isin_number', csv: 'ISIN Number', kind: 'text' },
  { column: 'cusip_number', csv: 'CUSIP Number', kind: 'text' },
  { column: 'ma_200_chg_percent', csv: '200MA Chg %', kind: 'text' },
  { column: 'ma_150_chg_percent', csv: '150MA Chg %', kind: 'text' },
  { column: 'ma_50_chg_percent', csv: '50MA Chg %', kind: 'text' },
  { column: 'ma_20_chg_percent', csv: '20MA Chg %', kind: 'text' },
  { column: 'ma_200', csv: '200 MA', kind: 'float' },
  { column: 'ma_150', csv: '150 MA', kind: 'float' },
  { column: 'ma_50', csv: '50 MA', kind: 'float' },
  { column: 'ma_20', csv: '20 MA', kind: 'float' },
  { column: 'atl_date', csv: 'ATL Date', kind: 'text' },
  { column: 'atl_chg_percent', csv: 'ATL Chg (%)', kind: 'text' },
  { column: 'atl', csv: 'ATL', kind: 'float' },
  { column: 'ath_date', csv: 'ATH Date', kind: 'text' },
  { column: 'ath_chg_percent', csv: 'ATH Chg (%)', kind: 'text' },
  { column: 'ath', csv: 'ATH', kind: 'float' },
  { column: 'low_52w_date', csv: '52W Low Date', kind: 'text' },
  { column: 'high_52w_date', csv: '52W High Date', kind: 'text' },
  { column: 'high_52w_chg', csv: '52W High Chg', kind: 'text' },
  { column: 'low_52w_chg', csv: '52W Low Chg', kind: 'text' },
  { column: 'cagr_20y', csv: 'CAGR 20Y', kind: 'text' },
  { column: 'cagr_15y', csv: 'CAGR 15Y', kind: 'text' },
  { column: 'cagr_10y', csv: 'CAGR 10Y', kind: 'text' },
  { column: 'cagr_5y', csv: 'CAGR 5Y', kind: 'text' },
  { column: 'cagr_3y', csv: 'CAGR 3Y', kind: 'text' },
  { column: 'cagr_1y', csv: 'CAGR 1Y', kind: 'text' },
  { column: 'return_20y', csv: 'Return 20Y', kind: 'text' },
  { column: 'return_15y', csv: 'Return 15Y', kind: 'text' },
  { column: 'return_10y', csv: 'Return 10Y', kind: 'text' },
  { column: 'return_5y', csv: 'Return 5Y', kind: 'text' },
  { column: 'return_3y', csv: 'Return 3Y', kind: 'text' },
  { column: 'return_1y', csv: 'Return 1Y', kind: 'text' },
  { column: 'return_ytd', csv: 'Return YTD', kind: 'text' },
  { column: 'return_6m', csv: 'Return 6M', kind: 'text' },
  { column: 'return_3m', csv: 'Return 3M', kind: 'text' },
  { column: 'return_1m', csv: 'Return 1M', kind: 'text' },
  { column: 'change_20y', csv: 'Change 20Y', kind: 'text' },
  { column: 'change_15y', csv: 'Change 15Y', kind: 'text' },
  { column: 'change_10y', csv: 'Change 10Y', kind: 'text' },
  { column: 'change_5y', csv: 'Change 5Y', kind: 'text' },
  { column: 'change_3y', csv: 'Change 3Y', kind: 'text' },
  { column: 'change_1y', csv: 'Change 1Y', kind: 'text' },
  { column: 'change_ytd', csv: 'Change YTD', kind: 'text' },
  { column: 'change_6m', csv: 'Change 6M', kind: 'text' },
  { column: 'change_3m', csv: 'Change 3M', kind: 'text' },
  { column: 'change_1m', csv: 'Change 1M', kind: 'text' },
  { column: 'change_1w', csv: 'Change 1W', kind: 'text' },
  { column: 'leverage', csv: 'Leverage', kind: 'text' },
  { column: 'region', csv: 'Region', kind: 'text' },
  { column: 'payment_date', csv: 'Payment Date', kind: 'text' },
  { column: 'ex_div_date', csv: 'Ex-Div Date', kind: 'text' },
  { column: 'div_growth_10y', csv: 'Div. Growth 10Y', kind: 'text' },
  { column: 'div_growth_5y', csv: 'Div. Growth 5Y', kind: 'text' },
  { column: 'div_growth_3y', csv: 'Div. Growth 3Y', kind: 'text' },
  { column: 'div_years', csv: 'Div. Years', kind: 'int' },
  { column: 'div_gr_years', csv: 'Div. Gr. Years', kind: 'int' },
  { column: 'div_growth', csv: 'Div. Growth', kind: 'text' },
  { column: 'last_div', csv: 'Last Div.', kind: 'float' },
  { column: 'div_dollars', csv: 'Dividend', kind: 'float' },
  { column: 'sortino', csv: 'Sortino', kind: 'float' },
  { column: 'atr', csv: 'ATR', kind: 'float' },
  { column: 'sharpe', csv: 'Sharpe', kind: 'float' },
  { column: 'index', csv: 'Index', kind: 'text' },
  { column: 'price_curr', csv: 'Price Curr.', kind: 'text' },
  { column: 'beta_1y', csv: 'Beta (1Y)', kind: 'float' },
  { column: 'beta_2y', csv: 'Beta (2Y)', kind: 'float' },
  { column: 'beta_5y', csv: 'Beta (5Y)', kind: 'float' },
  { column: 'rsi', csv: 'RSI', kind: 'float' },
  { column: 'rsi_w', csv: 'RSI (W)', kind: 'float' },
  { column: 'rsi_m', csv: 'RSI (M)', kind: 'float' },
  { column: 'issuer', csv: 'Issuer', kind: 'text' },
  { column: 'category', csv: 'Category', kind: 'text' },
  { column: 'chg_open_percent', csv: 'Chg. Open (%)', kind: 'text' },
  { column: 'position_in_range', csv: 'Pos. Range', kind: 'text' },
  { column: 'open', csv: 'Open', kind: 'float' },
  { column: 'low', csv: 'Low', kind: 'float' },
  { column: 'high', csv: 'High', kind: 'float' },
  { column: 'prev_close', csv: 'Prev. Close', kind: 'float' },
  { column: 'price_date', csv: 'Price Date', kind: 'text' },
  { column: 'gap_percent', csv: 'Gap (%)', kind: 'text' },
  { column: 'rel_volume', csv: 'Rel. Volume', kind: 'text' },
  { column: 'avg_volume', csv: 'Avg. Volume', kind: 'bigint' },
  { column: 'dollar_vol', csv: 'Dollar Vol.', kind: 'bigint' },
];

const REQUIRED_CSV_HEADERS = ['Symbol', 'Fund Name', 'Inception', ...FINANCIAL_INFO_COLUMNS.map((c) => c.csv), ...STOCK_ANALYZER_COLUMNS.map((c) => c.csv)];

const invalidValues: string[] = [];

function sqlText(value: string | null): string {
  return value === null ? 'NULL' : `'${value.replace(/'/g, "''")}'`;
}

function ident(name: string): string {
  return `"${name}"`;
}

function cleanCell(raw: string | undefined): string | null {
  const value = (raw ?? '').trim();
  return value === '' || value === '-' ? null : value;
}

function toSqlValue(row: CsvRow, mapping: ColumnMapping, symbol: string): string {
  const value = cleanCell(row[mapping.csv]);
  if (value === null || mapping.kind === 'text') return sqlText(value);

  const num = Number(value.replace(/[,%]/g, ''));
  if (!Number.isFinite(num)) {
    invalidValues.push(`${symbol}: "${mapping.csv}" = "${value}" is not a number, stored as NULL`);
    return 'NULL';
  }
  switch (mapping.kind) {
    case 'float':
      return String(num);
    case 'float2':
      return String(Math.round(num * 100) / 100);
    case 'int':
    case 'bigint':
      return String(Math.round(num));
  }
}

/** Screener "Assets" as a number: plain ("27339531") or abbreviated ("$190.08M"). Null when unparseable. */
function parseAum(raw: string | undefined): number | null {
  const value = cleanCell(raw);
  if (value === null) return null;
  const match = value.replace(/[$€£,\s]/g, '').match(/^([0-9]+(?:\.[0-9]+)?)([KMBT])?$/i);
  if (!match) return null;
  const multiplier: Record<string, number> = { K: 1e3, M: 1e6, B: 1e9, T: 1e12 };
  return Number(match[1]) * (match[2] ? multiplier[match[2].toUpperCase()] : 1);
}

function toSymbol(raw: string): string {
  // Screener symbols are prefixed with the exchange code, e.g. "ETR:SXR8".
  return raw.trim().split(':').pop()!.trim().toUpperCase();
}

function etfIdSubquery(symbol: string, exchange: string): string {
  return `(SELECT "id" FROM "etfs" WHERE "space_id" = ${sqlText(SPACE_ID)} AND "symbol" = ${sqlText(symbol)} AND "exchange" = ${sqlText(exchange)})`;
}

/** Upserts a child row keyed on etf_id; a no-op when the listing has no `etfs` row of its own. */
function upsertChildRow(table: string, columns: string[], etfId: string, values: string[]): string {
  const allColumns = ['id', 'etf_id', ...columns, 'created_at', 'updated_at'];
  const updates = [...columns, 'updated_at'].map((c) => `${ident(c)} = EXCLUDED.${ident(c)}`).join(', ');
  return (
    `INSERT INTO ${ident(table)} (${allColumns.map(ident).join(', ')}) SELECT ${values.join(', ')}, NOW(), NOW() WHERE ${etfId} IS NOT NULL\n` +
    `  ON CONFLICT ("etf_id") DO UPDATE SET ${updates};`
  );
}

function buildEtfStatements(row: CsvRow, exchange: string, minAum: number): string[] {
  const symbol = toSymbol(row['Symbol']);
  const name = cleanCell(row['Fund Name']) ?? symbol;
  const inception = cleanCell(row['Inception']);
  const isin = normalizeEtfIsin(row['ISIN Number']);
  const etfId = etfIdSubquery(symbol, exchange);
  const space = sqlText(SPACE_ID);

  // This exchange/symbol as an `alternative_listings` entry, and the checks that decide whether it
  // gets its own row: it already has one, it is already another ETF's alternative listing, or its
  // ISIN already belongs to another ETF.
  const listing = `jsonb_build_array(jsonb_build_object('exchange', ${sqlText(exchange)}, 'symbol', ${sqlText(symbol)}))`;
  const hasOwnRow = `EXISTS (SELECT 1 FROM "etfs" WHERE "space_id" = ${space} AND "symbol" = ${sqlText(symbol)} AND "exchange" = ${sqlText(exchange)})`;
  const isAlternativeListing = `EXISTS (SELECT 1 FROM "etfs" WHERE "space_id" = ${space} AND "alternative_listings" @> ${listing})`;
  const isinTaken = isin ? `EXISTS (SELECT 1 FROM "etfs" WHERE "space_id" = ${space} AND "isin" = ${sqlText(isin)})` : 'FALSE';
  // Below the size floor a listing is only refreshed if it already has a row, never inserted.
  const aum = parseAum(row['Assets']);
  const belowMinAum = aum !== null && aum < minAum;
  const insertCondition = belowMinAum ? hasOwnRow : `${hasOwnRow} OR NOT (${isAlternativeListing} OR ${isinTaken})`;

  const etf =
    `INSERT INTO "etfs" ("id", "symbol", "name", "exchange", "inception", "isin", "space_id", "created_at", "updated_at") ` +
    `SELECT ${sqlText(randomUUID())}, ${sqlText(symbol)}, ${sqlText(name)}, ${sqlText(exchange)}, ${sqlText(inception)}, ${sqlText(
      isin
    )}, ${space}, NOW(), NOW()\n` +
    `  WHERE ${insertCondition}\n` +
    `  ON CONFLICT ("space_id", "symbol", "exchange") DO UPDATE SET "name" = EXCLUDED."name", "inception" = EXCLUDED."inception", ` +
    `"isin" = COALESCE(EXCLUDED."isin", "etfs"."isin"), "updated_at" = EXCLUDED."updated_at";`;

  // Not inserted because its ISIN belongs to another ETF: record it as that ETF's alternative listing.
  // When several rows share the ISIN (duplicates that already had reports), the one that already
  // holds alternative listings wins, then the one with a report, then the oldest.
  const alternative = isin
    ? `UPDATE "etfs" SET "alternative_listings" = "alternative_listings" || ${listing}, "updated_at" = NOW()\n` +
      `  WHERE "id" = (SELECT o."id" FROM "etfs" o WHERE o."space_id" = ${space} AND o."isin" = ${sqlText(isin)}\n` +
      `                ORDER BY jsonb_array_length(o."alternative_listings") > 0 DESC, EXISTS (SELECT 1 FROM "etf_cached_scores" s WHERE s."etf_id" = o."id") DESC, o."created_at", o."id" LIMIT 1)\n` +
      `  AND NOT ${hasOwnRow} AND NOT ${isAlternativeListing};`
    : null;

  const financialInfo = upsertChildRow(
    'etf_financial_info',
    FINANCIAL_INFO_COLUMNS.map((c) => c.column),
    etfId,
    [sqlText(randomUUID()), etfId, ...FINANCIAL_INFO_COLUMNS.map((c) => toSqlValue(row, c, symbol))]
  );

  const stockAnalyzerInfo = upsertChildRow('etf_stock_analyzer_info', ['symbol', ...STOCK_ANALYZER_COLUMNS.map((c) => c.column)], etfId, [
    sqlText(randomUUID()),
    etfId,
    sqlText(symbol),
    ...STOCK_ANALYZER_COLUMNS.map((c) => toSqlValue(row, c, symbol)),
  ]);

  const comment = `-- ${symbol}: ${name}${isin ? ` (${isin})` : ''}${belowMinAum ? ' [below --min-aum: refresh only]' : ''}`;
  return [comment, etf, ...(alternative ? [alternative] : []), financialInfo, stockAnalyzerInfo, ''];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const file = typeof args.file === 'string' ? args.file : '';
  const exchange = typeof args.exchange === 'string' ? args.exchange.trim().toUpperCase() : '';
  if (!file || !exchange) {
    console.error('Usage: yarn etfs:csv-to-sql --file <screener.csv> --exchange <EXCHANGE> [--min-aum <assets>] [--out <output.sql>]');
    process.exit(1);
  }
  const minAum = typeof args['min-aum'] === 'string' ? Number(args['min-aum']) : DEFAULT_MIN_AUM[exchange] ?? 0;
  if (!Number.isFinite(minAum) || minAum < 0) {
    console.error(`--min-aum must be a non-negative number, got "${args['min-aum']}"`);
    process.exit(1);
  }
  const out = typeof args.out === 'string' ? args.out : file.replace(/\.csv$/i, '') + '.sql';

  const content = (await readFile(file, 'utf8')).replace(/^﻿/, '');
  const parsed = Papa.parse<CsvRow>(content, { header: true, skipEmptyLines: true });
  if (parsed.errors.length > 0) {
    throw new Error(`CSV parse errors:\n${parsed.errors.map((e) => `  row ${e.row}: ${e.message}`).join('\n')}`);
  }

  const headers = parsed.meta.fields ?? [];
  const missingHeaders = REQUIRED_CSV_HEADERS.filter((h) => !headers.includes(h));
  if (missingHeaders.length > 0) {
    throw new Error(`CSV is missing expected columns: ${missingHeaders.join(', ')}`);
  }

  const seen = new Set<string>();
  const rows = parsed.data.filter((row) => {
    const symbol = cleanCell(row['Symbol']);
    if (!symbol) return false;
    const key = toSymbol(symbol);
    if (seen.has(key)) {
      console.warn(`Skipping duplicate symbol ${key}`);
      return false;
    }
    seen.add(key);
    return true;
  });

  const lines = [
    `-- Generated by src/scripts/etfs/etf-screener-csv-to-sql.ts on ${new Date().toISOString()}`,
    `-- Source: ${path.basename(file)} | exchange: ${exchange} | space: ${SPACE_ID} | ETFs: ${rows.length} | min AUM: ${minAum}`,
    `-- Upserts into etfs, etf_financial_info and etf_stock_analyzer_info. Listings of a share class (ISIN) that`,
    `-- another ETF already owns are added to its alternative_listings instead. Safe to re-run.`,
    '',
    'BEGIN;',
    '',
    ...rows.flatMap((row) => buildEtfStatements(row, exchange, minAum)),
    'COMMIT;',
    '',
  ];

  await writeFile(out, lines.join('\n'), 'utf8');

  if (invalidValues.length > 0) {
    console.warn(`${invalidValues.length} non-numeric value(s) stored as NULL:`);
    invalidValues.slice(0, 20).forEach((msg) => console.warn(`  ${msg}`));
  }
  const belowFloor = minAum > 0 ? rows.filter((row) => (parseAum(row['Assets']) ?? Infinity) < minAum).length : 0;
  if (belowFloor > 0) console.log(`${belowFloor} listing(s) below --min-aum ${minAum}: refreshed if they already exist, never inserted.`);
  console.log(`Wrote ${rows.length} ETFs (${rows.length * 3} upserts) to ${out}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
