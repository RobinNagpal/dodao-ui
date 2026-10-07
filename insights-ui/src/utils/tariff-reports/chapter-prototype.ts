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
import type { TariffChapterPrototype } from '@/types/tariff-chapter-prototype';
import type { ChapterRouteInfo } from '@/utils/tariff-reports/chapter-route-helpers';
import type { Metadata } from 'next';

// Static imports (not `fs`) so the content is bundled and works in every
// runtime — including the edge/serverless build where there is no filesystem.
const PROTOTYPES_BY_SLUG: Record<string, TariffChapterPrototype> = {
  '01-live-animals': liveAnimals as TariffChapterPrototype,
};

export function getChapterPrototype(chapterSlug: string): TariffChapterPrototype | null {
  return PROTOTYPES_BY_SLUG[chapterSlug] ?? null;
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
