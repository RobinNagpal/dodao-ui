import { revalidateTag } from 'next/cache';

/** Cache tag helpers for per-tariff-report revalidation */
const TARIFF_REPORT_TAG_PREFIX = 'tariff_report:' as const;

export const tariffReportTag = (industryId: string): `${typeof TARIFF_REPORT_TAG_PREFIX}${string}` => `${TARIFF_REPORT_TAG_PREFIX}${industryId.toUpperCase()}`;

// Main revalidation functions
export const revalidateTariffReport = (industryId: string) => revalidateTag(tariffReportTag(industryId));
