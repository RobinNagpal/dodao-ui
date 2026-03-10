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
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-black bg-gradient-to-r from-[#38BDF8] to-[#818CF8] hover:from-[#0EA5E9] hover:to-[#6366F1] border border-transparent rounded-lg shadow-md"
        title="View competition analysis"
      >
        <TrophyIcon className="w-4 h-4 mr-2" aria-hidden="true" />
        <span>Competition Analysis</span>
      </Link>
    </div>
  );
}
