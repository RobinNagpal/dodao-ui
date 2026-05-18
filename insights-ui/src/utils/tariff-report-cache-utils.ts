import 'server-only';
import { revalidateTag } from 'next/cache';
import { invalidateCloudFrontPaths } from './cloudfront-cache-utils';
import { tariffReportTag, TARIFF_REPORTS_LISTING_TAG } from './tariff-report-tags';

/**
 * Cache-tag helpers for per-tariff-report revalidation.
 *
 * The same `tariffReportTag(id)` function is used for two different URL
 * topologies:
 *
 *   - Legacy industry routes: `/industry-tariff-report/<industryId>` and its
 *     subpages — tagged by the industry slug.
 *   - Chapter routes: `/industry-tariff-report/chapters/<chapterSlug>` and its
 *     subpages — tagged by the chapter slug.
 *
 * The Vercel-side `revalidateTag` call is identical for both (it just clears
 * the tag), but the CloudFront URL to purge differs. That's why this module
 * exposes two helpers — `revalidateTariffReportIndustry` and
 * `revalidateTariffReportChapter` — instead of one ambiguous helper. Callers
 * know which topology they're invalidating.
 *
 * Each helper also purges the CloudFront edge cache for the corresponding
 * URL — see `cloudfront-cache-utils.ts`.
 */

/** Invalidate the cache for a legacy industry route: `/industry-tariff-report/<industryId>` + subpages. */
export const revalidateTariffReportIndustry = (industryId: string) => {
  revalidateTag(tariffReportTag(industryId));
  invalidateCloudFrontPaths([`/industry-tariff-report/${industryId}*`]);
};

/** Invalidate the cache for a chapter route: `/industry-tariff-report/chapters/<chapterSlug>` + subpages. */
export const revalidateTariffReportChapter = (chapterSlug: string) => {
  revalidateTag(tariffReportTag(chapterSlug));
  invalidateCloudFrontPaths([`/industry-tariff-report/chapters/${chapterSlug}*`]);
};

/** Invalidate the `/tariff-reports` listing page. */
export const revalidateTariffReportsListing = () => {
  revalidateTag(TARIFF_REPORTS_LISTING_TAG);
  invalidateCloudFrontPaths(['/tariff-reports*']);
};

// Re-export tag builder for server usage when convenient
export { tariffReportTag, TARIFF_REPORTS_LISTING_TAG };
