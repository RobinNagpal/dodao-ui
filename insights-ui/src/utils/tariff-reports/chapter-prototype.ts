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

import type {
  StoredTariffChapterPrototype,
  StoredTariffEngineeringLine,
  StoredTariffLineStatus,
  TariffChapterPrototype,
  TariffEngineeringLine,
  TariffLineStatus,
  TariffRateTableRow,
} from '@/types/tariff-chapter-prototype';
import type { ChapterRouteInfo } from '@/utils/tariff-reports/chapter-route-helpers';
import type { Metadata } from 'next';

// ---------------------------------------------------------------------------
// Registry — ONE line per chapter: route slug -> lazy import of its content file.
// ---------------------------------------------------------------------------
//
// Each entry is a dynamic `import()` (not a static import, not `fs`): the bundler
// emits every chapter as its own chunk, so a request loads only the chapter it
// renders (a static map would pull every chapter — tens of MB — into every route
// that touches this module). The content is still bundled, so it works in every
// runtime, including serverless builds with no filesystem.
const CHAPTER_FILES: Record<string, () => Promise<{ default: unknown }>> = {
  '1-live-animals': () => import('@/tariff-data/chapters/01-live-animals.json'),
  '2-meat-and-offal': () => import('@/tariff-data/chapters/02-meat-and-offal.json'),
  '3-fish-and-crustaceans': () => import('@/tariff-data/chapters/03-fish-and-crustaceans.json'),
  '4-dairy-eggs-honey': () => import('@/tariff-data/chapters/04-dairy-eggs-honey.json'),
  '5-animal-products-nes': () => import('@/tariff-data/chapters/05-animal-products-nes.json'),
  '6-live-plants-and-bulbs': () => import('@/tariff-data/chapters/06-live-plants-and-bulbs.json'),
  '7-vegetables-and-roots': () => import('@/tariff-data/chapters/07-vegetables-and-roots.json'),
  '8-fruit-and-nuts': () => import('@/tariff-data/chapters/08-fruit-and-nuts.json'),
  '9-coffee-tea-spices': () => import('@/tariff-data/chapters/09-coffee-tea-spices.json'),
  '10-cereals': () => import('@/tariff-data/chapters/10-cereals.json'),
  '11-milling-products': () => import('@/tariff-data/chapters/11-milling-products.json'),
  '12-oil-seeds-and-grains': () => import('@/tariff-data/chapters/12-oil-seeds-and-grains.json'),
  '13-lac-gums-resins': () => import('@/tariff-data/chapters/13-lac-gums-resins.json'),
  '14-plaiting-materials-nes': () => import('@/tariff-data/chapters/14-plaiting-materials-nes.json'),
  '15-fats-and-oils': () => import('@/tariff-data/chapters/15-fats-and-oils.json'),
  '16-prepared-meat-and-fish': () => import('@/tariff-data/chapters/16-prepared-meat-and-fish.json'),
  '17-sugars-and-confectionery': () => import('@/tariff-data/chapters/17-sugars-and-confectionery.json'),
  '18-cocoa-and-preparations': () => import('@/tariff-data/chapters/18-cocoa-and-preparations.json'),
  '19-cereal-and-bakers-goods': () => import('@/tariff-data/chapters/19-cereal-and-bakers-goods.json'),
  '20-veg-fruit-preparations': () => import('@/tariff-data/chapters/20-veg-fruit-preparations.json'),
  '21-misc-edible-preparations': () => import('@/tariff-data/chapters/21-misc-edible-preparations.json'),
  '22-beverages-spirits-vinegar': () => import('@/tariff-data/chapters/22-beverages-spirits-vinegar.json'),
  '23-food-industry-residues-and-feed': () => import('@/tariff-data/chapters/23-food-industry-residues-and-feed.json'),
  '24-tobacco-and-substitutes': () => import('@/tariff-data/chapters/24-tobacco-and-substitutes.json'),
  '25-salt-sulfur-and-cements': () => import('@/tariff-data/chapters/25-salt-sulfur-and-cements.json'),
  '26-ores-slag-and-ash': () => import('@/tariff-data/chapters/26-ores-slag-and-ash.json'),
  '27-mineral-fuels-and-oils': () => import('@/tariff-data/chapters/27-mineral-fuels-and-oils.json'),
  '28-inorganic-and-metal-compounds': () => import('@/tariff-data/chapters/28-inorganic-and-metal-compounds.json'),
  '29-organic-chemicals': () => import('@/tariff-data/chapters/29-organic-chemicals.json'),
  '30-pharmaceutical-products': () => import('@/tariff-data/chapters/30-pharmaceutical-products.json'),
  '31-fertilizers': () => import('@/tariff-data/chapters/31-fertilizers.json'),
  '32-dyes-pigments-and-paints': () => import('@/tariff-data/chapters/32-dyes-pigments-and-paints.json'),
  '33-essential-oils-and-cosmetics': () => import('@/tariff-data/chapters/33-essential-oils-and-cosmetics.json'),
  '34-soaps-waxes-and-preparations': () => import('@/tariff-data/chapters/34-soaps-waxes-and-preparations.json'),
  '35-albuminoidal-substances-and-glues': () => import('@/tariff-data/chapters/35-albuminoidal-substances-and-glues.json'),
  '36-explosives-and-pyrotechnics': () => import('@/tariff-data/chapters/36-explosives-and-pyrotechnics.json'),
  '38-misc-chemical-products': () => import('@/tariff-data/chapters/38-misc-chemical-products.json'),
  '41-raw-hides-and-leather': () => import('@/tariff-data/chapters/41-raw-hides-and-leather.json'),
  '42-leather-articles-and-saddlery': () => import('@/tariff-data/chapters/42-leather-articles-and-saddlery.json'),
  '43-furskins-and-furs': () => import('@/tariff-data/chapters/43-furskins-and-furs.json'),
  '45-cork-and-articles': () => import('@/tariff-data/chapters/45-cork-and-articles.json'),
  '46-straw-and-wickerwork': () => import('@/tariff-data/chapters/46-straw-and-wickerwork.json'),
  '47-wood-pulp-and-scrap': () => import('@/tariff-data/chapters/47-wood-pulp-and-scrap.json'),
  '49-printing-industry-products': () => import('@/tariff-data/chapters/49-printing-industry-products.json'),
  '50-silk': () => import('@/tariff-data/chapters/50-silk.json'),
  '53-other-veg-textile-fibers': () => import('@/tariff-data/chapters/53-other-veg-textile-fibers.json'),
  '72-iron-and-steel': () => import('@/tariff-data/chapters/72-iron-and-steel.json'),
};

