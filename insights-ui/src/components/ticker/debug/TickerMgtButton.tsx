'use client';

import RawJsonEditModal from '@/components/prompts/RawJsonEditModal';
import SampleJsonEditModal from '@/components/prompts/SampleJsonEditModal';
import { SaveMgtTeamAssessmentRequest } from '@/types/public-equity/ticker-request-response';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';

export interface TickerMgtTeamAssessmentButtonProps {
  tickerKey: string;
  tickerMgtTeamAssessmentContent?: string;
  onUpdate: () => Promise<void>;
}

export default function TickerMgtTeamAssessmentButton({ tickerKey, tickerMgtTeamAssessmentContent, onUpdate }: TickerMgtTeamAssessmentButtonProps) {
  const [showSampleJsonModal, setShowSampleJsonModal] = useState(false);
  const [showRawJsonModal, setShowRawJsonModal] = useState(false);

  const {
    putData: saveTickerMgtTeamAssessment,
    loading: tickerMgtTeamAssessmentLoading,
    error: tickerMgtTeamAssessmentError,
  } = usePutData<string, SaveMgtTeamAssessmentRequest>({
    errorMessage: 'Failed to save Ticker Mgt Team Assessment',
    successMessage: 'Ticker Mgt Team Assessment saved successfully',
    redirectPath: ``,
  });

  const handleSaveTickerMgtTeamAssessment = async (jsonString: string) => {
    await saveTickerMgtTeamAssessment(`${getBaseUrl()}/api/tickers/${tickerKey}/ticker-mgt-team-assessment`, {
      managementTeamAssessment: jsonString ?? '',
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
          title="Ticker MgtTeamAssessment JSON"
          sampleJson={tickerMgtTeamAssessmentContent || ''}
          onSave={(jsonString) => handleSaveTickerMgtTeamAssessment(jsonString)}
        />
      )}
      {showRawJsonModal && (
        <RawJsonEditModal
          open={showRawJsonModal}
          onClose={() => setShowRawJsonModal(false)}
          title="Ticker MgtTeamAssessment JSON"
          sampleJson={tickerMgtTeamAssessmentContent}
          onSave={(jsonString) => handleSaveTickerMgtTeamAssessment(jsonString)}
        />
      )}
    </div>
  );
}
