import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

// The `chapter` block of a content file: number, live slug, title and HTSUS section.
//
// The slug MUST be the chapter's live slug (`/industry-tariff-report/sitemap.xml`, "<n>-<kebab>"),
// which is a short form that does not always follow the HTS title (chapter 2 is "2-meat-and-offal").
// A mismatched slug silently serves the old page at the real URL, so the generator checks it.

export const KOALAGAINS_BASE = 'https://koalagains.com';
export const TARIFF_SITEMAP_URL = `${KOALAGAINS_BASE}/industry-tariff-report/sitemap.xml`;

/** HTSUS sections (Roman numeral, title, chapter range) — the 22 sections of the schedule. */
const HTS_SECTIONS: { number: number; roman: string; title: string; from: number; to: number }[] = [
  { number: 1, roman: 'I', title: 'Live Animals; Animal Products', from: 1, to: 5 },
  { number: 2, roman: 'II', title: 'Vegetable Products', from: 6, to: 14 },
  {
    number: 3,
    roman: 'III',
    title: 'Animal or Vegetable Fats and Oils and Their Cleavage Products; Prepared Edible Fats; Animal or Vegetable Waxes',
    from: 15,
    to: 15,
  },
  {
    number: 4,
    roman: 'IV',
    title: 'Prepared Foodstuffs; Beverages, Spirits and Vinegar; Tobacco and Manufactured Tobacco Substitutes',
    from: 16,
    to: 24,
  },
  { number: 5, roman: 'V', title: 'Mineral Products', from: 25, to: 27 },
  { number: 6, roman: 'VI', title: 'Products of the Chemical or Allied Industries', from: 28, to: 38 },
  { number: 7, roman: 'VII', title: 'Plastics and Articles Thereof; Rubber and Articles Thereof', from: 39, to: 40 },
  {
    number: 8,
    roman: 'VIII',
    title:
      'Raw Hides and Skins, Leather, Furskins and Articles Thereof; Saddlery and Harness; Travel Goods, Handbags and Similar Containers; Articles of Animal Gut (Other Than Silkworm Gut)',
    from: 41,
    to: 43,
  },
  {
    number: 9,
    roman: 'IX',
    title:
      'Wood and Articles of Wood; Wood Charcoal; Cork and Articles of Cork; Manufactures of Straw, of Esparto or of Other Plaiting Materials; Basketware and Wickerwork',
    from: 44,
    to: 46,
  },
  {
    number: 10,
    roman: 'X',
    title: 'Pulp of Wood or of Other Fibrous Cellulosic Material; Recovered (Waste and Scrap) Paper or Paperboard; Paper and Paperboard and Articles Thereof',
    from: 47,
    to: 49,
  },
  { number: 11, roman: 'XI', title: 'Textiles and Textile Articles', from: 50, to: 63 },
  {
    number: 12,
    roman: 'XII',
    title:
      'Footwear, Headgear, Umbrellas, Sun Umbrellas, Walking Sticks, Seat-Sticks, Whips, Riding-Crops and Parts Thereof; Prepared Feathers and Articles Made Therewith; Artificial Flowers; Articles of Human Hair',
    from: 64,
    to: 67,
  },
  {
    number: 13,
    roman: 'XIII',
    title: 'Articles of Stone, Plaster, Cement, Asbestos, Mica or Similar Materials; Ceramic Products; Glass and Glassware',
    from: 68,
    to: 70,
  },
  {
    number: 14,
    roman: 'XIV',
    title:
      'Natural or Cultured Pearls, Precious or Semi-Precious Stones, Precious Metals, Metals Clad With Precious Metal, and Articles Thereof; Imitation Jewelry; Coin',
    from: 71,
    to: 71,
  },
  { number: 15, roman: 'XV', title: 'Base Metals and Articles of Base Metal', from: 72, to: 83 },
  {
    number: 16,
    roman: 'XVI',
    title:
      'Machinery and Mechanical Appliances; Electrical Equipment; Parts Thereof; Sound Recorders and Reproducers, Television Image and Sound Recorders and Reproducers, and Parts and Accessories of Such Articles',
    from: 84,
    to: 85,
  },
  { number: 17, roman: 'XVII', title: 'Vehicles, Aircraft, Vessels and Associated Transport Equipment', from: 86, to: 89 },
  {
    number: 18,
    roman: 'XVIII',
    title:
      'Optical, Photographic, Cinematographic, Measuring, Checking, Precision, Medical or Surgical Instruments and Apparatus; Clocks and Watches; Musical Instruments; Parts and Accessories Thereof',
    from: 90,
    to: 92,
  },
  { number: 19, roman: 'XIX', title: 'Arms and Ammunition; Parts and Accessories Thereof', from: 93, to: 93 },
  { number: 20, roman: 'XX', title: 'Miscellaneous Manufactured Articles', from: 94, to: 96 },
  { number: 21, roman: 'XXI', title: "Works of Art, Collectors' Pieces and Antiques", from: 97, to: 97 },
  { number: 22, roman: 'XXII', title: 'Special Classification Provisions', from: 98, to: 99 },
];

