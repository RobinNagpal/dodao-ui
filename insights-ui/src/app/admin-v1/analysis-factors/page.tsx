'use client';

import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { TickerV1Industry, TickerV1SubIndustry } from '@prisma/client';
import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';

const AnalysisFactorsPage = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedSubIndustry, setSelectedSubIndustry] = useState<string>('');
  const [industries, setIndustries] = useState<TickerV1Industry[]>([]);
  const [subIndustries, setSubIndustries] = useState<TickerV1SubIndustry[]>([]);
  const [loadingIndustries, setLoadingIndustries] = useState(true);
  const [loadingSubIndustries, setLoadingSubIndustries] = useState(false);

  const AnalysisFactorsTable = dynamic(() => import('@/components/analysis-factors/AnalysisFactorsTable'), {
    ssr: false,
  });

  // Fetch industries on component mount
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        setLoadingIndustries(true);
        const response = await fetch(`${getBaseUrl()}/api/industries`);
        if (!response.ok) throw new Error('Failed to fetch industries');
        const data: TickerV1Industry[] = await response.json();
        setIndustries(data.filter((industry) => !industry.archived)); // Only show non-archived
      } catch (error) {
        console.error('Error fetching industries:', error);
      } finally {
        setLoadingIndustries(false);
      }
    };

    fetchIndustries();
  }, []);

  // Fetch sub-industries when industry is selected
  useEffect(() => {
    const fetchSubIndustries = async () => {
      if (!selectedIndustry) {
        setSubIndustries([]);
        return;
      }

      try {
        setLoadingSubIndustries(true);
        const response = await fetch(`${getBaseUrl()}/api/sub-industries?industryKey=${selectedIndustry}`);
        if (!response.ok) throw new Error('Failed to fetch sub-industries');
        const data: TickerV1SubIndustry[] = await response.json();
        setSubIndustries(data.filter((subIndustry) => !subIndustry.archived)); // Only show non-archived
      } catch (error) {
        console.error('Error fetching sub-industries:', error);
      } finally {
        setLoadingSubIndustries(false);
      }
    };

    fetchSubIndustries();
  }, [selectedIndustry]);

  const handleIndustryChange = (industryKey: string) => {
    setSelectedIndustry(industryKey);
    setSelectedSubIndustry(''); // Reset sub-industry when industry changes
  };

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
                {industries.map((industry) => (
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
                {subIndustries.map((subIndustry) => (
                  <option key={subIndustry.subIndustryKey} value={subIndustry.subIndustryKey} className="bg-gray-700 text-white">
                    {subIndustry.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Analysis Factors Table */}
        {selectedIndustry && selectedSubIndustry && <AnalysisFactorsTable industryKey={selectedIndustry as any} subIndustryKey={selectedSubIndustry as any} />}

        {(!selectedIndustry || !selectedSubIndustry) && (
          <div className="text-center text-gray-400 py-12">Please select both Industry and Sub-Industry to manage analysis factors</div>
        )}
      </div>
    </PageWrapper>
  );
};

export default AnalysisFactorsPage;
