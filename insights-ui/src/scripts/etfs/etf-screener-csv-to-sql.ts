/**
 * Converts an ETF screener CSV export into a .sql file that upserts
 * the ETFs into `etfs`, `etf_financial_info` and `etf_stock_analyzer_info`.
 *
 * Usage:
 *   yarn etfs:csv-to-sql --file public/screener-etf-2026-10-19.csv --exchange XETRA [--out path/to/output.sql]
 *
 * The generated SQL runs in a single transaction and is safe to re-run: ETFs are matched on
 * (space_id, symbol, exchange) and child rows on etf_id, so existing rows are updated instead of duplicated.
 */
import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import Papa from 'papaparse';
import { SPACE_ID, parseArgs } from './lib';

type CsvRow = Record<string, string>;

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

function toSymbol(raw: string): string {
  // Screener symbols are prefixed with the exchange code, e.g. "ETR:SXR8".
  return raw.trim().split(':').pop()!.trim().toUpperCase();
}

function etfIdSubquery(symbol: string, exchange: string): string {
  return `(SELECT "id" FROM "etfs" WHERE "space_id" = ${sqlText(SPACE_ID)} AND "symbol" = ${sqlText(symbol)} AND "exchange" = ${sqlText(exchange)})`;
}

function upsertChildRow(table: string, columns: string[], values: string[]): string {
  const allColumns = ['id', 'etf_id', ...columns, 'created_at', 'updated_at'];
  const updates = [...columns, 'updated_at'].map((c) => `${ident(c)} = EXCLUDED.${ident(c)}`).join(', ');
  return (
    `INSERT INTO ${ident(table)} (${allColumns.map(ident).join(', ')}) VALUES (${values.join(', ')}, NOW(), NOW())\n` +
    `  ON CONFLICT ("etf_id") DO UPDATE SET ${updates};`
  );
}

function buildEtfStatements(row: CsvRow, exchange: string): string[] {
  const symbol = toSymbol(row['Symbol']);
  const name = cleanCell(row['Fund Name']) ?? symbol;
  const inception = cleanCell(row['Inception']);
  const etfId = etfIdSubquery(symbol, exchange);

  const etf =
    `INSERT INTO "etfs" ("id", "symbol", "name", "exchange", "inception", "space_id", "created_at", "updated_at") ` +
    `VALUES (${sqlText(randomUUID())}, ${sqlText(symbol)}, ${sqlText(name)}, ${sqlText(exchange)}, ${sqlText(inception)}, ${sqlText(
      SPACE_ID
    )}, NOW(), NOW())\n` +
    `  ON CONFLICT ("space_id", "symbol", "exchange") DO UPDATE SET "name" = EXCLUDED."name", "inception" = EXCLUDED."inception", "updated_at" = EXCLUDED."updated_at";`;

  const financialInfo = upsertChildRow(
    'etf_financial_info',
    FINANCIAL_INFO_COLUMNS.map((c) => c.column),
    [sqlText(randomUUID()), etfId, ...FINANCIAL_INFO_COLUMNS.map((c) => toSqlValue(row, c, symbol))]
  );

  const stockAnalyzerInfo = upsertChildRow(
    'etf_stock_analyzer_info',
    ['symbol', ...STOCK_ANALYZER_COLUMNS.map((c) => c.column)],
    [sqlText(randomUUID()), etfId, sqlText(symbol), ...STOCK_ANALYZER_COLUMNS.map((c) => toSqlValue(row, c, symbol))]
  );

  return [`-- ${symbol}: ${name}`, etf, financialInfo, stockAnalyzerInfo, ''];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const file = typeof args.file === 'string' ? args.file : '';
  const exchange = typeof args.exchange === 'string' ? args.exchange.trim().toUpperCase() : '';
  if (!file || !exchange) {
    console.error('Usage: yarn etfs:csv-to-sql --file <screener.csv> --exchange <EXCHANGE> [--out <output.sql>]');
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
    `-- Source: ${path.basename(file)} | exchange: ${exchange} | space: ${SPACE_ID} | ETFs: ${rows.length}`,
    `-- Upserts into etfs, etf_financial_info and etf_stock_analyzer_info. Safe to re-run.`,
    '',
    'BEGIN;',
    '',
    ...rows.flatMap((row) => buildEtfStatements(row, exchange)),
    'COMMIT;',
    '',
  ];

  await writeFile(out, lines.join('\n'), 'utf8');

  if (invalidValues.length > 0) {
    console.warn(`${invalidValues.length} non-numeric value(s) stored as NULL:`);
    invalidValues.slice(0, 20).forEach((msg) => console.warn(`  ${msg}`));
  }
  console.log(`Wrote ${rows.length} ETFs (${rows.length * 3} upserts) to ${out}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