export interface ChapterSection {
  number: number;
  roman: string;
  title: string;
}

export function sectionForChapter(chapter: number): ChapterSection {
  const s = HTS_SECTIONS.find((x) => chapter >= x.from && chapter <= x.to);
  if (!s) throw new Error(`no HTSUS section for chapter ${chapter}`);
  return { number: s.number, roman: s.roman, title: s.title };
}

export function padChapter(chapter: number): string {
  return String(chapter).padStart(2, '0');
}

/** Content file name for a live slug: "1-live-animals" → "01-live-animals.json". */
export function contentFileName(chapter: number, slug: string): string {
  return `${padChapter(chapter)}${slug.replace(/^\d+/, '')}.json`;
}

const SMALL_WORDS = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in', 'into', 'nor', 'of', 'on', 'or', 'the', 'to', 'with']);

/** "Meat and edible meat offal" → "Meat and Edible Meat Offal" (small words stay lower-case except first). */
export function titleCase(text: string): string {
  return text
    .trim()
    .split(/\s+/)
    .map((w, i) => {
      const lower = w.toLowerCase();
      if (i > 0 && SMALL_WORDS.has(lower.replace(/[^a-z]/g, ''))) return lower;
      // Keep acronyms / mixed case words as written ("HTS", "pH").
      if (/[A-Z]/.test(w.slice(1))) return w;
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(' ');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** GET a text URL with retries; the response is cached under `cacheDir` (when given) as `cacheName`. */
export async function fetchTextCached(url: string, cacheDir: string | null, cacheName: string, attempts = 3): Promise<string | null> {
  const cachePath = cacheDir ? path.join(cacheDir, cacheName) : null;
  if (cachePath && existsSync(cachePath)) return readFileSync(cachePath, 'utf8');
  for (let i = 0; i < attempts; i++) {
    if (i > 0) await sleep(1_500 * i);
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (KoalaGains chapter generator)' }, signal: AbortSignal.timeout(30_000) });
      if (!res.ok) continue;
      const text = await res.text();
      if (cachePath) {
        mkdirSync(path.dirname(cachePath), { recursive: true });
        writeFileSync(cachePath, text);
      }
      return text;
    } catch {
      // retry
    }
  }
  return null;
}

/** Live chapter slugs from the tariff-report sitemap, keyed by chapter number. Null when the sitemap can't be read. */
export async function liveChapterSlugs(cacheDir: string | null): Promise<Map<number, string> | null> {
  const xml = await fetchTextCached(TARIFF_SITEMAP_URL, cacheDir, 'industry-tariff-report-sitemap.xml');
  if (!xml) return null;
  const out = new Map<number, string>();
  const re = /\/industry-tariff-report\/chapters\/((\d+)-[a-z0-9-]+?)(?:[/<])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const n = Number(m[2]);
    if (!out.has(n)) out.set(n, m[1]);
  }
  return out;
}

/** Chapter title from the live chapter page's <title> ("HTS Chapter 02 — Meat and edible meat offal Tariff Report | KoalaGains"). */
export async function liveChapterTitle(slug: string, cacheDir: string | null): Promise<string | null> {
  const html = await fetchTextCached(`${KOALAGAINS_BASE}/industry-tariff-report/chapters/${slug}`, cacheDir, `chapter-page-${slug}.html`);
  if (!html) return null;
  const t = (/<title>([^<]*)<\/title>/i.exec(html)?.[1] ?? '').replace(/&amp;/g, '&').replace(/\s*\|.*$/, '');
  // DB-backed page: "HTS Chapter 02 — Meat and edible meat offal Tariff Report"; migrated: "HTS Chapter 01: Live Animals — Tariff Rates …".
  const m = /HTS Chapter \d+\s*[:—–-]\s*(.+)$/.exec(t);
  if (!m) return null;
  const title = m[1]
    .split(/\s+[—–]\s+/)[0]
    .replace(/\s+Tariff Report$/i, '')
    .trim();
  return title ? titleCase(title) : null;
}
