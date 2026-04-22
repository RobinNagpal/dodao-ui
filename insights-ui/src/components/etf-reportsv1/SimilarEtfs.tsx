import type { SimilarEtf } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/similar-etfs/route';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { use } from 'react';

export interface SimilarEtfsProps {
  /** Promise-based fetch (resolved via `use()` to keep Suspense at the caller). */
  dataPromise: Promise<SimilarEtf[]>;
}

export default function SimilarEtfs({ dataPromise }: SimilarEtfsProps): JSX.Element | null {
  const similarEtfs: ReadonlyArray<SimilarEtf> = use(dataPromise);
  if (!similarEtfs || similarEtfs.length === 0) {
    return null;
  }

  return (
    <div id="similar-etfs" className="bg-gray-900 rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-700">Similar ETFs</h2>
      <p className="text-gray-300 mb-4">True peers tracking the same or a very similar index in the same category:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {similarEtfs.map((similarEtf) => (
          <Link
            key={similarEtf.id}
            href={`/etfs/${similarEtf.exchange.toUpperCase()}/${similarEtf.symbol.toUpperCase()}`}
            className="block bg-gray-800 p-4 rounded-md border border-gray-700 hover:border-[#F97316] transition-colors group"
          >
            <div className="flex flex-col gap-y-2">
              <div className="flex items-center gap-x-2 min-w-0">
                <h3 className="font-semibold text-lg text-[#F59E0B] group-hover:text-[#F97316] transition-colors truncate">{similarEtf.name}</h3>
                <ArrowTopRightOnSquareIcon className="size-4 text-gray-400 group-hover:text-[#F59E0B] transition-colors flex-shrink-0" />
              </div>
              <div className="text-sm text-gray-400">
                {similarEtf.symbol} • {similarEtf.exchange.toUpperCase()}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
