import Link from 'next/link';
import React from 'react';

const SECTIONS: ReadonlyArray<{ slug: string; label: string }> = [
  { slug: '', label: 'Full Stock Report' },
  { slug: 'business-and-moat', label: 'Business & Moat' },
  { slug: 'financial-statement-analysis', label: 'Financial Statements' },
  { slug: 'past-performance', label: 'Past Performance' },
  { slug: 'future-performance', label: 'Future Performance' },
  { slug: 'fair-value', label: 'Fair Value' },
  { slug: 'competition', label: 'Competition' },
  { slug: 'management-team', label: 'Management Team' },
];

export interface TickerRelatedSectionsProps {
  exchange: string;
  symbol: string;
  companyName: string;
  /** Slug of the current page so it is excluded from the related list (use '' for the parent report). */
  currentSlug: string;
}

export default function TickerRelatedSections({ exchange, symbol, companyName, currentSlug }: TickerRelatedSectionsProps): JSX.Element {
  const ex = exchange.toUpperCase();
  const tk = symbol.toUpperCase();
  const others = SECTIONS.filter((s) => s.slug !== currentSlug);

  return (
    <nav aria-label={`More ${companyName} (${tk}) analyses`} className="mt-10 pt-6 border-t border-color">
      <h2 className="text-lg font-semibold mb-3">
        More {companyName} ({tk}) analyses
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {others.map((s) => {
          const href = s.slug ? `/stocks/${ex}/${tk}/${s.slug}` : `/stocks/${ex}/${tk}`;
          return (
            <li key={s.slug || 'root'}>
              <Link href={href} className="block rounded-md px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white transition-colors">
                {companyName} ({tk}) {s.label} →
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
