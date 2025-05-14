'use client';

import RawJsonEditModal from '@/components/prompts/RawJsonEditModal';
import SampleJsonEditModal from '@/components/prompts/SampleJsonEditModal';
import { SaveTickerFinancialsRequest } from '@/types/public-equity/ticker-request-response';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';

export interface TickerFinancialsButtonProps {
  tickerKey: string;
  tickerFinancialsContent?: string;
  onUpdate: () => Promise<void>;
}

export default function TickerFinancialsButton({ tickerKey, tickerFinancialsContent, onUpdate }: TickerFinancialsButtonProps) {
  const [showSampleJsonModal, setShowSampleJsonModal] = useState(false);
  const [showRawJsonModal, setShowRawJsonModal] = useState(false);

  const {
    putData: saveTickerFinancials,
    loading: tickerFinancialsLoading,
    error: tickerFinancialsError,
  } = usePutData<string, SaveTickerFinancialsRequest>({
    errorMessage: 'Failed to save Ticker Financials',
    successMessage: 'Ticker Financials saved successfully',
    redirectPath: ``,
  });

  const handleSaveTickerFinancials = async (jsonString: string) => {
    await saveTickerFinancials(`${getBaseUrl()}/api/tickers/${tickerKey}/ticker-financials`, {
      tickerFinancials: jsonString ?? '',
    });
    await onUpdate();
    setShowRawJsonModal(false);
    setShowSampleJsonModal(false);
  };

  return (
    <div className="flex justify-end my-5">
      <div>
        <span className="text-sm text-gray-500">Visual Editor:</span>
        <IconButton iconName={IconTypes.Edit} onClick={() => setShowSampleJsonModal(true)} />
        <span className="text-sm text-gray-500 ml-2">Raw JSON:</span>
        <IconButton iconName={IconTypes.Edit} onClick={() => setShowRawJsonModal(true)} />
      </div>
      {showSampleJsonModal && (
        <SampleJsonEditModal
          open={showSampleJsonModal}
          onClose={() => setShowSampleJsonModal(false)}
          title="Ticker Financials JSON"
          sampleJson={tickerFinancialsContent || ''}
          onSave={(jsonString) => handleSaveTickerFinancials(jsonString)}
        />
      )}
      {showRawJsonModal && (
        <RawJsonEditModal
          open={showRawJsonModal}
          onClose={() => setShowRawJsonModal(false)}
          title="Ticker Financials JSON"
          sampleJson={tickerFinancialsContent}
          onSave={(jsonString) => handleSaveTickerFinancials(jsonString)}
        />
      )}
    </div>
  );
}
