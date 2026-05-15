import { ETF_ASSET_CLASS_OPTIONS, ETF_ISSUER_OPTIONS } from '@/utils/etf-filter-utils';

/**
 * URL-safe slug for any ETF tag value (asset class, provider, etc).
 * `Fixed Income` → `fixed-income`, `First Trust` → `first-trust`.
 */
export function slugifyEtfTag(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Resolves an asset-class URL slug back to its canonical value. */
export function getEtfAssetClassBySlug(slug: string): string | undefined {
  const needle = slug.toLowerCase();
  return ETF_ASSET_CLASS_OPTIONS.find((opt) => opt.value !== '' && slugifyEtfTag(opt.value) === needle)?.value;
}

/**
 * Resolves a provider URL slug back to its canonical label from the known issuer list,
 * or falls back to a title-cased reconstruction so unknown providers still render readably.
 */
export function getEtfProviderBySlug(slug: string): string {
  const needle = slug.toLowerCase();
  const known = ETF_ISSUER_OPTIONS.find((opt) => opt.value !== '' && slugifyEtfTag(opt.value) === needle);
  if (known) return known.value;
  return needle
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
