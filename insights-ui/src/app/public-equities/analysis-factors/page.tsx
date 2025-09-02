'use client';

import AnalysisFactorsTable from '@/components/analysis-factors/AnalysisFactorsTable';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { INDUSTRY_OPTIONS, SUB_INDUSTRY_OPTIONS, CATEGORY_OPTIONS, IndustryKey, SubIndustryKey, TickerAnalysisCategory } from '@/lib/mappingsV1';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import React, { useState } from 'react';

const AnalysisFactorsPage = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryKey | ''>('');
  const [selectedSubIndustry, setSelectedSubIndustry] = useState<SubIndustryKey | ''>('');

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
        <div className="text-4xl text-center">Analysis Factors Management</div>

        {/* Industry and Sub-Industry Selection */}
        <div className="p-6 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Industry</label>
              <select
                value={selectedIndustry}
                onChange={(e) => {
                  setSelectedIndustry(e.target.value as IndustryKey);
                  setSelectedSubIndustry(''); // Reset sub-industry when industry changes
                }}
                className="w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="" className="bg-gray-700 text-white">
                  Select Industry
                </option>
                {INDUSTRY_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key} className="bg-gray-700 text-white">
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Sub-Industry</label>
              <select
                value={selectedSubIndustry}
                onChange={(e) => setSelectedSubIndustry(e.target.value as SubIndustryKey)}
                disabled={!selectedIndustry}
                className="w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-600 disabled:text-gray-400"
              >
                <option value="" className="bg-gray-700 text-white">
                  Select Sub-Industry
                </option>
                {SUB_INDUSTRY_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key} className="bg-gray-700 text-white">
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Analysis Factors Table */}
        {selectedIndustry && selectedSubIndustry && <AnalysisFactorsTable industryKey={selectedIndustry} subIndustryKey={selectedSubIndustry} />}

        {(!selectedIndustry || !selectedSubIndustry) && (
          <div className="text-center text-gray-400 py-12">Please select both Industry and Sub-Industry to manage analysis factors</div>
        )}
      </div>
    </PageWrapper>
  );
};

export default AnalysisFactorsPage;
