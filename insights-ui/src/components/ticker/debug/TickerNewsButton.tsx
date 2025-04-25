'use client';

import RawJsonEditModal from '@/components/prompts/RawJsonEditModal';
import SampleJsonEditModal from '@/components/prompts/SampleJsonEditModal';
import { SaveTickerNewsRequest } from '@/types/public-equity/ticker-request-response';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';

export interface TickerNewsButtonProps {
  tickerKey: string;
  tickerNewsContent?: string;
  onUpdate: () => Promise<void>;
}

export default function TickerNewsButton({ tickerKey, tickerNewsContent, onUpdate }: TickerNewsButtonProps) {
  const [showSampleJsonModal, setShowSampleJsonModal] = useState(false);
  const [showRawJsonModal, setShowRawJsonModal] = useState(false);

  const {
    putData: saveTickerNews,
    loading: tickerNewsLoading,
    error: tickerNewsError,
  } = usePutData<string, SaveTickerNewsRequest>({
    errorMessage: 'Failed to save Ticker News',
    successMessage: 'Ticker News saved successfully',
    redirectPath: ``,
  });

  const handleSaveTickerNews = async (jsonString: string) => {
    await saveTickerNews(`${getBaseUrl()}/api/tickers/${tickerKey}/ticker-news`, {
      tickerNews: jsonString ?? '',
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
          title="Ticker News JSON"
          sampleJson={tickerNewsContent || ''}
          onSave={(jsonString) => handleSaveTickerNews(jsonString)}
        />
      )}
      {showRawJsonModal && (
        <RawJsonEditModal
          open={showRawJsonModal}
          onClose={() => setShowRawJsonModal(false)}
          title="Ticker News JSON"
          sampleJson={tickerNewsContent}
          onSave={(jsonString) => handleSaveTickerNews(jsonString)}
        />
      )}
    </div>
  );
}
