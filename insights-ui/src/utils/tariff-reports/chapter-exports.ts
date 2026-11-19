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
import ch26Faq from '@/tariff-data/chapters/exports/26-ores-slag-and-ash/faq.json';
import ch26Markets from '@/tariff-data/chapters/exports/26-ores-slag-and-ash/markets.json';
import ch26Overview from '@/tariff-data/chapters/exports/26-ores-slag-and-ash/overview.json';
import ch26Rules from '@/tariff-data/chapters/exports/26-ores-slag-and-ash/rules.json';
import ch26Updates from '@/tariff-data/chapters/exports/26-ores-slag-and-ash/tariff-updates.json';
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
import ch28Faq from '@/tariff-data/chapters/exports/28-inorganic-and-metal-compounds/faq.json';
import ch28Markets from '@/tariff-data/chapters/exports/28-inorganic-and-metal-compounds/markets.json';
import ch28Overview from '@/tariff-data/chapters/exports/28-inorganic-and-metal-compounds/overview.json';
import ch28Rules from '@/tariff-data/chapters/exports/28-inorganic-and-metal-compounds/rules.json';
import ch28Updates from '@/tariff-data/chapters/exports/28-inorganic-and-metal-compounds/tariff-updates.json';
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
import ch40Faq from '@/tariff-data/chapters/exports/40-rubber-and-articles/faq.json';
import ch40Markets from '@/tariff-data/chapters/exports/40-rubber-and-articles/markets.json';
import ch40Overview from '@/tariff-data/chapters/exports/40-rubber-and-articles/overview.json';
import ch40Rules from '@/tariff-data/chapters/exports/40-rubber-and-articles/rules.json';
import ch40Updates from '@/tariff-data/chapters/exports/40-rubber-and-articles/tariff-updates.json';
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
import ch93Faq from '@/tariff-data/chapters/exports/93-arms-and-ammunition/faq.json';
import ch93Markets from '@/tariff-data/chapters/exports/93-arms-and-ammunition/markets.json';
import ch93Overview from '@/tariff-data/chapters/exports/93-arms-and-ammunition/overview.json';
import ch93Rules from '@/tariff-data/chapters/exports/93-arms-and-ammunition/rules.json';
import ch93Updates from '@/tariff-data/chapters/exports/93-arms-and-ammunition/tariff-updates.json';
import ch94Faq from '@/tariff-data/chapters/exports/94-furniture-and-lighting-fittings/faq.json';
import ch94Markets from '@/tariff-data/chapters/exports/94-furniture-and-lighting-fittings/markets.json';
import ch94Overview from '@/tariff-data/chapters/exports/94-furniture-and-lighting-fittings/overview.json';
import ch94Rules from '@/tariff-data/chapters/exports/94-furniture-and-lighting-fittings/rules.json';
import ch94Updates from '@/tariff-data/chapters/exports/94-furniture-and-lighting-fittings/tariff-updates.json';
import ch38Faq from '@/tariff-data/chapters/exports/38-misc-chemical-products/faq.json';
import ch38Markets from '@/tariff-data/chapters/exports/38-misc-chemical-products/markets.json';
import ch38Overview from '@/tariff-data/chapters/exports/38-misc-chemical-products/overview.json';
import ch38Rules from '@/tariff-data/chapters/exports/38-misc-chemical-products/rules.json';
import ch38Updates from '@/tariff-data/chapters/exports/38-misc-chemical-products/tariff-updates.json';
import ch32Faq from '@/tariff-data/chapters/exports/32-dyes-pigments-and-paints/faq.json';
import ch32Markets from '@/tariff-data/chapters/exports/32-dyes-pigments-and-paints/markets.json';
import ch32Overview from '@/tariff-data/chapters/exports/32-dyes-pigments-and-paints/overview.json';
import ch32Rules from '@/tariff-data/chapters/exports/32-dyes-pigments-and-paints/rules.json';
import ch32Updates from '@/tariff-data/chapters/exports/32-dyes-pigments-and-paints/tariff-updates.json';
import ch73Faq from '@/tariff-data/chapters/exports/73-articles-of-iron-steel/faq.json';
import ch73Markets from '@/tariff-data/chapters/exports/73-articles-of-iron-steel/markets.json';
import ch73Overview from '@/tariff-data/chapters/exports/73-articles-of-iron-steel/overview.json';
import ch73Rules from '@/tariff-data/chapters/exports/73-articles-of-iron-steel/rules.json';
import ch73Updates from '@/tariff-data/chapters/exports/73-articles-of-iron-steel/tariff-updates.json';
import ch72Faq from '@/tariff-data/chapters/exports/72-iron-and-steel/faq.json';
import ch72Markets from '@/tariff-data/chapters/exports/72-iron-and-steel/markets.json';
import ch72Overview from '@/tariff-data/chapters/exports/72-iron-and-steel/overview.json';
import ch72Rules from '@/tariff-data/chapters/exports/72-iron-and-steel/rules.json';
import ch72Updates from '@/tariff-data/chapters/exports/72-iron-and-steel/tariff-updates.json';
import ch23Faq from '@/tariff-data/chapters/exports/23-food-industry-residues-and-feed/faq.json';
import ch23Markets from '@/tariff-data/chapters/exports/23-food-industry-residues-and-feed/markets.json';
import ch23Overview from '@/tariff-data/chapters/exports/23-food-industry-residues-and-feed/overview.json';
import ch23Rules from '@/tariff-data/chapters/exports/23-food-industry-residues-and-feed/rules.json';
import ch23Updates from '@/tariff-data/chapters/exports/23-food-industry-residues-and-feed/tariff-updates.json';
import ch08Faq from '@/tariff-data/chapters/exports/08-fruit-and-nuts/faq.json';
import ch08Markets from '@/tariff-data/chapters/exports/08-fruit-and-nuts/markets.json';
import ch08Overview from '@/tariff-data/chapters/exports/08-fruit-and-nuts/overview.json';
import ch08Rules from '@/tariff-data/chapters/exports/08-fruit-and-nuts/rules.json';
import ch08Updates from '@/tariff-data/chapters/exports/08-fruit-and-nuts/tariff-updates.json';
import ch07Faq from '@/tariff-data/chapters/exports/07-vegetables-and-roots/faq.json';
import ch07Markets from '@/tariff-data/chapters/exports/07-vegetables-and-roots/markets.json';
import ch07Overview from '@/tariff-data/chapters/exports/07-vegetables-and-roots/overview.json';
import ch07Rules from '@/tariff-data/chapters/exports/07-vegetables-and-roots/rules.json';
import ch07Updates from '@/tariff-data/chapters/exports/07-vegetables-and-roots/tariff-updates.json';
import ch33Faq from '@/tariff-data/chapters/exports/33-essential-oils-and-cosmetics/faq.json';
import ch33Markets from '@/tariff-data/chapters/exports/33-essential-oils-and-cosmetics/markets.json';
import ch33Overview from '@/tariff-data/chapters/exports/33-essential-oils-and-cosmetics/overview.json';
import ch33Rules from '@/tariff-data/chapters/exports/33-essential-oils-and-cosmetics/rules.json';
import ch33Updates from '@/tariff-data/chapters/exports/33-essential-oils-and-cosmetics/tariff-updates.json';
import ch34Faq from '@/tariff-data/chapters/exports/34-soaps-waxes-and-preparations/faq.json';
import ch34Markets from '@/tariff-data/chapters/exports/34-soaps-waxes-and-preparations/markets.json';
import ch34Overview from '@/tariff-data/chapters/exports/34-soaps-waxes-and-preparations/overview.json';
import ch34Rules from '@/tariff-data/chapters/exports/34-soaps-waxes-and-preparations/rules.json';
import ch34Updates from '@/tariff-data/chapters/exports/34-soaps-waxes-and-preparations/tariff-updates.json';
import ch03Faq from '@/tariff-data/chapters/exports/03-fish-and-crustaceans/faq.json';
import ch03Markets from '@/tariff-data/chapters/exports/03-fish-and-crustaceans/markets.json';
import ch03Overview from '@/tariff-data/chapters/exports/03-fish-and-crustaceans/overview.json';
import ch03Rules from '@/tariff-data/chapters/exports/03-fish-and-crustaceans/rules.json';
import ch03Updates from '@/tariff-data/chapters/exports/03-fish-and-crustaceans/tariff-updates.json';
import ch22Faq from '@/tariff-data/chapters/exports/22-beverages-spirits-vinegar/faq.json';
import ch22Markets from '@/tariff-data/chapters/exports/22-beverages-spirits-vinegar/markets.json';
import ch22Overview from '@/tariff-data/chapters/exports/22-beverages-spirits-vinegar/overview.json';
import ch22Rules from '@/tariff-data/chapters/exports/22-beverages-spirits-vinegar/rules.json';
import ch22Updates from '@/tariff-data/chapters/exports/22-beverages-spirits-vinegar/tariff-updates.json';
import ch44Faq from '@/tariff-data/chapters/exports/44-wood-and-charcoal/faq.json';
import ch44Markets from '@/tariff-data/chapters/exports/44-wood-and-charcoal/markets.json';
import ch44Overview from '@/tariff-data/chapters/exports/44-wood-and-charcoal/overview.json';
import ch44Rules from '@/tariff-data/chapters/exports/44-wood-and-charcoal/rules.json';
import ch44Updates from '@/tariff-data/chapters/exports/44-wood-and-charcoal/tariff-updates.json';
import ch74Faq from '@/tariff-data/chapters/exports/74-copper-and-articles/faq.json';
import ch74Markets from '@/tariff-data/chapters/exports/74-copper-and-articles/markets.json';
import ch74Overview from '@/tariff-data/chapters/exports/74-copper-and-articles/overview.json';
import ch74Rules from '@/tariff-data/chapters/exports/74-copper-and-articles/rules.json';
import ch74Updates from '@/tariff-data/chapters/exports/74-copper-and-articles/tariff-updates.json';
import ch70Faq from '@/tariff-data/chapters/exports/70-glass-and-glassware/faq.json';
import ch70Markets from '@/tariff-data/chapters/exports/70-glass-and-glassware/markets.json';
import ch70Overview from '@/tariff-data/chapters/exports/70-glass-and-glassware/overview.json';
import ch70Rules from '@/tariff-data/chapters/exports/70-glass-and-glassware/rules.json';
import ch70Updates from '@/tariff-data/chapters/exports/70-glass-and-glassware/tariff-updates.json';
import ch76Faq from '@/tariff-data/chapters/exports/76-aluminum-and-articles/faq.json';
import ch76Markets from '@/tariff-data/chapters/exports/76-aluminum-and-articles/markets.json';
import ch76Overview from '@/tariff-data/chapters/exports/76-aluminum-and-articles/overview.json';
import ch76Rules from '@/tariff-data/chapters/exports/76-aluminum-and-articles/rules.json';
import ch76Updates from '@/tariff-data/chapters/exports/76-aluminum-and-articles/tariff-updates.json';
import ch48Faq from '@/tariff-data/chapters/exports/48-paper-and-paperboard/faq.json';
import ch48Markets from '@/tariff-data/chapters/exports/48-paper-and-paperboard/markets.json';
import ch48Overview from '@/tariff-data/chapters/exports/48-paper-and-paperboard/overview.json';
import ch48Rules from '@/tariff-data/chapters/exports/48-paper-and-paperboard/rules.json';
import ch48Updates from '@/tariff-data/chapters/exports/48-paper-and-paperboard/tariff-updates.json';
import ch47Faq from '@/tariff-data/chapters/exports/47-wood-pulp-and-scrap/faq.json';
import ch47Markets from '@/tariff-data/chapters/exports/47-wood-pulp-and-scrap/markets.json';
import ch47Overview from '@/tariff-data/chapters/exports/47-wood-pulp-and-scrap/overview.json';
import ch47Rules from '@/tariff-data/chapters/exports/47-wood-pulp-and-scrap/rules.json';
import ch47Updates from '@/tariff-data/chapters/exports/47-wood-pulp-and-scrap/tariff-updates.json';
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
  '26-ores-slag-and-ash': {
    overview: ch26Overview as TariffExportOverviewContent,
    tariffUpdates: ch26Updates as TariffExportUpdatesContent,
    markets: ch26Markets as TariffExportMarketsContent,
    rules: ch26Rules as TariffExportRulesContent,
    faq: ch26Faq as TariffExportFaqContent,
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
  '28-inorganic-and-metal-compounds': {
    overview: ch28Overview as TariffExportOverviewContent,
    tariffUpdates: ch28Updates as TariffExportUpdatesContent,
    markets: ch28Markets as TariffExportMarketsContent,
    rules: ch28Rules as TariffExportRulesContent,
    faq: ch28Faq as TariffExportFaqContent,
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
  '40-rubber-and-articles': {
    overview: ch40Overview as TariffExportOverviewContent,
    tariffUpdates: ch40Updates as TariffExportUpdatesContent,
    markets: ch40Markets as TariffExportMarketsContent,
    rules: ch40Rules as TariffExportRulesContent,
    faq: ch40Faq as TariffExportFaqContent,
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
  '93-arms-and-ammunition': {
    overview: ch93Overview as TariffExportOverviewContent,
    tariffUpdates: ch93Updates as TariffExportUpdatesContent,
    markets: ch93Markets as TariffExportMarketsContent,
    rules: ch93Rules as TariffExportRulesContent,
    faq: ch93Faq as TariffExportFaqContent,
  },
  '94-furniture-and-lighting-fittings': {
    overview: ch94Overview as TariffExportOverviewContent,
    tariffUpdates: ch94Updates as TariffExportUpdatesContent,
    markets: ch94Markets as TariffExportMarketsContent,
    rules: ch94Rules as TariffExportRulesContent,
    faq: ch94Faq as TariffExportFaqContent,
  },
  '38-misc-chemical-products': {
    overview: ch38Overview as TariffExportOverviewContent,
    tariffUpdates: ch38Updates as TariffExportUpdatesContent,
    markets: ch38Markets as TariffExportMarketsContent,
    rules: ch38Rules as TariffExportRulesContent,
    faq: ch38Faq as TariffExportFaqContent,
  },
  '32-dyes-pigments-and-paints': {
    overview: ch32Overview as TariffExportOverviewContent,
    tariffUpdates: ch32Updates as TariffExportUpdatesContent,
    markets: ch32Markets as TariffExportMarketsContent,
    rules: ch32Rules as TariffExportRulesContent,
    faq: ch32Faq as TariffExportFaqContent,
  },
  '73-articles-of-iron-steel': {
    overview: ch73Overview as TariffExportOverviewContent,
    tariffUpdates: ch73Updates as TariffExportUpdatesContent,
    markets: ch73Markets as TariffExportMarketsContent,
    rules: ch73Rules as TariffExportRulesContent,
    faq: ch73Faq as TariffExportFaqContent,
  },
  '72-iron-and-steel': {
    overview: ch72Overview as TariffExportOverviewContent,
    tariffUpdates: ch72Updates as TariffExportUpdatesContent,
    markets: ch72Markets as TariffExportMarketsContent,
    rules: ch72Rules as TariffExportRulesContent,
    faq: ch72Faq as TariffExportFaqContent,
  },
  '23-food-industry-residues-and-feed': {
    overview: ch23Overview as TariffExportOverviewContent,
    tariffUpdates: ch23Updates as TariffExportUpdatesContent,
    markets: ch23Markets as TariffExportMarketsContent,
    rules: ch23Rules as TariffExportRulesContent,
    faq: ch23Faq as TariffExportFaqContent,
  },
  '8-fruit-and-nuts': {
    overview: ch08Overview as TariffExportOverviewContent,
    tariffUpdates: ch08Updates as TariffExportUpdatesContent,
    markets: ch08Markets as TariffExportMarketsContent,
    rules: ch08Rules as TariffExportRulesContent,
    faq: ch08Faq as TariffExportFaqContent,
  },
  '7-vegetables-and-roots': {
    overview: ch07Overview as TariffExportOverviewContent,
    tariffUpdates: ch07Updates as TariffExportUpdatesContent,
    markets: ch07Markets as TariffExportMarketsContent,
    rules: ch07Rules as TariffExportRulesContent,
    faq: ch07Faq as TariffExportFaqContent,
  },
  '33-essential-oils-and-cosmetics': {
    overview: ch33Overview as TariffExportOverviewContent,
    tariffUpdates: ch33Updates as TariffExportUpdatesContent,
    markets: ch33Markets as TariffExportMarketsContent,
    rules: ch33Rules as TariffExportRulesContent,
    faq: ch33Faq as TariffExportFaqContent,
  },
  '34-soaps-waxes-and-preparations': {
    overview: ch34Overview as TariffExportOverviewContent,
    tariffUpdates: ch34Updates as TariffExportUpdatesContent,
    markets: ch34Markets as TariffExportMarketsContent,
    rules: ch34Rules as TariffExportRulesContent,
    faq: ch34Faq as TariffExportFaqContent,
  },
  '3-fish-and-crustaceans': {
    overview: ch03Overview as TariffExportOverviewContent,
    tariffUpdates: ch03Updates as TariffExportUpdatesContent,
    markets: ch03Markets as TariffExportMarketsContent,
    rules: ch03Rules as TariffExportRulesContent,
    faq: ch03Faq as TariffExportFaqContent,
  },
  '22-beverages-spirits-vinegar': {
    overview: ch22Overview as TariffExportOverviewContent,
    tariffUpdates: ch22Updates as TariffExportUpdatesContent,
    markets: ch22Markets as TariffExportMarketsContent,
    rules: ch22Rules as TariffExportRulesContent,
    faq: ch22Faq as TariffExportFaqContent,
  },
  '44-wood-and-charcoal': {
    overview: ch44Overview as TariffExportOverviewContent,
    tariffUpdates: ch44Updates as TariffExportUpdatesContent,
    markets: ch44Markets as TariffExportMarketsContent,
    rules: ch44Rules as TariffExportRulesContent,
    faq: ch44Faq as TariffExportFaqContent,
  },
  '70-glass-and-glassware': {
    overview: ch70Overview as TariffExportOverviewContent,
    tariffUpdates: ch70Updates as TariffExportUpdatesContent,
    markets: ch70Markets as TariffExportMarketsContent,
    rules: ch70Rules as TariffExportRulesContent,
    faq: ch70Faq as TariffExportFaqContent,
  },
  '74-copper-and-articles': {
    overview: ch74Overview as TariffExportOverviewContent,
    tariffUpdates: ch74Updates as TariffExportUpdatesContent,
    markets: ch74Markets as TariffExportMarketsContent,
    rules: ch74Rules as TariffExportRulesContent,
    faq: ch74Faq as TariffExportFaqContent,
  },
  '76-aluminum-and-articles': {
    overview: ch76Overview as TariffExportOverviewContent,
    tariffUpdates: ch76Updates as TariffExportUpdatesContent,
    markets: ch76Markets as TariffExportMarketsContent,
    rules: ch76Rules as TariffExportRulesContent,
    faq: ch76Faq as TariffExportFaqContent,
  },
  '48-paper-and-paperboard': {
    overview: ch48Overview as TariffExportOverviewContent,
    tariffUpdates: ch48Updates as TariffExportUpdatesContent,
    markets: ch48Markets as TariffExportMarketsContent,
    rules: ch48Rules as TariffExportRulesContent,
    faq: ch48Faq as TariffExportFaqContent,
  },
  '47-wood-pulp-and-scrap': {
    overview: ch47Overview as TariffExportOverviewContent,
    tariffUpdates: ch47Updates as TariffExportUpdatesContent,
    markets: ch47Markets as TariffExportMarketsContent,
    rules: ch47Rules as TariffExportRulesContent,
    faq: ch47Faq as TariffExportFaqContent,
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