/**
 * Recently normalized chapters (a chapter's layout, page and metadata all ask for it in one request).
 * Bounded so a long-lived server that renders many chapters does not keep a normalized copy of each.
 */
const loaded = new Map<string, Promise<TariffChapterPrototype>>();
const MAX_LOADED = 8;

/** Slugs of every chapter with an Approach-2 content file. Cheap: no content file is loaded. */
export function listChapterPrototypeSlugs(): string[] {
  return Object.keys(CHAPTER_FILES);
}

/** True when the chapter has an Approach-2 content file (no content file is loaded). */
export function hasChapterPrototype(chapterSlug: string): boolean {
  return Object.prototype.hasOwnProperty.call(CHAPTER_FILES, chapterSlug);
}

/**
 * The content file exactly as stored (derived per-line fields not filled in, nothing cached beyond the
 * module itself). Enough for top-level facts across many chapters (sitemap, listing); renderers use
 * `getChapterPrototype`.
 */
export async function getStoredChapterPrototype(chapterSlug: string): Promise<StoredTariffChapterPrototype | null> {
  if (!hasChapterPrototype(chapterSlug)) return null;
  const mod = await CHAPTER_FILES[chapterSlug]();
  return mod.default as StoredTariffChapterPrototype;
}

/** The chapter's Approach-2 content with every derived field filled in, or null when it has no content file. */
export async function getChapterPrototype(chapterSlug: string): Promise<TariffChapterPrototype | null> {
  if (!hasChapterPrototype(chapterSlug)) return null;
  let prototype = loaded.get(chapterSlug);
  if (prototype) {
    loaded.delete(chapterSlug); // re-insert below: Map order doubles as least-recently-used order
  } else {
    prototype = getStoredChapterPrototype(chapterSlug).then((stored) => normalizeChapterPrototype(stored as StoredTariffChapterPrototype));
    prototype.catch(() => loaded.delete(chapterSlug));
  }
  loaded.set(chapterSlug, prototype);
  if (loaded.size > MAX_LOADED) loaded.delete(loaded.keys().next().value as string);
  return prototype;
}

