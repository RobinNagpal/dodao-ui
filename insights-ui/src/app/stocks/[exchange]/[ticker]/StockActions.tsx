'use client';

import PrivateWrapper from '@/components/auth/PrivateWrapper';
import {
  analysisTypes,
  investorAnalysisTypes,
  generateAnalysis,
  generateInvestorAnalysis,
  generateAllReports,
  createBackgroundGenerationRequest,
} from '@/utils/report-generator-utils';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { AnalysisRequest, TickerAnalysisResponse } from '@/types/public-equity/analysis-factors-types';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';
import React, { ReactNode } from 'react';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { GenerationRequestPayload } from '@/app/api/[spaceId]/tickers-v1/[ticker]/generation-requests/route';

interface StockActionsProps {
  tickerSymbol: string;
  children?: ReactNode;
}

export default function StockActions({ tickerSymbol, children }: StockActionsProps): JSX.Element {
  const router = useRouter();

  // Post hooks for analysis generation
  const { postData: postAnalysis } = usePostData<TickerAnalysisResponse, AnalysisRequest>({
    successMessage: 'Analysis generation started successfully!',
    errorMessage: 'Failed to generate analysis.',
  });

  // Post hook for background generation requests
  const { postData: postRequest } = usePostData<any, GenerationRequestPayload>({
    successMessage: 'Background generation request created successfully!',
    errorMessage: 'Failed to create background generation request.',
  });

  // Create dropdown items for all report types
  const reportGenerationItems: EllipsisDropdownItem[] = [
    ...analysisTypes.map((analysisType) => ({
      key: `generate-${analysisType.key}`,
      label: `Generate ${analysisType.label}`,
    })),
    ...investorAnalysisTypes.map((investorType) => ({
      key: `generate-investor-${investorType.key}`,
      label: `Generate ${investorType.label}`,
    })),
    { key: 'generate-all', label: 'Generate All Reports' },
    { key: 'generate-background', label: 'Generate All Reports (Background)' },
  ];

  const handleSelect = async (key: string) => {
    if (key.startsWith('generate-investor-')) {
      const investorKey = key.replace('generate-investor-', '');
      await generateInvestorAnalysis(investorKey, tickerSymbol, postAnalysis);
      return;
    }

    if (key.startsWith('generate-')) {
      const analysisType = key.replace('generate-', '');
      await generateAnalysis(analysisType, tickerSymbol, postAnalysis);
      return;
    }

    if (key === 'generate-all') {
      await generateAllReports(tickerSymbol, postAnalysis);
      return;
    }

    if (key === 'generate-background') {
      await createBackgroundGenerationRequest(tickerSymbol, postRequest);
      router.push('/admin-v1/generation-requests');
      return;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {children}
      <PrivateWrapper>
        <EllipsisDropdown items={reportGenerationItems} className="px-2 py-2" onSelect={handleSelect} />
      </PrivateWrapper>
    </div>
  );
}
