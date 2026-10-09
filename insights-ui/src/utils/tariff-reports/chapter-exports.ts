// Loader for a chapter's export-side content (the "Export" half of the
// chapter report). Only chapters listed here have export pages; every other
// chapter shows the import pages alone, with no Import / Export switch.
//
// Static imports (not `fs`) so the content is bundled and works in every
// runtime. Replacing this with a query later is a one-function change.

import pharmaMarkets from '@/tariff-data/chapters/exports/30-pharmaceutical-products/markets.json';
import pharmaOverview from '@/tariff-data/chapters/exports/30-pharmaceutical-products/overview.json';
import pharmaUpdates from '@/tariff-data/chapters/exports/30-pharmaceutical-products/tariff-updates.json';
import type { TariffChapterExports, TariffExportMarketsContent, TariffExportOverviewContent, TariffExportUpdatesContent } from '@/types/tariff-chapter-exports';

const EXPORTS_BY_SLUG: Record<string, TariffChapterExports> = {
  '30-pharmaceutical-products': {
    overview: pharmaOverview as TariffExportOverviewContent,
    tariffUpdates: pharmaUpdates as TariffExportUpdatesContent,
    markets: pharmaMarkets as TariffExportMarketsContent,
  },
};

export function getChapterExports(chapterSlug: string): TariffChapterExports | null {
  return EXPORTS_BY_SLUG[chapterSlug] ?? null;
}

/** Slugs of every chapter with export-side content (used by the content validator). */
export function listChapterExportSlugs(): string[] {
  return Object.keys(EXPORTS_BY_SLUG);
}

export function hasChapterExports(chapterSlug: string): boolean {
  return chapterSlug in EXPORTS_BY_SLUG;
}

/**
 * The newest foreign tariff action on the export tariff-updates page that reaches this chapter's goods
 * (background `reference` entries and actions that do not cover the chapter are skipped).
 */
export function latestExportChange(chapterSlug: string): { date: string; title: string } | null {
  const changes = getChapterExports(chapterSlug)?.tariffUpdates.changes ?? [];
  const newest = changes
    .filter((change) => change.type !== 'reference' && change.coversChapter !== 'no')
    .reduce<(typeof changes)[number] | null>((latest, change) => (!latest || change.date > latest.date ? change : latest), null);
  return newest ? { date: newest.date, title: newest.title } : null;
}
