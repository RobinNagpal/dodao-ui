'use client';

import { EtfReportRow } from '@/app/api/[spaceId]/etfs-v1/etf-admin-reports/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { revalidateEtfCache } from '@/utils/cache-actions';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';

export interface EtfRowActionsDropdownProps {
  etf: EtfReportRow;
  onDone: () => void;
}

type FetchResponse = { success: boolean; etfUrl: string; errors: unknown[] };
type TriggerMorResponse = {
  success: boolean;
  message: string;
  url: string;
  kind: 'quote' | 'risk' | 'people' | 'portfolio';
};

export default function EtfRowActionsDropdown({ etf, onDone }: EtfRowActionsDropdownProps): JSX.Element {
  const [flushing, setFlushing] = useState(false);

  const { postData: fetchFinancialInfo, loading: fetchingFinancialInfo } = usePostData<FetchResponse, unknown>({
    successMessage: 'Fetched financial info successfully!',
    errorMessage: 'Failed to fetch financial info',
  });

  const { postData: triggerMorScrape, loading: triggeringMor } = usePostData<TriggerMorResponse, { kind: 'quote' | 'risk' | 'people' | 'portfolio' }>({
    successMessage: 'Request accepted. Processing in background.',
    errorMessage: 'Failed to fetch MOR info',
  });

  const isBusy = fetchingFinancialInfo || triggeringMor || flushing;

  const { postData: createGenerationRequest, loading: creatingGenRequest } = usePostData<unknown, unknown>({
    successMessage: 'Analysis generation request created!',
    errorMessage: 'Failed to create generation request',
  });

  const isBusyAll = isBusy || creatingGenRequest;

  const items: EllipsisDropdownItem[] = [
    { key: 'generateAnalysis', label: 'Generate All Analysis', disabled: isBusyAll },
    { key: 'generatePastReturns', label: 'Generate Past Returns', disabled: isBusyAll },
    { key: 'generateCostEfficiencyTeam', label: 'Generate Cost, Efficiency & Team', disabled: isBusyAll },
    { key: 'generateRiskAnalysis', label: 'Generate Risk Analysis', disabled: isBusyAll },
    { key: 'generateFutureOutlook', label: 'Generate Future Outlook', disabled: isBusyAll },
    { key: 'generateIndexStrategy', label: 'Generate Index & Strategy', disabled: isBusyAll },
    { key: 'generateCompetition', label: 'Generate Competition', disabled: isBusyAll },
    { key: 'generateFinalSummary', label: 'Generate Final Summary', disabled: isBusyAll },
    { key: 'financial', label: 'Financial Info', disabled: isBusyAll },
    { key: 'morAnalyzer', label: 'Mor Analyzer', disabled: isBusyAll },
    { key: 'morRisk', label: 'Mor Risk', disabled: isBusyAll },
    { key: 'morPeople', label: 'Mor People', disabled: isBusyAll },
    { key: 'morPortfolio', label: 'Mor Portfolio', disabled: isBusyAll },
    { key: 'flushCache', label: 'Flush Cache', disabled: isBusyAll },
  ];

  return (
    <EllipsisDropdown
      items={items}
      onSelect={async (key) => {
        if (key === 'generateAnalysis') {
          await createGenerationRequest(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/etfs-v1/generation-requests`, [
            {
              etf: { symbol: etf.symbol, exchange: etf.exchange },
              regeneratePerformanceAndReturns: true,
              regenerateCostEfficiencyAndTeam: true,
              regenerateRiskAnalysis: true,
              regenerateFuturePerformanceOutlook: true,
              regenerateIndexStrategy: true,
              regenerateCompetition: true,
              regenerateFinalSummary: true,
            },
          ]);
          onDone();
        } else if (key === 'generatePastReturns') {
          await createGenerationRequest(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/etfs-v1/generation-requests`, [
            {
              etf: { symbol: etf.symbol, exchange: etf.exchange },
              regeneratePerformanceAndReturns: true,
              regenerateCostEfficiencyAndTeam: false,
              regenerateRiskAnalysis: false,
              regenerateFuturePerformanceOutlook: false,
              regenerateIndexStrategy: false,
              regenerateFinalSummary: false,
            },
          ]);
          onDone();
        } else if (key === 'generateCostEfficiencyTeam') {
          await createGenerationRequest(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/etfs-v1/generation-requests`, [
            {
              etf: { symbol: etf.symbol, exchange: etf.exchange },
              regeneratePerformanceAndReturns: false,
              regenerateCostEfficiencyAndTeam: true,
              regenerateRiskAnalysis: false,
              regenerateFuturePerformanceOutlook: false,
              regenerateIndexStrategy: false,
              regenerateFinalSummary: false,
            },
          ]);
          onDone();
        } else if (key === 'generateRiskAnalysis') {
          await createGenerationRequest(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/etfs-v1/generation-requests`, [
            {
              etf: { symbol: etf.symbol, exchange: etf.exchange },
              regeneratePerformanceAndReturns: false,
              regenerateCostEfficiencyAndTeam: false,
              regenerateRiskAnalysis: true,
              regenerateFuturePerformanceOutlook: false,
              regenerateIndexStrategy: false,
              regenerateFinalSummary: false,
            },
          ]);
          onDone();
        } else if (key === 'generateFutureOutlook') {
          await createGenerationRequest(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/etfs-v1/generation-requests`, [
            {
              etf: { symbol: etf.symbol, exchange: etf.exchange },
              regeneratePerformanceAndReturns: false,
              regenerateCostEfficiencyAndTeam: false,
              regenerateRiskAnalysis: false,
              regenerateFuturePerformanceOutlook: true,
              regenerateIndexStrategy: false,
              regenerateFinalSummary: false,
            },
          ]);
          onDone();
        } else if (key === 'generateIndexStrategy') {
          await createGenerationRequest(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/etfs-v1/generation-requests`, [
            {
              etf: { symbol: etf.symbol, exchange: etf.exchange },
              regeneratePerformanceAndReturns: false,
              regenerateCostEfficiencyAndTeam: false,
              regenerateRiskAnalysis: false,
              regenerateFuturePerformanceOutlook: false,
              regenerateIndexStrategy: true,
              regenerateFinalSummary: false,
            },
          ]);
          onDone();
        } else if (key === 'generateCompetition') {
          await createGenerationRequest(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/etfs-v1/generation-requests`, [
            {
              etf: { symbol: etf.symbol, exchange: etf.exchange },
              regeneratePerformanceAndReturns: false,
              regenerateCostEfficiencyAndTeam: false,
              regenerateRiskAnalysis: false,
              regenerateFuturePerformanceOutlook: false,
              regenerateIndexStrategy: false,
              regenerateCompetition: true,
              regenerateFinalSummary: false,
            },
          ]);
          onDone();
        } else if (key === 'generateFinalSummary') {
          await createGenerationRequest(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/etfs-v1/generation-requests`, [
            {
              etf: { symbol: etf.symbol, exchange: etf.exchange },
              regeneratePerformanceAndReturns: false,
              regenerateCostEfficiencyAndTeam: false,
              regenerateRiskAnalysis: false,
              regenerateFuturePerformanceOutlook: false,
              regenerateIndexStrategy: false,
              regenerateFinalSummary: true,
            },
          ]);
          onDone();
        } else if (key === 'financial') {
          await fetchFinancialInfo(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${etf.exchange}/${etf.symbol}/fetch-financial-info`, {});
          onDone();
        } else if (key === 'morAnalyzer') {
          await triggerMorScrape(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${etf.exchange}/${etf.symbol}/fetch-mor-info`, { kind: 'quote' });
        } else if (key === 'morRisk') {
          await triggerMorScrape(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${etf.exchange}/${etf.symbol}/fetch-mor-info`, { kind: 'risk' });
        } else if (key === 'morPeople') {
          await triggerMorScrape(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${etf.exchange}/${etf.symbol}/fetch-mor-info`, { kind: 'people' });
        } else if (key === 'morPortfolio') {
          await triggerMorScrape(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${etf.exchange}/${etf.symbol}/fetch-mor-info`, {
            kind: 'portfolio',
          });
        } else if (key === 'flushCache') {
          setFlushing(true);
          await revalidateEtfCache(etf.symbol, etf.exchange);
          setFlushing(false);
        }
      }}
    />
  );
}
