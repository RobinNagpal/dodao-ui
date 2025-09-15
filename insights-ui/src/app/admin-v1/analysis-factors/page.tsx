'use client';

import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { TickerV1Industry, TickerV1SubIndustry } from '@prisma/client';
import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';

const AnalysisFactorsPage = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedSubIndustry, setSelectedSubIndustry] = useState<string>('');

  const AnalysisFactorsTable = dynamic(() => import('@/components/analysis-factors/AnalysisFactorsTable'), {
    ssr: false,
  });

  // Fetch industries using useFetchData hook
  const { data: industries = [], loading: loadingIndustries } = useFetchData<TickerV1Industry[]>(
    `${getBaseUrl()}/api/industries`,
    {},
    'Failed to fetch industries'
  );

  // Fetch sub-industries when industry is selected
  const {
    data: subIndustries = [],
    loading: loadingSubIndustries,
    reFetchData: refetchSubIndustries,
  } = useFetchData<TickerV1SubIndustry[]>(
    `${getBaseUrl()}/api/sub-industries?industryKey=${selectedIndustry}`,
    { skipInitialFetch: !selectedIndustry },
    'Failed to fetch sub-industries'
  );

  // Refetch sub-industries when industry changes
  useEffect(() => {
    if (selectedIndustry) {
      refetchSubIndustries();
    }
  }, [selectedIndustry, refetchSubIndustries]);

  const handleIndustryChange = (industryKey: string) => {
    setSelectedIndustry(industryKey);
    setSelectedSubIndustry(''); // Reset sub-industry when industry changes
  };

  // Filter out archived industries and sub-industries
  const activeIndustries = industries.filter((industry) => !industry.archived);
  const activeSubIndustries = subIndustries.filter((subIndustry) => !subIndustry.archived);

  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: `Analysis Factors`,
      href: `/public-equities/analysis-factors`,
      current: true,
    },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <div className="space-y-6">
        <div className="text-4xl text-center">Analysis Factors For TickersV1</div>

        {/* Industry and Sub-Industry Selection */}
        <div className="p-6 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Industry</label>
              <select
                value={selectedIndustry}
                onChange={(e) => handleIndustryChange(e.target.value)}
                className="w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loadingIndustries}
              >
                <option value="" className="bg-gray-700 text-white">
                  {loadingIndustries ? 'Loading industries...' : 'Select Industry'}
                </option>
                {activeIndustries.map((industry) => (
                  <option key={industry.industryKey} value={industry.industryKey} className="bg-gray-700 text-white">
                    {industry.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Sub-Industry</label>
              <select
                value={selectedSubIndustry}
                onChange={(e) => setSelectedSubIndustry(e.target.value)}
                disabled={!selectedIndustry || loadingSubIndustries}
                className="w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-600 disabled:text-gray-400"
              >
                <option value="" className="bg-gray-700 text-white">
                  {loadingSubIndustries ? 'Loading sub-industries...' : 'Select Sub-Industry'}
                </option>
                {activeSubIndustries.map((subIndustry) => (
                  <option key={subIndustry.subIndustryKey} value={subIndustry.subIndustryKey} className="bg-gray-700 text-white">
                    {subIndustry.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Analysis Factors Table */}
        {selectedIndustry && selectedSubIndustry && (
          <AnalysisFactorsTable
            industryKey={selectedIndustry as string}
            industrySummary={industries.find((i) => i.industryKey === selectedIndustry)!.summary as string}
            subIndustryKey={selectedSubIndustry as string}
            subIndustrySummary={subIndustries.find((i) => i.subIndustryKey === selectedSubIndustry)!.summary as string}
          />
        )}

        {(!selectedIndustry || !selectedSubIndustry) && (
          <div className="text-center text-gray-400 py-12">Please select both Industry and Sub-Industry to manage analysis factors</div>
        )}
      </div>
    </PageWrapper>
  );
};

export default AnalysisFactorsPage;
