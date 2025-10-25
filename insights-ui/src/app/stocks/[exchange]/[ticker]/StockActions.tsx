'use client';

import { GenerationRequestPayload } from '@/app/api/[spaceId]/tickers-v1/[ticker]/generation-requests/route';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { InvestorKey } from '@/lib/mappingsV1';
import { KoalaGainsSession } from '@/types/auth';
import {
  analysisTypes,
  createBackgroundGenerationRequest,
  createSingleAnalysisBackgroundRequest,
  createSingleInvestorBackgroundRequest,
  investorAnalysisTypes,
} from '@/utils/report-generator-utils';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useRouter } from 'next/navigation';
import React, { ReactNode } from 'react';

interface StockActionsProps {
  tickerSymbol: string;
  session?: KoalaGainsSession;
  children?: ReactNode;
}

export default function StockActions({ tickerSymbol, children, session }: StockActionsProps): JSX.Element {
  const router = useRouter();

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
  ];

  const handleSelect = async (key: string) => {
    try {
      if (key.startsWith('generate-investor-')) {
        const investorKey = key.replace('generate-investor-', '');
        await createSingleInvestorBackgroundRequest(investorKey as InvestorKey, tickerSymbol, postRequest);
      } else if (key.startsWith('generate-')) {
        const analysisType = key.replace('generate-', '');
        await createSingleAnalysisBackgroundRequest(analysisType, tickerSymbol, postRequest);
      } else if (key === 'generate-all') {
        await createBackgroundGenerationRequest(tickerSymbol, postRequest);
      }

      // Redirect to generation requests page after any generation is initiated
      router.push('/admin-v1/generation-requests');
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  return (
    <div className="flex items-center space-x-2 z-10">
      {children}
      <PrivateWrapper session={session}>
        <EllipsisDropdown items={reportGenerationItems} className="px-2 py-2 z-10" onSelect={handleSelect} />
      </PrivateWrapper>
    </div>
  );
}