/** The few facts a chapter's card on /tariff-reports shows. */
export interface ChapterPrototypeCard {
  asOf: string;
  /** The first "In short" takeaway, else the overview's SEO description. */
  summary: string;
}

/**
 * Card facts for the /tariff-reports listing. Reads the stored file without normalizing or caching the
 * full chapter, so listing every chapter does not hold every normalized chapter in memory.
 */
export async function getChapterPrototypeCard(chapterSlug: string): Promise<ChapterPrototypeCard | null> {
  const stored = await getStoredChapterPrototype(chapterSlug);
  if (!stored) return null;
  return { asOf: stored.asOf, summary: stored.finalConclusion?.keyTakeaways[0] ?? stored.overview.seo.shortDescription };
}

// ---------------------------------------------------------------------------
// Stored <-> rendered shape
// ---------------------------------------------------------------------------

/** A rate-table row's filter text: lowercased ancestor descriptions + own description + HTS number. */
export function rateRowSearchText(row: Pick<TariffRateTableRow, 'ancestorPath' | 'description' | 'hts'>): string {
  return [...row.ancestorPath, row.description, row.hts ?? ''].join(' ').toLowerCase();
}

/** The per-line fields copied from the rate-table row with the same `hts` (falls back to a stored copy for an unknown line). */
function lineFieldsFromRateTable(
  byHts: ReadonlyMap<string, TariffRateTableRow>,
  line: { hts: string; description?: string; ancestorPath?: string[]; searchText?: string }
): Pick<TariffRateTableRow, 'description' | 'ancestorPath' | 'searchText'> & { row: TariffRateTableRow | undefined } {
  const row = byHts.get(line.hts);
  return {
    row,
    description: row?.description ?? line.description ?? '',
    ancestorPath: row?.ancestorPath ?? line.ancestorPath ?? [],
    searchText: row?.searchText ?? line.searchText ?? line.hts.toLowerCase(),
  };
}

/**
 * Fills in the fields a content file does not store (see "Stored (on-disk) shape" in
 * `src/types/tariff-chapter-prototype.ts`): rate-table `searchText`, and each tariff-updates /
 * tariff-engineering line's `description`, `ancestorPath`, `searchText` (+ engineering `heading`,
 * `general`) from the rate-table row with the same `hts`. Copies stored by older files are ignored —
 * the rate table is the single source. Key order matches the pre-split files, so the result is
 * identical to what the renderers received before.
 */
export function normalizeChapterPrototype(stored: StoredTariffChapterPrototype): TariffChapterPrototype {
  const rows: TariffRateTableRow[] = stored.overview.rateTable.rows.map((row) => ({ ...row, searchText: rateRowSearchText(row) }));
  const byHts = new Map<string, TariffRateTableRow>();
  for (const row of rows) if (row.hts && !byHts.has(row.hts)) byHts.set(row.hts, row);

  const updateLine = (line: StoredTariffLineStatus): TariffLineStatus => {
    const { description, ancestorPath, searchText } = lineFieldsFromRateTable(byHts, line);
    return {
      hts: line.hts,
      description,
      ancestorPath,
      searchText,
      generalBefore: line.generalBefore,
      generalNow: line.generalNow,
      status: line.status,
      unchangedSince: line.unchangedSince,
    };
  };
  const engineeringLine = (line: StoredTariffEngineeringLine): TariffEngineeringLine => {
    const { row, description, ancestorPath, searchText } = lineFieldsFromRateTable(byHts, line);
    return {
      hts: line.hts,
      description,
      ancestorPath,
      searchText,
      heading: row?.heading ?? line.heading ?? line.hts.replace(/\D/g, '').slice(0, 4),
      general: row ? row.effectiveGeneral : line.general ?? null,
      ruleIds: line.ruleIds,
      leverIds: line.leverIds,
    };
  };

  // Spread-then-override keeps every key in its stored position (the type drops the stored line arrays,
  // which are always overridden below when present).
  const base: Omit<StoredTariffChapterPrototype, 'tariffUpdates' | 'tariffEngineering'> = stored;
  return {
    ...base,
    overview: { ...stored.overview, rateTable: { ...stored.overview.rateTable, rows } },
    ...(stored.tariffUpdates && { tariffUpdates: { ...stored.tariffUpdates, lines: stored.tariffUpdates.lines.map(updateLine) } }),
    ...(stored.tariffEngineering && { tariffEngineering: { ...stored.tariffEngineering, lines: stored.tariffEngineering.lines.map(engineeringLine) } }),
  };
}

