'use client';

import type { IndustryWithSubIndustriesAndCounts, SubIndustryWithCount } from '@/types/ticker-typesv1';
import { useMemo, type JSX } from 'react';
import type { TickerV1Industry, TickerV1SubIndustry } from '@prisma/client';
import { Building2, Tag } from 'lucide-react';
import EllipsisDropdown, { type EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import Link from 'next/link';

export type IndustryAction = 'addSub' | 'edit' | 'delete';
export type SubIndustryAction = 'edit' | 'delete';

export interface IndustryTreeProps {
  industries: IndustryWithSubIndustriesAndCounts[];
  onIndustryAction: (action: IndustryAction, industry: TickerV1Industry) => void;
  onSubIndustryAction: (action: SubIndustryAction, sub: TickerV1SubIndustry) => void;
}

function CountPill({ count, title }: { count: number; title?: string }): JSX.Element {
  return (
    <span title={title} className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[12px] leading-none px-1.5">
      {count}
    </span>
  );
}

export default function IndustryTree({ industries, onIndustryAction, onSubIndustryAction }: IndustryTreeProps): JSX.Element {
  const sortedIndustries: IndustryWithSubIndustriesAndCounts[] = useMemo(() => [...industries].sort((a, b) => a.name.localeCompare(b.name)), [industries]);

  const industryMenu: EllipsisDropdownItem[] = useMemo(
    () => [
      { key: 'addSub', label: 'Add sub-industry' },
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' },
    ],
    []
  );

  const subMenu: EllipsisDropdownItem[] = useMemo(
    () => [
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' },
    ],
    []
  );

  return (
    <div className="divide-y divide-gray-800">
      {sortedIndustries.map((ind, idx) => {
        const subs: SubIndustryWithCount[] = (ind.subIndustries ?? []).slice().sort((a, b) => a.name.localeCompare(b.name));

        // Alternate background for readability
        const rowBg: string = idx % 2 === 0 ? 'bg-gray-500/20 hover:bg-gray-500/30' : 'bg-gray-900/20 hover:bg-gray-900/30';

        return (
          <div key={ind.industryKey} className={`px-3 py-2 transition-colors ${rowBg}`}>
            {/* Top-aligned icon at the start of the industry block */}
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 text-indigo-400 self-start mt-0.5" />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {/* increased one level from earlier */}
                  <Link
                    href={`/stocks/industries/${ind.industryKey}`}
                    target="_blank"
                    className={`hover:text-gray-100 link-color ${ind.archived ? 'text-gray-400' : 'text-gray-100'}`}
                  >
                    <span className="truncate text-base font-medium mr-2">{ind.name}</span>
                    {/* Count next to name */}
                    <CountPill count={ind.tickerCount} title="Total tickers in this industry" />
                    {/* Show key with small gap */}
                    <span className="truncate text-xs ml-1">( {ind.industryKey} )</span>
                  </Link>
                  <EllipsisDropdown items={industryMenu} onSelect={(key): void => onIndustryAction(key as IndustryAction, ind)} />

                  {ind.archived && (
                    <span className="ml-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-xs text-amber-300">Archived</span>
                  )}
                </div>
                {ind.summary && <div className="text-sm text-gray-400">{ind.summary}</div>}
              </div>
            </div>

            <div className="ml-7 mt-1">
              {subs.length === 0 ? (
                <div className="text-sm text-gray-500 py-1">No sub-industries</div>
              ) : (
                <ul className="space-y-1">
                  {subs.map((si) => (
                    // Top-aligned tag at the start of each sub-industry block
                    <li key={si.subIndustryKey} className="flex items-start gap-2">
                      <Tag className="h-3.5 w-3.5 text-indigo-300 self-start mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm text-gray-100">{si.name}</span>
                          {/* Count next to sub-industry name */}
                          <CountPill count={si.tickerCount} title="Tickers in this sub-industry" />
                          {/* Key */}
                          <span className="truncate text-xs text-gray-400 ml-1">( {si.subIndustryKey} )</span>

                          <EllipsisDropdown items={subMenu} onSelect={(key): void => onSubIndustryAction(key as SubIndustryAction, si)} />

                          {si.archived && (
                            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-xs text-amber-300">Archived</span>
                          )}
                        </div>
                        {si.summary && <div className="text-sm text-gray-500">{si.summary}</div>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
