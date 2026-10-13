import { TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';

// Old tariff URLs that still get real traffic but no longer match a route (issue #1768, from the
// production `[input-rejected]` logs):
//   - From 2025-07-25 to 2025-07-30 the newer industry ids were camelCase (`heavyElectricalEquipment`)
//     before they were renamed to kebab-case (`heavy-electrical-equipment`); search engines still
//     request the camelCase URLs.
//   - `/industry-tariff-report/chapters` (the parent of every chapter URL) has no page of its own;
//     the chapter index lives at `/tariff-reports`.
// Both answer a permanent redirect instead of a 404, so the old links keep their ranking.

const BASE = '/industry-tariff-report';

/** camelCase enum key → current id, for the industries whose id differs from its key. */
const RENAMED_INDUSTRY_IDS: ReadonlyMap<string, string> = new Map(Object.entries(TariffIndustryId).filter(([key, id]) => key !== id));

/** The path an old tariff URL now lives at, or null when `pathname` isn't one of them. Pure. */
export function legacyTariffRedirectPath(pathname: string): string | null {
  if (!pathname.startsWith(`${BASE}/`)) return null;
  const [segment, ...rest] = pathname.slice(BASE.length + 1).split('/');
  if (segment === 'chapters' && rest.every((part) => part === '')) return '/tariff-reports';
  const id = RENAMED_INDUSTRY_IDS.get(segment);
  return id ? [BASE, id, ...rest].join('/') : null;
}
