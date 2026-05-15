import { EtfAvailableSectionsResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/available-sections/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { etfAndExchangeTag } from '@/utils/etf-cache-utils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import Link from 'next/link';

const SECTIONS: ReadonlyArray<{ slug: string; label: string }> = [
  { slug: 'performance-returns', label: 'Past Returns' },
  { slug: 'cost-efficiency-team', label: 'Cost & Team' },
  { slug: 'risk-analysis', label: 'Risk Analysis' },
  { slug: 'future-performance-outlook', label: 'Future Outlook' },
  { slug: 'competition', label: 'Competition' },
  { slug: 'holdings', label: 'Holdings' },
];

const WEEK_IN_SECONDS = 7 * 24 * 60 * 60;

/**
 * Server-side helper for ETF detail/category pages. Calls the
 * `/available-sections` API so the page's other parallel fetches can share
 * the result via `Promise.all`, and so revalidation rides the same
 * per-ETF cache tag as the rest of the page data.
 */
export async function fetchEtfAvailableSlugs(exchange: string, symbol: string): Promise<string[]> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${exchange.toUpperCase()}/${symbol.toUpperCase()}/available-sections`;
  try {
    const res = await fetch(url, { next: { revalidate: WEEK_IN_SECONDS, tags: [etfAndExchangeTag(symbol, exchange)] } });
    if (!res.ok) return [];
    const data = (await res.json()) as EtfAvailableSectionsResponse;
    return data.slugs ?? [];
  } catch {
    return [];
  }
}

export interface EtfRelatedSectionsProps {
  /** Slugs known to have publishable content; resolved upstream so this stays a sync render. */
  availableSlugs: string[];
  exchange: string;
  symbol: string;
  etfName: string;
  /** Slug of the current sibling page so it is excluded from the related list. */
  currentSlug: string;
}

export default function EtfRelatedSections({ availableSlugs, exchange, symbol, etfName, currentSlug }: EtfRelatedSectionsProps): JSX.Element | null {
  const ex = exchange.toUpperCase();
  const sym = symbol.toUpperCase();
  const available = new Set(availableSlugs);
  const others = SECTIONS.filter((s) => s.slug !== currentSlug && available.has(s.slug));

  if (others.length === 0) return null;

  return (
    <nav aria-label={`More ${etfName} (${sym}) analyses`} className="mt-10 pt-6 border-t border-color">
      <h2 className="text-lg font-semibold mb-3">
        More {etfName} ({sym}) analyses
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {others.map((s) => (
          <li key={s.slug} className="h-full">
            <Link
              href={`/etfs/${ex}/${sym}/${s.slug}`}
              prefetch={false}
              className="flex h-full items-center rounded-md px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white transition-colors"
            >
              {s.label} &rarr;
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