const RATE_ROW_DERIVED_KEYS = ['searchText'] as const;
const UPDATE_LINE_DERIVED_KEYS = ['description', 'ancestorPath', 'searchText'] as const;
const ENGINEERING_LINE_DERIVED_KEYS = ['description', 'ancestorPath', 'searchText', 'heading', 'general'] as const;

function omitKeys<T extends object, K extends string>(obj: T, keys: readonly K[]): Omit<T, K> {
  const out = { ...obj } as Record<string, unknown>;
  for (const key of keys) delete out[key];
  return out as Omit<T, K>;
}

/**
 * The inverse of `normalizeChapterPrototype`: drops every derived field, leaving everything else (and
 * its key order) untouched. Used by the chapter generator and the one-off migration to write files.
 */
export function compactChapterPrototype(prototype: TariffChapterPrototype | StoredTariffChapterPrototype): StoredTariffChapterPrototype {
  const { overview, tariffUpdates, tariffEngineering } = prototype;
  return {
    ...prototype,
    overview: { ...overview, rateTable: { ...overview.rateTable, rows: overview.rateTable.rows.map((row) => omitKeys(row, RATE_ROW_DERIVED_KEYS)) } },
    ...(tariffUpdates && { tariffUpdates: { ...tariffUpdates, lines: tariffUpdates.lines.map((line) => omitKeys(line, UPDATE_LINE_DERIVED_KEYS)) } }),
    ...(tariffEngineering && {
      tariffEngineering: { ...tariffEngineering, lines: tariffEngineering.lines.map((line) => omitKeys(line, ENGINEERING_LINE_DERIVED_KEYS)) },
    }),
  };
}

/**
 * Derived fields a content file still stores (files written before the split) whose value differs from
 * what the loader derives — the page shows the derived value, so each one is a content bug. Also lists
 * tariff-updates / tariff-engineering lines with no rate-table row to derive from. Empty for a compact file.
 */
export function storedDerivedFieldMismatches(stored: StoredTariffChapterPrototype): string[] {
  const rendered = normalizeChapterPrototype(stored);
  const problems: string[] = [];
  const hts = new Set(rendered.overview.rateTable.rows.map((row) => row.hts));
  const compare = (where: string, storedItem: object, renderedItem: object, keys: readonly string[]): void => {
    for (const key of keys) {
      const value = (storedItem as Record<string, unknown>)[key];
      if (value !== undefined && JSON.stringify(value) !== JSON.stringify((renderedItem as Record<string, unknown>)[key])) {
        problems.push(
          `${where}.${key}: stored ${JSON.stringify(value)} differs from the rate table's ${JSON.stringify((renderedItem as Record<string, unknown>)[key])}`
        );
      }
    }
  };
  stored.overview.rateTable.rows.forEach((row, i) =>
    compare(`overview.rateTable.rows[${row.id}]`, row, rendered.overview.rateTable.rows[i], RATE_ROW_DERIVED_KEYS)
  );
  stored.tariffUpdates?.lines.forEach((line, i) => {
    if (!hts.has(line.hts)) problems.push(`tariffUpdates.lines[${line.hts}]: no rate-table row with this hts`);
    else compare(`tariffUpdates.lines[${line.hts}]`, line, rendered.tariffUpdates?.lines[i] ?? {}, UPDATE_LINE_DERIVED_KEYS);
  });
  stored.tariffEngineering?.lines.forEach((line, i) => {
    if (!hts.has(line.hts)) problems.push(`tariffEngineering.lines[${line.hts}]: no rate-table row with this hts`);
    else compare(`tariffEngineering.lines[${line.hts}]`, line, rendered.tariffEngineering?.lines[i] ?? {}, ENGINEERING_LINE_DERIVED_KEYS);
  });
  return problems;
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
