'use client';

import RawJsonEditModal from '@/components/prompts/RawJsonEditModal';
import SampleJsonEditModal from '@/components/prompts/SampleJsonEditModal';
import { SaveTickerInfoRequest } from '@/types/public-equity/ticker-request-response';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';

export interface TickerInfoButtonProps {
  tickerKey: string;
  tickerInfoContent?: string;
  onUpdate: () => Promise<void>;
}

export default function TickerInfoButton({ tickerKey, tickerInfoContent, onUpdate }: TickerInfoButtonProps) {
  const [showSampleJsonModal, setShowSampleJsonModal] = useState(false);
  const [showRawJsonModal, setShowRawJsonModal] = useState(false);

  const {
    putData: saveTickerInfo,
    loading: tickerInfoLoading,
    error: tickerInfoError,
  } = usePutData<string, SaveTickerInfoRequest>({
    errorMessage: 'Failed to save Ticker Info',
    successMessage: 'Ticker Info saved successfully',
    redirectPath: ``,
  });

  const handleSaveTickerInfo = async (jsonString: string) => {
    await saveTickerInfo(`${getBaseUrl()}/api/tickers/${tickerKey}/ticker-info`, {
      tickerInfo: jsonString ?? '',
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
          title="Ticker Info JSON"
          sampleJson={tickerInfoContent || ''}
          onSave={(jsonString) => handleSaveTickerInfo(jsonString)}
        />
      )}
      {showRawJsonModal && (
        <RawJsonEditModal
          open={showRawJsonModal}
          onClose={() => setShowRawJsonModal(false)}
          title="Ticker Info JSON"
          sampleJson={tickerInfoContent}
          onSave={(jsonString) => handleSaveTickerInfo(jsonString)}
        />
      )}
    </div>
  );
}
