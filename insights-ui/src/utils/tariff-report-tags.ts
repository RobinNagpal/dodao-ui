/** Cache tag helpers for per-tariff-report revalidation (client-safe) */
const TARIFF_REPORT_TAG_PREFIX = 'tariff_report:' as const;

export const tariffReportTag = (industryId: string): `${typeof TARIFF_REPORT_TAG_PREFIX}${string}` => `${TARIFF_REPORT_TAG_PREFIX}${industryId.toUpperCase()}`;
