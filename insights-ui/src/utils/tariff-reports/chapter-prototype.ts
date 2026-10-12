// Loader for the Approach-2 chapter prototype content (issue #1770).
//
// While the Approach-2 page shape is being iterated on, a chapter's content
// lives in a JSON file instead of the database. Chapters with a file here
// render the new Approach-2 pages; every other chapter keeps the existing
// DB-backed flow untouched. That also means the prototype renders locally,
// where the tariff tables (`hts_codes`, `tariff_trade_analytics`) are empty.
//
// Replacing this with a query later is a one-function change: return the same
// `TariffChapterPrototype` shape and the renderers don't move.

import liveAnimals from '@/tariff-data/chapters/01-live-animals.json';
import meatAndOffal from '@/tariff-data/chapters/02-meat-and-offal.json';
import fishAndCrustaceans from '@/tariff-data/chapters/03-fish-and-crustaceans.json';
import vegetablesAndRoots from '@/tariff-data/chapters/07-vegetables-and-roots.json';
import fruitAndNuts from '@/tariff-data/chapters/08-fruit-and-nuts.json';
import coffeeTeaSpices from '@/tariff-data/chapters/09-coffee-tea-spices.json';
import cereals from '@/tariff-data/chapters/10-cereals.json';
import millingProducts from '@/tariff-data/chapters/11-milling-products.json';
import preparedMeatAndFish from '@/tariff-data/chapters/16-prepared-meat-and-fish.json';
import cocoaAndPreparations from '@/tariff-data/chapters/18-cocoa-and-preparations.json';
import vegFruitPreparations from '@/tariff-data/chapters/20-veg-fruit-preparations.json';
import miscEdiblePreparations from '@/tariff-data/chapters/21-misc-edible-preparations.json';
import foodIndustryResiduesAndFeed from '@/tariff-data/chapters/23-food-industry-residues-and-feed.json';
import tobaccoAndSubstitutes from '@/tariff-data/chapters/24-tobacco-and-substitutes.json';
import pharmaceuticalProducts from '@/tariff-data/chapters/30-pharmaceutical-products.json';
import fertilizers from '@/tariff-data/chapters/31-fertilizers.json';
import type { TariffChapterPrototype } from '@/types/tariff-chapter-prototype';
import type { ChapterRouteInfo } from '@/utils/tariff-reports/chapter-route-helpers';
import type { Metadata } from 'next';

// Static imports (not `fs`) so the content is bundled and works in every
// runtime — including the edge/serverless build where there is no filesystem.
const PROTOTYPES_BY_SLUG: Record<string, TariffChapterPrototype> = {
  '1-live-animals': liveAnimals as TariffChapterPrototype,
  '2-meat-and-offal': meatAndOffal as TariffChapterPrototype,
  '3-fish-and-crustaceans': fishAndCrustaceans as TariffChapterPrototype,
  '7-vegetables-and-roots': vegetablesAndRoots as TariffChapterPrototype,
  '8-fruit-and-nuts': fruitAndNuts as TariffChapterPrototype,
  '9-coffee-tea-spices': coffeeTeaSpices as TariffChapterPrototype,
  '10-cereals': cereals as TariffChapterPrototype,
  '11-milling-products': millingProducts as TariffChapterPrototype,
  '16-prepared-meat-and-fish': preparedMeatAndFish as TariffChapterPrototype,
  '18-cocoa-and-preparations': cocoaAndPreparations as TariffChapterPrototype,
  '20-veg-fruit-preparations': vegFruitPreparations as TariffChapterPrototype,
  '21-misc-edible-preparations': miscEdiblePreparations as TariffChapterPrototype,
  '23-food-industry-residues-and-feed': foodIndustryResiduesAndFeed as TariffChapterPrototype,
  '24-tobacco-and-substitutes': tobaccoAndSubstitutes as TariffChapterPrototype,
  '30-pharmaceutical-products': pharmaceuticalProducts as TariffChapterPrototype,
  '31-fertilizers': fertilizers as TariffChapterPrototype,
};

export function getChapterPrototype(chapterSlug: string): TariffChapterPrototype | null {
  return PROTOTYPES_BY_SLUG[chapterSlug] ?? null;
}

/** Slugs of every chapter with an Approach-2 content file (used by the content validator). */
export function listChapterPrototypeSlugs(): string[] {
  return Object.keys(PROTOTYPES_BY_SLUG);
}

/** The route facts (number, title, slug) the chapter shell and breadcrumbs need. */
export function prototypeChapterInfo(prototype: TariffChapterPrototype): ChapterRouteInfo {
  const { number, title, slug } = prototype.chapter;
  return { number, title, slug };
}

/** Page metadata for an Approach-2 page, from the SEO copy in its content file. */
export function buildPrototypeMetadata(seo: { title: string; shortDescription: string; keywords: string[] }, canonicalPath: string): Metadata {
  const canonicalUrl = `https://koalagains.com${canonicalPath}`;
  return {
    title: seo.title,
    description: seo.shortDescription,
    keywords: seo.keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: { title: seo.title, description: seo.shortDescription, url: canonicalUrl, siteName: 'KoalaGains', type: 'article' },
    twitter: { card: 'summary_large_image', title: seo.title, description: seo.shortDescription },
  };
}

/** The newest dated change on a chapter's tariff-updates page, for the header's "Latest change" line. */
export interface ChapterLatestChange {
  date: string;
  title: string;
}

/**
 * The newest entry in `tariffUpdates.changes` that is an actual tariff change: background notes
 * (`reference`), proposals not yet in force (`pending`) and "Checked" status rows are skipped.
 */
export function latestChapterChange(prototype: TariffChapterPrototype): ChapterLatestChange | null {
  const changes = prototype.tariffUpdates?.changes ?? [];
  const newest = changes
    .filter((change) => change.type !== 'reference' && change.type !== 'pending' && change.dateLabel !== 'Checked')
    .reduce<(typeof changes)[number] | null>((latest, change) => (!latest || change.date > latest.date ? change : latest), null);
  return newest ? { date: newest.date, title: newest.title } : null;
}
