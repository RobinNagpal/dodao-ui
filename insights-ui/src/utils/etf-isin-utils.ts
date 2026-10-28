/**
 * An ETF share class's ISIN, normalised (trimmed, uppercased), or null when the value is not a
 * well-formed ISIN: 2-letter country code, 9 alphanumerics, 1 check digit. Same rule the
 * `20261023000000_etf_isin_alternative_listings` migration used to backfill `etfs.isin`.
 */
export function normalizeEtfIsin(value: string | null | undefined): string | null {
  const isin = (value ?? '').trim().toUpperCase();
  return /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(isin) ? isin : null;
}
