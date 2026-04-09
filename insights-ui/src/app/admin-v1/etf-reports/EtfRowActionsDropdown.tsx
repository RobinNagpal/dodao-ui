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

export default function EtfRowActionsDropdown({ etf, onDone }: EtfRowActionsDropdownProps): JSX.Element {
  const { postData, loading } = usePostData<FetchResponse, unknown>({
    successMessage: 'Fetched financial info successfully!',
    errorMessage: 'Failed to fetch financial info',
  });

  const items: EllipsisDropdownItem[] = [
    { key: 'financial', label: 'Financial Info', disabled: loading },
    { key: 'morAnalyzer', label: 'Mor Analyzer', disabled: true },
    { key: 'morRisk', label: 'Mor Risk', disabled: true },
    { key: 'morPeople', label: 'Mor People', disabled: true },
  ];

  return (
    <EllipsisDropdown
      items={items}
      onSelect={async (key) => {
        if (key === 'financial') {
          await postData(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${etf.exchange}/${etf.symbol}/fetch-financial-info`, {});
          onDone();
        }
      }}
    />
  );
}
