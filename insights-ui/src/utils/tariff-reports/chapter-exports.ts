// Loader for a chapter's export-side content (the "Export" half of the
// chapter report). Only chapters listed here have export pages; every other
// chapter shows the import pages alone, with no Import / Export switch.
//
// Static imports (not `fs`) so the content is bundled and works in every
// runtime. Replacing this with a query later is a one-function change.

import pharmaFaq from '@/tariff-data/chapters/exports/30-pharmaceutical-products/faq.json';
import pharmaMarkets from '@/tariff-data/chapters/exports/30-pharmaceutical-products/markets.json';
import pharmaOverview from '@/tariff-data/chapters/exports/30-pharmaceutical-products/overview.json';
import pharmaRules from '@/tariff-data/chapters/exports/30-pharmaceutical-products/rules.json';
import pharmaUpdates from '@/tariff-data/chapters/exports/30-pharmaceutical-products/tariff-updates.json';
import oilseedsFaq from '@/tariff-data/chapters/exports/12-oil-seeds-and-grains/faq.json';
import oilseedsMarkets from '@/tariff-data/chapters/exports/12-oil-seeds-and-grains/markets.json';
import oilseedsOverview from '@/tariff-data/chapters/exports/12-oil-seeds-and-grains/overview.json';
import oilseedsRules from '@/tariff-data/chapters/exports/12-oil-seeds-and-grains/rules.json';
import oilseedsUpdates from '@/tariff-data/chapters/exports/12-oil-seeds-and-grains/tariff-updates.json';
import electricalFaq from '@/tariff-data/chapters/exports/85-electrical-machinery-and-recorders/faq.json';
import electricalMarkets from '@/tariff-data/chapters/exports/85-electrical-machinery-and-recorders/markets.json';
import electricalOverview from '@/tariff-data/chapters/exports/85-electrical-machinery-and-recorders/overview.json';
import electricalRules from '@/tariff-data/chapters/exports/85-electrical-machinery-and-recorders/rules.json';
import electricalUpdates from '@/tariff-data/chapters/exports/85-electrical-machinery-and-recorders/tariff-updates.json';
import aircraftFaq from '@/tariff-data/chapters/exports/88-aircraft-and-spacecraft/faq.json';
import aircraftMarkets from '@/tariff-data/chapters/exports/88-aircraft-and-spacecraft/markets.json';
import aircraftOverview from '@/tariff-data/chapters/exports/88-aircraft-and-spacecraft/overview.json';
import aircraftRules from '@/tariff-data/chapters/exports/88-aircraft-and-spacecraft/rules.json';
import aircraftUpdates from '@/tariff-data/chapters/exports/88-aircraft-and-spacecraft/tariff-updates.json';
import type {
  TariffChapterExports,
  TariffExportFaqContent,
  TariffExportMarketsContent,
  TariffExportOverviewContent,
  TariffExportRulesContent,
  TariffExportUpdatesContent,
} from '@/types/tariff-chapter-exports';

/** File name of each export page under `src/tariff-data/chapters/exports/<NN>-<slug>/`. */
export const EXPORT_PAGE_FILES: Record<keyof TariffChapterExports, string> = {
  overview: 'overview.json',
  tariffUpdates: 'tariff-updates.json',
  markets: 'markets.json',
  rules: 'rules.json',
  faq: 'faq.json',
};

/** CHAPTER_EXPORT_SECTIONS slug of each export page (also its content file's `page.slug`). */
export const EXPORT_PAGE_SLUGS: Record<keyof TariffChapterExports, string> = {
  overview: 'exports',
  tariffUpdates: 'exports/tariff-updates',
  markets: 'exports/markets',
  rules: 'exports/rules',
  faq: 'exports/faq',
};

const EXPORTS_BY_SLUG: Record<string, TariffChapterExports> = {
  '30-pharmaceutical-products': {
    overview: pharmaOverview as TariffExportOverviewContent,
    tariffUpdates: pharmaUpdates as TariffExportUpdatesContent,
    markets: pharmaMarkets as TariffExportMarketsContent,
    rules: pharmaRules as TariffExportRulesContent,
    faq: pharmaFaq as TariffExportFaqContent,
  },
  '12-oil-seeds-and-grains': {
    overview: oilseedsOverview as TariffExportOverviewContent,
    tariffUpdates: oilseedsUpdates as TariffExportUpdatesContent,
    markets: oilseedsMarkets as TariffExportMarketsContent,
    rules: oilseedsRules as TariffExportRulesContent,
    faq: oilseedsFaq as TariffExportFaqContent,
  },
  '85-electrical-machinery-and-recorders': {
    overview: electricalOverview as TariffExportOverviewContent,
    tariffUpdates: electricalUpdates as TariffExportUpdatesContent,
    markets: electricalMarkets as TariffExportMarketsContent,
    rules: electricalRules as TariffExportRulesContent,
    faq: electricalFaq as TariffExportFaqContent,
  },
  '88-aircraft-and-spacecraft': {
    overview: aircraftOverview as TariffExportOverviewContent,
    tariffUpdates: aircraftUpdates as TariffExportUpdatesContent,
    markets: aircraftMarkets as TariffExportMarketsContent,
    rules: aircraftRules as TariffExportRulesContent,
    faq: aircraftFaq as TariffExportFaqContent,
  },
};

export function getChapterExports(chapterSlug: string): TariffChapterExports | null {
  return EXPORTS_BY_SLUG[chapterSlug] ?? null;
}

/** The content of one export page, by its CHAPTER_EXPORT_SECTIONS slug ("exports", "exports/markets", …). */
export function getExportPageContent(chapterSlug: string, pageSlug: string): TariffChapterExports[keyof TariffChapterExports] | null {
  const key = (Object.keys(EXPORT_PAGE_SLUGS) as (keyof TariffChapterExports)[]).find((k) => EXPORT_PAGE_SLUGS[k] === pageSlug);
  return key ? getChapterExports(chapterSlug)?.[key] ?? null : null;
}

/** Slugs of every chapter with export-side content (used by the content validator). */
export function listChapterExportSlugs(): string[] {
  return Object.keys(EXPORTS_BY_SLUG);
}

export function hasChapterExports(chapterSlug: string): boolean {
  return chapterSlug in EXPORTS_BY_SLUG;
}
