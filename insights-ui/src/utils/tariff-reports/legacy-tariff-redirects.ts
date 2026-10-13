import { TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';

// Old tariff URLs that still get real traffic but no longer match a route (issue #1768, from the
// production `[input-rejected]` logs):
//   - From 2025-07-25 to 2025-07-30 the newer industry ids were camelCase (`heavyElectricalEquipment`)
//     before they were renamed to kebab-case (`heavy-electrical-equipment`); search engines still
//     request the camelCase URLs.
//   - `/industry-tariff-report/chapters` (the parent of every chapter URL) has no page of its own;
//     the chapter index lives at `/tariff-reports`. Same for `/industry-tariff-report/exports` and
//     `/industry-tariff-report/exports/chapters`, the parents of every export page URL.
//   - The export pages first lived under the chapter, at `/industry-tariff-report/chapters/<slug>/exports`
//     (+ `/tariff-updates`, `/markets`), and Google indexed them. In October 2026 they moved to
//     `/industry-tariff-report/exports/chapters/<slug>` (+ the same sub-pages).
// All answer a permanent redirect instead of a 404, so the old links keep their ranking.

const BASE = '/industry-tariff-report';

/** Sub-pages of the old `/chapters/<slug>/exports` section ('' = its overview). */
const OLD_EXPORT_PAGES: ReadonlySet<string> = new Set(['', 'tariff-updates', 'markets']);

/** camelCase enum key → current id, for the industries whose id differs from its key. */
const RENAMED_INDUSTRY_IDS: ReadonlyMap<string, string> = new Map(Object.entries(TariffIndustryId).filter(([key, id]) => key !== id));

/** The path an old tariff URL now lives at, or null when `pathname` isn't one of them. Pure. */
export function legacyTariffRedirectPath(pathname: string): string | null {
  if (!pathname.startsWith(`${BASE}/`)) return null;
  const [segment, ...rest] = pathname.slice(BASE.length + 1).split('/');
  if (segment === 'chapters' && rest.every((part) => part === '')) return '/tariff-reports';
  if (segment === 'chapters' && rest[1] === 'exports') {
    const [slug, , page = '', ...extra] = rest;
    if (slug && OLD_EXPORT_PAGES.has(page) && extra.every((part) => part === '')) return `${BASE}/exports/chapters/${slug}${page ? `/${page}` : ''}`;
  }
  if (segment === 'exports' && (rest.every((part) => part === '') || (rest[0] === 'chapters' && rest.slice(1).every((part) => part === '')))) {
    return '/tariff-reports';
  }
  const id = RENAMED_INDUSTRY_IDS.get(segment);
  return id ? [BASE, id, ...rest].join('/') : null;
}
