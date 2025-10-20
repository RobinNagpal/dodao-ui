'use client';

import { useMemo } from 'react';
import { TickerV1Industry, TickerV1SubIndustry } from '@prisma/client';
import { Building2, Tag } from 'lucide-react';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';

export type IndustryAction = 'addSub' | 'edit' | 'delete';
export type SubIndustryAction = 'edit' | 'delete';

export interface IndustryTreeProps {
  industries: TickerV1Industry[];
  subByIndustry: Record<string, TickerV1SubIndustry[]>;
  onIndustryAction: (action: IndustryAction, industry: TickerV1Industry) => void;
  onSubIndustryAction: (action: SubIndustryAction, sub: TickerV1SubIndustry) => void;
}

export default function IndustryTree({ industries, subByIndustry, onIndustryAction, onSubIndustryAction }: IndustryTreeProps): JSX.Element {
  const sortedIndustries = useMemo(() => [...industries].sort((a, b) => a.name.localeCompare(b.name)), [industries]);

  const industryMenu = useMemo<EllipsisDropdownItem[]>(
    () => [
      { key: 'addSub', label: 'Add sub-industry' },
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' },
    ],
    []
  );

  const subMenu = useMemo<EllipsisDropdownItem[]>(
    () => [
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' },
    ],
    []
  );

  return (
    <div className="divide-y divide-gray-800">
      {sortedIndustries.map((ind, idx) => {
        const subs = (subByIndustry[ind.industryKey] ?? []).slice().sort((a, b) => a.name.localeCompare(b.name));

        // Alternate background for better readability across many rows
        const rowBg = idx % 2 === 0 ? 'bg-gray-500/20 hover:bg-gray-500/30' : 'bg-gray-900/20 hover:bg-gray-900/30';

        return (
          <div key={ind.industryKey} className={`px-3 py-2 transition-colors ${rowBg}`}>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-indigo-400" />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {/* bumped from text-sm -> text-base */}
                  <span className="truncate text-base text-gray-100 font-medium">{ind.name}</span>
                  {/* bumped from 11px -> text-xs */}
                  <span className="truncate text-xs text-gray-400">({ind.industryKey})</span>

                  <EllipsisDropdown items={industryMenu} onSelect={(key): void => onIndustryAction(key as IndustryAction, ind)} />

                  {ind.archived && (
                    // bumped from 10px -> text-xs
                    <span className="ml-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-xs text-amber-300">Archived</span>
                  )}
                </div>
                {/* bumped from 11px -> text-sm */}
                {ind.summary && <div className="text-sm text-gray-400">{ind.summary}</div>}
              </div>
            </div>

            <div className="ml-7 mt-1">
              {subs.length === 0 ? (
                // bumped from 12px -> text-sm
                <div className="text-sm text-gray-500 py-1">No sub-industries</div>
              ) : (
                <ul className="space-y-1">
                  {subs.map((si) => (
                    <li key={si.subIndustryKey} className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-indigo-300" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {/* bumped from 13px -> text-sm */}
                          <span className="truncate text-sm text-gray-100">{si.name}</span>
                          {/* bumped from 11px -> text-xs */}
                          <span className="truncate text-xs text-gray-400">({si.subIndustryKey})</span>

                          <EllipsisDropdown items={subMenu} onSelect={(key): void => onSubIndustryAction(key as SubIndustryAction, si)} />

                          {si.archived && (
                            // bumped from 10px -> text-xs
                            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-xs text-amber-300">Archived</span>
                          )}
                        </div>
                        {/* bumped from 11px -> text-sm */}
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
