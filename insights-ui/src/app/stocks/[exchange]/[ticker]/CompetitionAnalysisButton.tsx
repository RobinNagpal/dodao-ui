import { TrophyIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export interface CompetitionAnalysisButtonProps {
  exchange: string;
  ticker: string;
}

export default function CompetitionAnalysisButton({ exchange, ticker }: CompetitionAnalysisButtonProps) {
  return (
    <div className="flex-shrink-0 relative">
      <Link
        href={`/stocks/${exchange}/${ticker}/competition`}
        prefetch={false}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-black bg-gradient-to-r from-sky-400 to-indigo-400 hover:from-sky-500 hover:to-indigo-500 border border-transparent rounded-lg shadow-md"
        title="View competition analysis"
      >
        <TrophyIcon className="w-4 h-4 mr-2" aria-hidden="true" />
        <span>Competition Analysis</span>
      </Link>
    </div>
  );
}
