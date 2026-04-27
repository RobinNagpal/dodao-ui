/**
 * Convert an ETF screener CSV/TSV (e.g. `public/canada-etf`) into a `.sql`
 * file with raw INSERTs for `etfs`, `etf_financial_info`, and
 * `etf_stock_analyzer_info`. The output is intended to be run directly in
 * pgAdmin against a local or production DB — no API or Prisma client is
 * involved, so it works regardless of whether the app code is deployed.
 *
 * Usage:
 *   yarn etfs:csv-to-sql                       # reads public/canada-etf, writes public/canada-etf.sql
 *   yarn etfs:csv-to-sql --in <path> --out <path>
 *
 * Notes on input shape:
 *   - The "Symbol" column is expected to be `EXCHANGE:TICKER` (e.g. `TSX:VFV`,
 *     `NEO:FEQT`). The prefix sets the exchange code (with `CBOE` mapped to
 *     `NEO` for Cboe Canada). Bare-ticker rows fall back to the "Exchange"
 *     column ("Toronto Stock Exchange" → TSX, "Cboe Canada" → NEO, etc.).
 *   - Empty / "N/A" / "-" cells are written as SQL NULL.
 *   - Numeric percentages (e.g. "79.41%") are kept as strings for fields the
 *     schema declares as `String?`; for `Float?` columns they're stripped of
 *     `$`, `,`, `%` before parsing.
 */

import 'dotenv/config';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import Papa from 'papaparse';
import { CanadaExchanges, USExchanges } from '@/utils/countryExchangeUtils';

const SPACE_ID = 'koala_gains';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const DEFAULT_IN = path.join(REPO_ROOT, 'public', 'canada-etf');
const DEFAULT_OUT = path.join(REPO_ROOT, 'public', 'canada-etf.sql');

/**
 * Maps the "Exchange" column in the CSV to the exchange code we store in the DB.
 * Used as a fallback when the symbol itself doesn't carry a prefix.
 */
const EXCHANGE_NAME_TO_CODE: Record<string, string> = {
  'Toronto Stock Exchange': CanadaExchanges.TSX,
  'TSX Venture Exchange': CanadaExchanges.TSXV,
  'Cboe Canada': CanadaExchanges.NEO,
  Nasdaq: USExchanges.NASDAQ,
  NASDAQ: USExchanges.NASDAQ,
  'New York Stock Exchange': USExchanges.NYSE,
  'NYSE Arca': USExchanges.NYSEARCA,
  'NYSE American': USExchanges.NYSEAMERICAN,
  BATS: USExchanges.BATS,
  'OTC Markets': USExchanges.OTCMKTS,
};

/**
 * Maps a symbol prefix (the part before `:`) to the exchange code.
 * `CBOE` is the Cboe Canada exchange — stored as `NEO` in our schema.
 */
const SYMBOL_PREFIX_TO_CODE: Record<string, string> = {
  TSX: CanadaExchanges.TSX,
  TSXV: CanadaExchanges.TSXV,
  NEO: CanadaExchanges.NEO,
  CBOE: CanadaExchanges.NEO,
  NASDAQ: USExchanges.NASDAQ,
  NYSE: USExchanges.NYSE,
  NYSEARCA: USExchanges.NYSEARCA,
  NYSEAMERICAN: USExchanges.NYSEAMERICAN,
  BATS: USExchanges.BATS,
  OTCMKTS: USExchanges.OTCMKTS,
};

interface CsvRow {
  [key: string]: string | undefined;
}

interface ParsedSymbol {
  symbol: string;
  exchange: string | null;
}

function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      out[key] = '';
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

function isEmpty(raw: string | undefined | null): boolean {
  if (raw === undefined || raw === null) return true;
  const t = String(raw).trim();
  return t === '' || t === 'N/A' || t === 'n/a' || t === '-' || t === '--';
}

function sqlString(raw: string | undefined | null): string {
  if (isEmpty(raw)) return 'NULL';
  return `'${String(raw).trim().replace(/'/g, "''")}'`;
}

