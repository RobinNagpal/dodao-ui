import { TrophyIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export interface CompetitionAnalysisButtonProps {
  exchange: string;
  ticker: string;
}

export default function CompetitionAnalysisButton({ exchange, ticker }: CompetitionAnalysisButtonProps) {
  return (
    <div className="flex-shrink-0 relative z-10">
      <Link
        href={`/stocks/${exchange}/${ticker}/competition`}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg shadow-md relative z-10"
        title="View competition analysis"
      >
        <TrophyIcon className="w-5 h-5 mr-2" aria-hidden="true" />
        <span>Competition</span>
      </Link>
    </div>
  );
}
