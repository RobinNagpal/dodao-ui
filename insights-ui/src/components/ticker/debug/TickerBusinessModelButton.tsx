'use client';

import RawJsonEditModal from '@/components/prompts/RawJsonEditModal';
import SampleJsonEditModal from '@/components/prompts/SampleJsonEditModal';
import { SaveTickerBusinessModelRequest } from '@/types/public-equity/ticker-request-response';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';

export interface TickerBusinessModelButtonProps {
  tickerKey: string;
  tickerBusinessModelContent?: string;
  onUpdate: () => Promise<void>;
}

export default function TickerBusinessModelButton({ tickerKey, tickerBusinessModelContent, onUpdate }: TickerBusinessModelButtonProps) {
  const [showSampleJsonModal, setShowSampleJsonModal] = useState(false);
  const [showRawJsonModal, setShowRawJsonModal] = useState(false);

  const {
    putData: saveTickerBusinessModel,
    loading: tickerBusinessModelLoading,
    error: tickerBusinessModelError,
  } = usePutData<string, SaveTickerBusinessModelRequest>({
    errorMessage: 'Failed to save Ticker BusinessModel',
    successMessage: 'Ticker BusinessModel saved successfully',
    redirectPath: ``,
  });

  const handleSaveTickerBusinessModel = async (jsonString: string) => {
    await saveTickerBusinessModel(`${getBaseUrl()}/api/tickers/${tickerKey}/ticker-business-model`, {
      tickerBusinessModel: jsonString ?? '',
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
          title="Ticker BusinessModel JSON"
          sampleJson={tickerBusinessModelContent || ''}
          onSave={(jsonString) => handleSaveTickerBusinessModel(jsonString)}
        />
      )}
      {showRawJsonModal && (
        <RawJsonEditModal
          open={showRawJsonModal}
          onClose={() => setShowRawJsonModal(false)}
          title="Ticker BusinessModel JSON"
          sampleJson={tickerBusinessModelContent}
          onSave={(jsonString) => handleSaveTickerBusinessModel(jsonString)}
        />
      )}
    </div>
  );
}