function sqlFloat(raw: string | undefined | null): string {
  if (isEmpty(raw)) return 'NULL';
  const cleaned = String(raw)
    .trim()
    .replace(/[$,%\s]/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? String(n) : 'NULL';
}

function sqlBigInt(raw: string | undefined | null): string {
  if (isEmpty(raw)) return 'NULL';
  // Strip thousands separators and any trailing decimal — BigInt columns can't hold fractions.
  const cleaned = String(raw)
    .trim()
    .replace(/[$,\s]/g, '')
    .replace(/\.\d+$/, '');
  if (!/^-?\d+$/.test(cleaned)) return 'NULL';
  return cleaned;
}

function sqlInt(raw: string | undefined | null): string {
  return sqlBigInt(raw);
}

function parseSymbol(rawSymbol: string | undefined, rawExchange: string | undefined): ParsedSymbol {
  const sym = (rawSymbol ?? '').trim();
  const colon = sym.indexOf(':');
  if (colon > 0) {
    const prefix = sym.slice(0, colon).trim().toUpperCase();
    const ticker = sym
      .slice(colon + 1)
      .trim()
      .toUpperCase();
    const mapped = SYMBOL_PREFIX_TO_CODE[prefix];
    return { symbol: ticker, exchange: mapped ?? prefix };
  }
  const ticker = sym.toUpperCase();
  const exchangeCol = (rawExchange ?? '').trim();
  return { symbol: ticker, exchange: EXCHANGE_NAME_TO_CODE[exchangeCol] ?? null };
}

interface BuiltStatements {
  etf: string;
  financial: string;
  stockAnalyzer: string;
}

function buildStatementsForRow(row: CsvRow, errors: string[], rowIdx: number): BuiltStatements | null {
  const { symbol, exchange } = parseSymbol(row['Symbol'], row['Exchange']);
  if (!symbol || !exchange) {
    errors.push(`Row ${rowIdx + 2}: cannot resolve symbol/exchange from Symbol="${row['Symbol'] ?? ''}" Exchange="${row['Exchange'] ?? ''}"`);
    return null;
  }
  const name = (row['Fund Name'] ?? row['Name'] ?? '').trim();
  if (!name) {
    errors.push(`Row ${rowIdx + 2}: missing "Fund Name" (symbol=${symbol})`);
    return null;
  }

  const etfId = randomUUID();

  const etfSql =
    `INSERT INTO etfs (id, space_id, symbol, name, exchange, inception, created_at, updated_at) VALUES (` +
    [sqlString(etfId), sqlString(SPACE_ID), sqlString(symbol), sqlString(name), sqlString(exchange), sqlString(row['Inception']), 'NOW()', 'NOW()'].join(', ') +
    `) ON CONFLICT (space_id, symbol, exchange) DO NOTHING;`;

  const financialSql =
    `INSERT INTO etf_financial_info (id, etf_id, aum, expense_ratio, pe, shares_out, dividend_yield, payout_frequency, payout_ratio, volume, year_high, year_low, holdings, created_at, updated_at) VALUES (` +
    [
      sqlString(randomUUID()),
      sqlString(etfId),
      sqlString(row['Assets']),
      sqlFloat(row['Expense Ratio'] ?? row['Exp. Ratio']),
      sqlFloat(row['PE Ratio']),
      sqlString(row['Shares Out'] ?? row['Shares']),
      sqlFloat(row['Dividend Yield'] ?? row['Div. Yield']),
      sqlString(row['Dividend Payout Frequency'] ?? row['Payout Freq.']),
      sqlFloat(row['Payout Ratio']),
      sqlFloat(row['Volume']),
      sqlFloat(row['52-Week High Price'] ?? row['52W High']),
      sqlFloat(row['52-Week Low Price'] ?? row['52W Low']),
      sqlInt(row['Holdings Count'] ?? row['Holdings']),
      'NOW()',
      'NOW()',
    ].join(', ') +
    `);`;

  // Build the EtfStockAnalyzerInfo row column-by-column to keep field
  // ordering aligned with the Prisma model and easy to audit.
  const saColumns: Array<[string, string]> = [
    ['id', sqlString(randomUUID())],
    ['etf_id', sqlString(etfId)],
    ['symbol', sqlString(symbol)],
    ['fund_name', sqlString(name)],
    ['asset_class', sqlString(row['Asset Class'])],
    ['stock_price', sqlString(row['Stock Price'])],
    ['change_1d', sqlString(row['Price Change 1D'] ?? row['% Change'])],
    ['isin_number', sqlString(row['ISIN Number'])],
    ['cusip_number', sqlString(row['CUSIP Number'])],
    ['ma_200_chg_percent', sqlString(row['Price Change 200-Day MA'] ?? row['200MA Chg %'])],
    ['ma_150_chg_percent', sqlString(row['Price Change 150-Day MA'] ?? row['150MA Chg %'])],
    ['ma_50_chg_percent', sqlString(row['Price Change 50-Day MA'] ?? row['50MA Chg %'])],
    ['ma_20_chg_percent', sqlString(row['Price Change 20-Day MA'] ?? row['20MA Chg %'])],
    ['ma_200', sqlFloat(row['200-Day Moving Average'] ?? row['200 MA'])],
    ['ma_150', sqlFloat(row['150-Day Moving Average'] ?? row['150 MA'])],
    ['ma_50', sqlFloat(row['50-Day Moving Average'] ?? row['50 MA'])],
    ['ma_20', sqlFloat(row['20-Day Moving Average'] ?? row['20 MA'])],
    ['atl_date', sqlString(row['All-Time Low Date'] ?? row['ATL Date'])],
    ['atl_chg_percent', sqlString(row['All-Time Low Change (%)'] ?? row['ATL Chg (%)'])],
    ['atl', sqlFloat(row['All-Time Low'] ?? row['ATL'])],
    ['ath_date', sqlString(row['All-Time High Date'] ?? row['ATH Date'])],
    ['ath_chg_percent', sqlString(row['All-Time High Change (%)'] ?? row['ATH Chg (%)'])],
    ['ath', sqlFloat(row['All-Time High'] ?? row['ATH'])],
    ['low_52w_date', sqlString(row['52-Week Low Date'] ?? row['52W Low Date'])],
    ['high_52w_date', sqlString(row['52-Week High Date'] ?? row['52W High Date'])],
    ['high_52w_chg', sqlString(row['Price Change 52W High'] ?? row['52W High Chg'])],
    ['low_52w_chg', sqlString(row['Price Change 52W Low'] ?? row['52W Low Chg'])],
    ['cagr_20y', sqlString(row['Return CAGR 20Y'] ?? row['CAGR 20Y'])],
    ['cagr_15y', sqlString(row['Return CAGR 15Y'] ?? row['CAGR 15Y'])],
    ['cagr_10y', sqlString(row['Return CAGR 10Y'] ?? row['CAGR 10Y'])],
    ['cagr_5y', sqlString(row['Return CAGR 5Y'] ?? row['CAGR 5Y'])],
    ['cagr_3y', sqlString(row['Return CAGR 3Y'] ?? row['CAGR 3Y'])],
    ['cagr_1y', sqlString(row['Return CAGR 1Y'] ?? row['CAGR 1Y'])],
    ['return_20y', sqlString(row['Total Return 20Y'] ?? row['Return 20Y'])],
    ['return_15y', sqlString(row['Total Return 15Y'] ?? row['Return 15Y'])],
    ['return_10y', sqlString(row['Total Return 10Y'] ?? row['Return 10Y'])],
    ['return_5y', sqlString(row['Total Return 5Y'] ?? row['Return 5Y'])],
    ['return_3y', sqlString(row['Total Return 3Y'] ?? row['Return 3Y'])],
    ['return_1y', sqlString(row['Total Return 1Y'] ?? row['Return 1Y'])],
    ['return_ytd', sqlString(row['Total Return YTD'] ?? row['Return YTD'])],
    ['return_6m', sqlString(row['Total Return 6M'] ?? row['Return 6M'])],
    ['return_3m', sqlString(row['Total Return 3M'] ?? row['Return 3M'])],
    ['return_1m', sqlString(row['Total Return 1M'] ?? row['Return 1M'])],
    ['change_20y', sqlString(row['Price Change 20Y'] ?? row['Change 20Y'])],
    ['change_15y', sqlString(row['Price Change 15Y'] ?? row['Change 15Y'])],
    ['change_10y', sqlString(row['Price Change 10Y'] ?? row['Change 10Y'])],
    ['change_5y', sqlString(row['Price Change 5Y'] ?? row['Change 5Y'])],
    ['change_3y', sqlString(row['Price Change 3Y'] ?? row['Change 3Y'])],
    ['change_1y', sqlString(row['Price Change 1Y'] ?? row['Change 1Y'])],
    ['change_ytd', sqlString(row['Price Change YTD'] ?? row['Change YTD'])],
    ['change_6m', sqlString(row['Price Change 6M'] ?? row['Change 6M'])],
    ['change_3m', sqlString(row['Price Change 3M'] ?? row['Change 3M'])],
    ['change_1m', sqlString(row['Price Change 1M'] ?? row['Change 1M'])],
    ['change_1w', sqlString(row['Price Change 1W'] ?? row['Change 1W'])],
    ['leverage', sqlString(row['Leverage'])],
    ['region', sqlString(row['Region'])],
    ['payment_date', sqlString(row['Payment Date'])],
    ['ex_div_date', sqlString(row['Ex-Dividend Date'] ?? row['Ex-Div Date'])],
    ['div_growth_10y', sqlString(row['Dividend Growth (10Y)'] ?? row['Div. Growth 10Y'])],
    ['div_growth_5y', sqlString(row['Dividend Growth (5Y)'] ?? row['Div. Growth 5Y'])],
    ['div_growth_3y', sqlString(row['Dividend Growth (3Y)'] ?? row['Div. Growth 3Y'])],
    ['div_years', sqlInt(row['Dividend Payment Years'] ?? row['Div. Years'])],
    ['div_gr_years', sqlInt(row['Dividend Growth Years'] ?? row['Div. Gr. Years'])],
    ['div_growth', sqlString(row['Dividend Growth'] ?? row['Div. Growth'])],
    ['last_div', sqlFloat(row['Last Dividend ($)'] ?? row['Last Div.'])],
    ['div_dollars', sqlFloat(row['Dividend Per Share ($)'] ?? row['Div. ($)'])],
    ['sortino', sqlFloat(row['Sortino Ratio'] ?? row['Sortino'])],
    ['atr', sqlFloat(row['Average True Range (ATR)'] ?? row['ATR'])],
    ['sharpe', sqlFloat(row['Sharpe Ratio'] ?? row['Sharpe'])],
    ['index', sqlString(row['Index'])],
    ['price_curr', sqlString(row['Price Currency'] ?? row['Price Curr.'])],
    ['beta_1y', sqlFloat(row['Beta (1Y)'])],
    ['beta_2y', sqlFloat(row['Beta (2Y)'])],
    ['beta_5y', sqlFloat(row['Beta (5Y)'])],
    ['rsi', sqlFloat(row['Relative Strength Index (RSI)'] ?? row['RSI'])],
    ['rsi_w', sqlFloat(row['Weekly RSI'] ?? row['RSI (W)'])],
    ['rsi_m', sqlFloat(row['Monthly RSI'] ?? row['RSI (M)'])],
    ['issuer', sqlString(row['Issuer'])],
    ['category', sqlString(row['Category'])],
    ['chg_open_percent', sqlString(row['Change From Open (%)'] ?? row['Chg. Open (%)'])],
    ['position_in_range', sqlString(row['Position in Range (%)'] ?? row['Pos. Range'])],
    ['open', sqlFloat(row['Open Price'] ?? row['Open'])],
    ['low', sqlFloat(row['Low Price'] ?? row['Low'])],
    ['high', sqlFloat(row['High Price'] ?? row['High'])],
    ['prev_close', sqlFloat(row['Previous Close'] ?? row['Prev. Close'])],
    ['price_date', sqlString(row['Stock Price Date'] ?? row['Price Date'])],
    ['gap_percent', sqlString(row["Day's Gap (%)"] ?? row['Gap (%)'])],
    ['rel_volume', sqlString(row['Relative Volume'] ?? row['Rel. Volume'])],
    ['avg_volume', sqlBigInt(row['Average Volume'] ?? row['Avg. Volume'])],
    ['dollar_vol', sqlBigInt(row['Dollar Volume'] ?? row['Dollar Vol.'])],
    ['created_at', 'NOW()'],
    ['updated_at', 'NOW()'],
  ];

  const stockAnalyzerSql =
    `INSERT INTO etf_stock_analyzer_info (${saColumns.map(([c]) => `"${c}"`).join(', ')}) VALUES (` + saColumns.map(([, v]) => v).join(', ') + `);`;

  return { etf: etfSql, financial: financialSql, stockAnalyzer: stockAnalyzerSql };
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const inPath = args['in'] ? path.resolve(args['in']) : DEFAULT_IN;
  const outPath = args['out'] ? path.resolve(args['out']) : DEFAULT_OUT;

  console.log(`📄 Reading CSV: ${inPath}`);
  const raw = await readFile(inPath, 'utf-8');

  // Auto-detect delimiter — the source we use exports as TSV but supports CSV too.
  const parsed = Papa.parse<CsvRow>(raw, {
    header: true,
    skipEmptyLines: true,
    delimiter: '',
    transformHeader: (h) => h.trim(),
  });

  if (parsed.errors.length > 0) {
    console.warn(`⚠️  Papaparse reported ${parsed.errors.length} non-fatal parse warnings — continuing.`);
    for (const e of parsed.errors.slice(0, 5)) console.warn(`   - ${e.type} @ row ${e.row}: ${e.message}`);
  }

  const rows = parsed.data.filter((r) => Object.values(r).some((v) => !isEmpty(v)));
  console.log(`✅ Parsed ${rows.length} data row(s)`);

  const errors: string[] = [];
  const blocks: string[] = [];
  for (let i = 0; i < rows.length; i++) {
    const built = buildStatementsForRow(rows[i], errors, i);
    if (!built) continue;
    blocks.push([built.etf, built.financial, built.stockAnalyzer].join('\n'));
  }

  if (errors.length > 0) {
    console.warn(`⚠️  Skipped ${errors.length} row(s):`);
    for (const e of errors) console.warn(`   - ${e}`);
  }

  const sql = ['BEGIN;', '', ...blocks, '', 'COMMIT;', ''].join('\n');
  await writeFile(outPath, sql, 'utf-8');

  console.log(`💾 Wrote ${blocks.length} ETF block(s) → ${outPath}`);
  if (errors.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
