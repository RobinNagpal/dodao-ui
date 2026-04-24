import Link from 'next/link';
import { EtfInvestor } from '@/types/etf/etf-analysis-types';

export default function EtfInvestorCard({ investor }: { investor: EtfInvestor }): JSX.Element {
  return (
    <div className="bg-[#1F2937] border border-[#374151] rounded-lg overflow-hidden flex flex-col">
      <div className="px-4 py-3 bg-[#374151]">
        <h3 className="text-base font-semibold text-white leading-snug">{investor.name}</h3>
        <p className="text-xs text-gray-300 mt-1 line-clamp-3">{investor.shortDescription}</p>
      </div>

      <ul className="px-2 py-2 space-y-1 flex-1">
        {investor.etfInvestorGoals.map((goal) => (
          <li key={goal.key}>
            <Link
              href={`/etf-investors/${investor.key}/${goal.key}`}
              className="flex items-start justify-between gap-2 px-2 py-1.5 rounded hover:bg-[#2D3748] transition-colors group"
            >
              <span className="text-sm text-white group-hover:text-[#FBBF24]">{goal.name}</span>
              <span className="text-xs text-gray-500 whitespace-nowrap pt-0.5">{goal.etfs.length} ETFs</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="px-4 py-2 border-t border-[#374151] text-xs text-gray-400">{investor.etfInvestorGoals.length} goals</div>
    </div>
  );
}
