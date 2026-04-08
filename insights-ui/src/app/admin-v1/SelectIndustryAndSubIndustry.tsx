import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { TickerV1Industry, TickerV1SubIndustry } from '@prisma/client';
import React, { useCallback, useEffect } from 'react';

export interface SelectIndustryAndSubIndustryProps {
  selectedIndustry?: TickerV1Industry | null;
  selectedSubIndustry?: TickerV1SubIndustry | null;
  setSelectedIndustry: (industry: TickerV1Industry | null) => any;
  setSelectedSubIndustry: (subIndustry: TickerV1SubIndustry | null) => any;
}

const selectClassName =
  'w-full rounded-md py-1.5 pl-3 pr-10 text-sm shadow-sm ring-1 ring-inset ring-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-[var(--bg-color)] text-[var(--text-color)]';

export default function SelectIndustryAndSubIndustry({
  selectedIndustry,
  selectedSubIndustry,
  setSelectedIndustry,
  setSelectedSubIndustry,
}: SelectIndustryAndSubIndustryProps) {
  const { data: industries, loading: loadingIndustries } = useFetchData<TickerV1Industry[]>(
    `${getBaseUrl()}/api/industries`,
    { cache: 'no-cache' },
    'Failed to fetch industries'
  );

  const {
    data: subIndustries = [],
    loading: loadingSubIndustries,
    reFetchData: refetchSubIndustries,
  } = useFetchData<TickerV1SubIndustry[]>(
    `${getBaseUrl()}/api/sub-industries?industryKey=${selectedIndustry?.industryKey}`,
    { skipInitialFetch: !selectedIndustry?.industryKey, cache: 'no-cache' },
    'Failed to fetch sub-industries'
  );

  useEffect(() => {
    if (selectedIndustry) {
      refetchSubIndustries();
    }
  }, [selectedIndustry, refetchSubIndustries]);

  const activeIndustries = industries?.filter((industry) => !industry.archived) || [];
  const activeSubIndustries = subIndustries.filter((subIndustry) => !subIndustry.archived) || [];

  const handleIndustryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const key = e.target.value;
      if (key) {
        const industry = activeIndustries.find((i) => i.industryKey === key);
        setSelectedIndustry(industry || null);
      } else {
        setSelectedIndustry(null);
      }
    },
    [activeIndustries, setSelectedIndustry]
  );

  const handleSubIndustryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const key = e.target.value;
      if (key) {
        const subIndustry = activeSubIndustries.find((s) => s.subIndustryKey === key);
        setSelectedSubIndustry(subIndustry || null);
      } else {
        setSelectedSubIndustry(null);
      }
    },
    [activeSubIndustries, setSelectedSubIndustry]
  );

  if (loadingIndustries) {
    return (
      <div className="flex items-center justify-center py-8">
        <FullPageLoader className="!static !w-auto !h-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="my-2">
          <label className="block text-sm font-semibold leading-6">Industry</label>
          <div className="relative mt-2">
            <select className={selectClassName} value={selectedIndustry?.industryKey ?? ''} onChange={handleIndustryChange}>
              <option value="">Select…</option>
              {activeIndustries.map((industry) => (
                <option key={industry.industryKey} value={industry.industryKey}>
                  {industry.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="my-2">
          <label className="block text-sm font-semibold leading-6">Sub-Industry</label>
          <div className="relative mt-2">
            <select
              className={selectClassName}
              value={selectedSubIndustry?.subIndustryKey ?? ''}
              onChange={handleSubIndustryChange}
              disabled={loadingSubIndustries || activeSubIndustries.length === 0}
            >
              <option value="">{loadingSubIndustries ? 'Loading…' : 'Select…'}</option>
              {activeSubIndustries.map((subIndustry) => (
                <option key={subIndustry.subIndustryKey} value={subIndustry.subIndustryKey}>
                  {subIndustry.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-2 p-2 border border-gray-300 rounded-lg">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          Filtering by: {selectedIndustry?.name}
          {' → '}
          {selectedSubIndustry?.name}
        </p>
      </div>
    </div>
  );
}
