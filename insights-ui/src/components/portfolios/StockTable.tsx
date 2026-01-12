'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { FavouriteWithFullDetails, NoteWithFullDetails } from '@/types/portfolio';
import { getScoreColorClasses } from '@/utils/score-utils';
import TickerBadge from '@/components/favourites/TickerBadge';

type SortField = 'score' | 'myScore' | 'industry' | 'industryAndScore' | 'industryAndMyScore';
type SortDirection = 'asc' | 'desc';

interface StockTableProps {
  items: FavouriteWithFullDetails[] | NoteWithFullDetails[];
  type: 'favorites' | 'notes';
}

interface SortOption {
  label: string;
  value: SortField;
}

const sortOptions: SortOption[] = [
  { label: 'Industry', value: 'industry' },
  { label: 'Score', value: 'score' },
  { label: 'My Score', value: 'myScore' },
  { label: 'Industry + Score', value: 'industryAndScore' },
  { label: 'Industry + My Score', value: 'industryAndMyScore' },
];

export default function StockTable({ items, type }: StockTableProps) {
  const [sortField, setSortField] = useState<SortField>('industry');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Helper to get my score from either favorites or notes
  const getMyScore = (item: FavouriteWithFullDetails | NoteWithFullDetails): number | null => {
    if (type === 'favorites') {
      return (item as FavouriteWithFullDetails).myScore ?? null;
    }
    return (item as NoteWithFullDetails).score ?? null;
  };

  // Sorted items
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;

      const scoreA = a.ticker.cachedScoreEntry?.finalScore ?? 0;
      const scoreB = b.ticker.cachedScoreEntry?.finalScore ?? 0;
      const myScoreA = getMyScore(a) ?? 0;
      const myScoreB = getMyScore(b) ?? 0;
      const industryA = a.ticker.industry?.name ?? '';
      const industryB = b.ticker.industry?.name ?? '';
      const subIndustryA = a.ticker.subIndustry?.name ?? '';
      const subIndustryB = b.ticker.subIndustry?.name ?? '';

      switch (sortField) {
        case 'score':
          return (scoreA - scoreB) * direction;

        case 'myScore':
          return (myScoreA - myScoreB) * direction;

        case 'industry':
          const industryCompare = industryA.localeCompare(industryB) * direction;
          if (industryCompare !== 0) return industryCompare;
          return subIndustryA.localeCompare(subIndustryB) * direction;

        case 'industryAndScore':
          const indCompare1 = industryA.localeCompare(industryB) * direction;
          if (indCompare1 !== 0) return indCompare1;
          const subIndCompare1 = subIndustryA.localeCompare(subIndustryB) * direction;
          if (subIndCompare1 !== 0) return subIndCompare1;
          // Within same industry/sub-industry, always sort by score descending (highest first)
          return scoreB - scoreA;

        case 'industryAndMyScore':
          const indCompare2 = industryA.localeCompare(industryB) * direction;
          if (indCompare2 !== 0) return indCompare2;
          const subIndCompare2 = subIndustryA.localeCompare(subIndustryB) * direction;
          if (subIndCompare2 !== 0) return subIndCompare2;
          // Within same industry/sub-industry, always sort by my score descending (highest first)
          return myScoreB - myScoreA;

        default:
          return 0;
      }
    });
  }, [items, sortField, sortDirection]);

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-8 text-center border border-gray-800">
        <p className="text-gray-400">{type === 'favorites' ? 'No favorite stocks found.' : 'No notes found.'}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      {/* Sort Controls */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-800 bg-gray-900/50">
        <span className="text-sm text-gray-400">Sort by:</span>
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={`
                flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${sortField === option.value ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'}
              `}
            >
              {option.label}
              {sortField === option.value && (sortDirection === 'asc' ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ticker Details</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">My Score</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Industry</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Sub Industry</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {sortedItems.map((item) => {
              const myScore = getMyScore(item);
              const { textColorClass: myScoreTextColor, bgColorClass: myScoreBgColor } = myScore
                ? getScoreColorClasses(myScore)
                : { textColorClass: 'text-gray-500', bgColorClass: 'bg-gray-500' };

              return (
                <tr key={item.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-4">
                    <TickerBadge
                      ticker={{
                        id: item.ticker.id,
                        symbol: item.ticker.symbol,
                        name: item.ticker.name,
                        exchange: item.ticker.exchange,
                        cachedScoreEntry: item.ticker.cachedScoreEntry,
                      }}
                      showScore={true}
                      showName={true}
                      showFullName={true}
                      linkToStock={true}
                    />
                  </td>
                  <td className="px-4 py-4">
                    {myScore !== null ? (
                      <span className={`${myScoreTextColor} px-2 py-1 rounded ${myScoreBgColor} bg-opacity-15 text-sm font-mono font-medium`}>
                        {myScore}/25
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-300">{item.ticker.industry?.name ?? '—'}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-400">{item.ticker.subIndustry?.name ?? '—'}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer with count */}
      <div className="px-4 py-3 border-t border-gray-800 bg-gray-900/50">
        <p className="text-sm text-gray-400">
          Showing {items.length} {type === 'favorites' ? 'favorite' : 'noted'} stock{items.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
