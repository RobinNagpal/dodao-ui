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
type TriggerMorResponse = { success: boolean; message: string; url: string; kind: 'quote' | 'risk' | 'people' };

export default function EtfRowActionsDropdown({ etf, onDone }: EtfRowActionsDropdownProps): JSX.Element {
  const [flushing, setFlushing] = useState(false);

  const { postData: fetchFinancialInfo, loading: fetchingFinancialInfo } = usePostData<FetchResponse, unknown>({
    successMessage: 'Fetched financial info successfully!',
    errorMessage: 'Failed to fetch financial info',
  });

  const { postData: triggerMorScrape, loading: triggeringMor } = usePostData<TriggerMorResponse, { kind: 'quote' | 'risk' | 'people' }>({
    successMessage: 'Request accepted. Processing in background.',
    errorMessage: 'Failed to queue Morningstar scrape',
  });

  const isBusy = fetchingFinancialInfo || triggeringMor || flushing;

  const items: EllipsisDropdownItem[] = [
    { key: 'financial', label: 'Financial Info', disabled: isBusy },
    { key: 'morAnalyzer', label: 'Mor Analyzer', disabled: isBusy },
    { key: 'morRisk', label: 'Mor Risk', disabled: isBusy },
    { key: 'morPeople', label: 'Mor People', disabled: isBusy },
    { key: 'flushCache', label: 'Flush Cache', disabled: isBusy },
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
        } else if (key === 'flushCache') {
          setFlushing(true);
          await revalidateEtfCache(etf.symbol, etf.exchange);
          setFlushing(false);
        }
      }}
    />
  );
}
