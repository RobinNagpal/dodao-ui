'use client';

import { EtfReportRow } from '@/app/api/[spaceId]/etfs-v1/etf-admin-reports/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

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
  const { postData: fetchFinancialInfo, loading: fetchingFinancialInfo } = usePostData<FetchResponse, unknown>({
    successMessage: 'Fetched financial info successfully!',
    errorMessage: 'Failed to fetch financial info',
  });

  const { postData: triggerMorScrape, loading: triggeringMor } = usePostData<TriggerMorResponse, { kind: 'quote' | 'risk' | 'people' | 'portfolio' }>({
    successMessage: 'Request accepted. Processing in background.',
    errorMessage: 'Failed to queue Morningstar scrape',
  });

  const isBusy = fetchingFinancialInfo || triggeringMor;

  const items: EllipsisDropdownItem[] = [
    { key: 'financial', label: 'Financial Info', disabled: isBusy },
    { key: 'morAnalyzer', label: 'Mor Analyzer', disabled: isBusy },
    { key: 'morRisk', label: 'Mor Risk', disabled: isBusy },
    { key: 'morPeople', label: 'Mor People', disabled: isBusy },
    { key: 'morPortfolio', label: 'Mor Portfolio', disabled: isBusy },
  ];

  return (
    <EllipsisDropdown
      items={items}
      onSelect={async (key) => {
        if (key === 'financial') {
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
        }
      }}
    />
  );
}
