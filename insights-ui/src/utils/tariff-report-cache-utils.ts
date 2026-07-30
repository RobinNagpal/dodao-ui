import 'server-only';
import { revalidateTag } from 'next/cache';
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
 * These helpers are TAG-ONLY — no CloudFront purge. Their dominant caller is
 * `writeSection` in `tariff-report-repository.ts`, i.e. the automated LLM
 * generation pipeline: one chapter "Generate all" runs ~14 section saves, and
 * each save used to purge 2-3 wildcard paths (including re-purging the
 * `/tariff-reports*` listing on EVERY write), so a regeneration pass across
 * ~97 chapters billed thousands of CloudFront invalidation paths. Like the
 * stock/ETF pipelines (`ticker-v1-cache-utils.ts`), the edge now refreshes on
 * its 6-day TTL and the tariff sitemap delays `lastmod` by 7 days
 * (`sitemap-lastmod-utils.ts`). Admin actions that need an immediate edge
 * purge do it themselves (see `revalidateTariffReportsListingCache` in
 * `cache-actions.ts`, the `/admin-v1/invalidate-cache` page, or the
 * `flush-cloudfront-cache` workflow's tariffs group).
 */

/** Invalidate the Data Cache tag for a legacy industry route: `/industry-tariff-report/<industryId>` + subpages. */
export const revalidateTariffReportIndustry = (industryId: string) => {
  revalidateTag(tariffReportTag(industryId));
};

/** Invalidate the Data Cache tag for a chapter route: `/industry-tariff-report/chapters/<chapterSlug>` + subpages. */
export const revalidateTariffReportChapter = (chapterSlug: string) => {
  revalidateTag(tariffReportTag(chapterSlug));
};

/** Invalidate the Data Cache tag for the `/tariff-reports` listing page. */
export const revalidateTariffReportsListing = () => {
  revalidateTag(TARIFF_REPORTS_LISTING_TAG);
};

// Re-export tag builder for server usage when convenient
export { tariffReportTag, TARIFF_REPORTS_LISTING_TAG };
