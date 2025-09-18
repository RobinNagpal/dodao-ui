'use client';

import AdminNav from '@/app/admin-v1/AdminNav';
import SelectIndustryAndSubIndustry from '@/app/admin-v1/SelectIndustryAndSubIndustry';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { TickerV1Industry, TickerV1SubIndustry } from '@prisma/client';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';

const AnalysisFactorsPage = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<TickerV1Industry | null>(null);
  const [selectedSubIndustry, setSelectedSubIndustry] = useState<TickerV1SubIndustry | null>(null);

  const AnalysisFactorsTable = dynamic(() => import('@/components/analysis-factors/AnalysisFactorsTable'), {
    ssr: false,
  });
  const selectIndustry = async (industry: TickerV1Industry | null) => {
    setSelectedIndustry(industry);
    setSelectedSubIndustry(null);
  };

  const selectSubIndustry = async (subIndustry: TickerV1SubIndustry | null) => {
    console.log('selectSubIndustry', subIndustry);
    setSelectedSubIndustry(subIndustry);
  };

  return (
    <PageWrapper>
      <AdminNav />
      <div className="space-y-6">
        <div className="text-4xl text-center">Analysis Factors For TickersV1</div>

        <SelectIndustryAndSubIndustry
          selectedIndustry={selectedIndustry}
          selectedSubIndustry={selectedSubIndustry}
          setSelectedIndustry={selectIndustry}
          setSelectedSubIndustry={selectSubIndustry}
        />

        {/* Analysis Factors Table */}
        {selectedIndustry?.industryKey && selectedSubIndustry?.subIndustryKey && (
          <AnalysisFactorsTable
            industryKey={selectedIndustry?.industryKey}
            industrySummary={selectedIndustry.summary}
            subIndustryKey={selectedSubIndustry?.subIndustryKey}
            subIndustrySummary={selectedSubIndustry.summary}
          />
        )}
      </div>
    </PageWrapper>
  );
};

export default AnalysisFactorsPage;
