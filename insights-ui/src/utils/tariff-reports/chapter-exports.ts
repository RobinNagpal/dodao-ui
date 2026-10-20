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
import ch02Faq from '@/tariff-data/chapters/exports/02-meat-and-offal/faq.json';
import ch02Markets from '@/tariff-data/chapters/exports/02-meat-and-offal/markets.json';
import ch02Overview from '@/tariff-data/chapters/exports/02-meat-and-offal/overview.json';
import ch02Rules from '@/tariff-data/chapters/exports/02-meat-and-offal/rules.json';
import ch02Updates from '@/tariff-data/chapters/exports/02-meat-and-offal/tariff-updates.json';
import ch10Faq from '@/tariff-data/chapters/exports/10-cereals/faq.json';
import ch10Markets from '@/tariff-data/chapters/exports/10-cereals/markets.json';
import ch10Overview from '@/tariff-data/chapters/exports/10-cereals/overview.json';
import ch10Rules from '@/tariff-data/chapters/exports/10-cereals/rules.json';
import ch10Updates from '@/tariff-data/chapters/exports/10-cereals/tariff-updates.json';
import ch27Faq from '@/tariff-data/chapters/exports/27-mineral-fuels-and-oils/faq.json';
import ch27Markets from '@/tariff-data/chapters/exports/27-mineral-fuels-and-oils/markets.json';
import ch27Overview from '@/tariff-data/chapters/exports/27-mineral-fuels-and-oils/overview.json';
import ch27Rules from '@/tariff-data/chapters/exports/27-mineral-fuels-and-oils/rules.json';
import ch27Updates from '@/tariff-data/chapters/exports/27-mineral-fuels-and-oils/tariff-updates.json';
import ch52Faq from '@/tariff-data/chapters/exports/52-cotton/faq.json';
import ch52Markets from '@/tariff-data/chapters/exports/52-cotton/markets.json';
import ch52Overview from '@/tariff-data/chapters/exports/52-cotton/overview.json';
import ch52Rules from '@/tariff-data/chapters/exports/52-cotton/rules.json';
import ch52Updates from '@/tariff-data/chapters/exports/52-cotton/tariff-updates.json';
import ch71Faq from '@/tariff-data/chapters/exports/71-pearls-stones-and-jewelry/faq.json';
import ch71Markets from '@/tariff-data/chapters/exports/71-pearls-stones-and-jewelry/markets.json';
import ch71Overview from '@/tariff-data/chapters/exports/71-pearls-stones-and-jewelry/overview.json';
import ch71Rules from '@/tariff-data/chapters/exports/71-pearls-stones-and-jewelry/rules.json';
import ch71Updates from '@/tariff-data/chapters/exports/71-pearls-stones-and-jewelry/tariff-updates.json';
import ch29Faq from '@/tariff-data/chapters/exports/29-organic-chemicals/faq.json';
import ch29Markets from '@/tariff-data/chapters/exports/29-organic-chemicals/markets.json';
import ch29Overview from '@/tariff-data/chapters/exports/29-organic-chemicals/overview.json';
import ch29Rules from '@/tariff-data/chapters/exports/29-organic-chemicals/rules.json';
import ch29Updates from '@/tariff-data/chapters/exports/29-organic-chemicals/tariff-updates.json';
import ch39Faq from '@/tariff-data/chapters/exports/39-plastics-and-articles/faq.json';
import ch39Markets from '@/tariff-data/chapters/exports/39-plastics-and-articles/markets.json';
import ch39Overview from '@/tariff-data/chapters/exports/39-plastics-and-articles/overview.json';
import ch39Rules from '@/tariff-data/chapters/exports/39-plastics-and-articles/rules.json';
import ch39Updates from '@/tariff-data/chapters/exports/39-plastics-and-articles/tariff-updates.json';
import ch84Faq from '@/tariff-data/chapters/exports/84-nuclear-reactors-and-machinery/faq.json';
import ch84Markets from '@/tariff-data/chapters/exports/84-nuclear-reactors-and-machinery/markets.json';
import ch84Overview from '@/tariff-data/chapters/exports/84-nuclear-reactors-and-machinery/overview.json';
import ch84Rules from '@/tariff-data/chapters/exports/84-nuclear-reactors-and-machinery/rules.json';
import ch84Updates from '@/tariff-data/chapters/exports/84-nuclear-reactors-and-machinery/tariff-updates.json';
import ch87Faq from '@/tariff-data/chapters/exports/87-motor-vehicles-and-parts/faq.json';
import ch87Markets from '@/tariff-data/chapters/exports/87-motor-vehicles-and-parts/markets.json';
import ch87Overview from '@/tariff-data/chapters/exports/87-motor-vehicles-and-parts/overview.json';
import ch87Rules from '@/tariff-data/chapters/exports/87-motor-vehicles-and-parts/rules.json';
import ch87Updates from '@/tariff-data/chapters/exports/87-motor-vehicles-and-parts/tariff-updates.json';
import ch90Faq from '@/tariff-data/chapters/exports/90-optical-and-precision-instruments/faq.json';
import ch90Markets from '@/tariff-data/chapters/exports/90-optical-and-precision-instruments/markets.json';
import ch90Overview from '@/tariff-data/chapters/exports/90-optical-and-precision-instruments/overview.json';
import ch90Rules from '@/tariff-data/chapters/exports/90-optical-and-precision-instruments/rules.json';
import ch90Updates from '@/tariff-data/chapters/exports/90-optical-and-precision-instruments/tariff-updates.json';
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
  '2-meat-and-offal': {
    overview: ch02Overview as TariffExportOverviewContent,
    tariffUpdates: ch02Updates as TariffExportUpdatesContent,
    markets: ch02Markets as TariffExportMarketsContent,
    rules: ch02Rules as TariffExportRulesContent,
    faq: ch02Faq as TariffExportFaqContent,
  },
  '10-cereals': {
    overview: ch10Overview as TariffExportOverviewContent,
    tariffUpdates: ch10Updates as TariffExportUpdatesContent,
    markets: ch10Markets as TariffExportMarketsContent,
    rules: ch10Rules as TariffExportRulesContent,
    faq: ch10Faq as TariffExportFaqContent,
  },
  '27-mineral-fuels-and-oils': {
    overview: ch27Overview as TariffExportOverviewContent,
    tariffUpdates: ch27Updates as TariffExportUpdatesContent,
    markets: ch27Markets as TariffExportMarketsContent,
    rules: ch27Rules as TariffExportRulesContent,
    faq: ch27Faq as TariffExportFaqContent,
  },
  '52-cotton': {
    overview: ch52Overview as TariffExportOverviewContent,
    tariffUpdates: ch52Updates as TariffExportUpdatesContent,
    markets: ch52Markets as TariffExportMarketsContent,
    rules: ch52Rules as TariffExportRulesContent,
    faq: ch52Faq as TariffExportFaqContent,
  },
  '71-pearls-stones-and-jewelry': {
    overview: ch71Overview as TariffExportOverviewContent,
    tariffUpdates: ch71Updates as TariffExportUpdatesContent,
    markets: ch71Markets as TariffExportMarketsContent,
    rules: ch71Rules as TariffExportRulesContent,
    faq: ch71Faq as TariffExportFaqContent,
  },
  '29-organic-chemicals': {
    overview: ch29Overview as TariffExportOverviewContent,
    tariffUpdates: ch29Updates as TariffExportUpdatesContent,
    markets: ch29Markets as TariffExportMarketsContent,
    rules: ch29Rules as TariffExportRulesContent,
    faq: ch29Faq as TariffExportFaqContent,
  },
  '39-plastics-and-articles': {
    overview: ch39Overview as TariffExportOverviewContent,
    tariffUpdates: ch39Updates as TariffExportUpdatesContent,
    markets: ch39Markets as TariffExportMarketsContent,
    rules: ch39Rules as TariffExportRulesContent,
    faq: ch39Faq as TariffExportFaqContent,
  },
  '84-nuclear-reactors-and-machinery': {
    overview: ch84Overview as TariffExportOverviewContent,
    tariffUpdates: ch84Updates as TariffExportUpdatesContent,
    markets: ch84Markets as TariffExportMarketsContent,
    rules: ch84Rules as TariffExportRulesContent,
    faq: ch84Faq as TariffExportFaqContent,
  },
  '87-motor-vehicles-and-parts': {
    overview: ch87Overview as TariffExportOverviewContent,
    tariffUpdates: ch87Updates as TariffExportUpdatesContent,
    markets: ch87Markets as TariffExportMarketsContent,
    rules: ch87Rules as TariffExportRulesContent,
    faq: ch87Faq as TariffExportFaqContent,
  },
  '90-optical-and-precision-instruments': {
    overview: ch90Overview as TariffExportOverviewContent,
    tariffUpdates: ch90Updates as TariffExportUpdatesContent,
    markets: ch90Markets as TariffExportMarketsContent,
    rules: ch90Rules as TariffExportRulesContent,
    faq: ch90Faq as TariffExportFaqContent,
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
