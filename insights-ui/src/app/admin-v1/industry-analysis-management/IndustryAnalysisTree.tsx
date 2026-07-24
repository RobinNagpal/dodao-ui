'use client';

import { useMemo, type JSX } from 'react';
import type { IndustryBuildingBlockAnalysis } from '@prisma/client';
import { Building2, Tag } from 'lucide-react';
import EllipsisDropdown, { type EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import Link from 'next/link';
import type { IndustryAnalysisWithRelations } from '@/types/ticker-typesv1';

export type IndustryAnalysisAction = 'addSub' | 'edit' | 'delete';
export type SubIndustryAnalysisAction = 'edit' | 'delete';

export interface IndustryAnalysisTreeProps {
  industryAnalyses: IndustryAnalysisWithRelations[];
  onIndustryAnalysisAction: (action: IndustryAnalysisAction, industryAnalysis: IndustryAnalysisWithRelations) => void;
  onSubIndustryAnalysisAction: (action: SubIndustryAnalysisAction, sub: IndustryBuildingBlockAnalysis) => void;
}

export default function IndustryAnalysisTree({
  industryAnalyses,
  onIndustryAnalysisAction,
  onSubIndustryAnalysisAction,
}: IndustryAnalysisTreeProps): JSX.Element {
  const sortedIndustryAnalyses: IndustryAnalysisWithRelations[] = useMemo(
    () => [...industryAnalyses].sort((a, b) => a.name.localeCompare(b.name)),
    [industryAnalyses]
  );

  const industryAnalysisMenu: EllipsisDropdownItem[] = useMemo(
    () => [
      { key: 'addSub', label: 'Add building block analysis' },
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' },
    ],
    []
  );

  const subAnalysisMenu: EllipsisDropdownItem[] = useMemo(
    () => [
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' },
    ],
    []
  );

  return (
    <div className="divide-y divide-border">
      {sortedIndustryAnalyses.map((indAnalysis, idx) => {
        const subs: IndustryBuildingBlockAnalysis[] = (indAnalysis.subIndustryAnalyses ?? []).slice().sort((a, b) => a.name.localeCompare(b.name));

        // Alternate background for readability
        const rowBg: string = idx % 2 === 0 ? 'bg-surface-2 hover:bg-surface-3' : 'bg-surface hover:bg-surface-2';

        return (
          <div key={indAnalysis.id} className={`px-3 py-2 transition-colors ${rowBg}`}>
            {/* Top-aligned icon at the start of the industry analysis block */}
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 text-link self-start mt-0.5" />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/stocks/industries/${indAnalysis.industry.industryKey}/analysis`}
                        target="_blank"
                        className="hover:text-body link-color text-body"
                      >
                        <span className="truncate text-base font-medium">{indAnalysis.name}</span>
                      </Link>
                      <EllipsisDropdown
                        items={industryAnalysisMenu}
                        onSelect={(key): void => onIndustryAnalysisAction(key as IndustryAnalysisAction, indAnalysis)}
                      />
                    </div>
                    <span className="truncate text-xs text-muted">
                      Industry: {indAnalysis.industry.name} ({indAnalysis.industry.industryKey})
                    </span>
                  </div>
                </div>
                {indAnalysis.metaDescription && <div className="text-sm text-muted mt-1">{indAnalysis.metaDescription}</div>}
              </div>
            </div>

            <div className="ml-7 mt-1">
              {subs.length === 0 ? (
                <div className="text-sm text-muted py-1">No building block analyses</div>
              ) : (
                <ul className="space-y-1">
                  {subs.map((subAnalysis) => (
                    // Top-aligned tag at the start of each sub-industry analysis block
                    <li key={subAnalysis.id} className="flex items-start gap-2">
                      <Tag className="h-3.5 w-3.5 text-link self-start mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/stocks/industries/${indAnalysis.industry.industryKey}/analysis/building-blocks/${subAnalysis.buildingBlockKey}`}
                                target="_blank"
                                className="hover:text-body link-color text-body"
                              >
                                <span className="truncate text-sm">{subAnalysis.name}</span>
                              </Link>
                              <span className="truncate text-xs text-muted ml-1">( {subAnalysis.buildingBlockKey} )</span>
                              <EllipsisDropdown
                                items={subAnalysisMenu}
                                onSelect={(key): void => onSubIndustryAnalysisAction(key as SubIndustryAnalysisAction, subAnalysis)}
                              />
                            </div>
                          </div>
                        </div>
                        {subAnalysis.metaDescription && <div className="text-sm text-muted mt-1">{subAnalysis.metaDescription}</div>}
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
