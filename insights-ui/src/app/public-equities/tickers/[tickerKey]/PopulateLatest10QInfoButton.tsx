'use client';

import Button from '@dodao/web-core/components/core/buttons/Button';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Ticker } from '@prisma/client';
import { useState } from 'react';

export interface PopulateLatest10QInfoButtonProps {
  tickerKey: string;
  onSuccess?: () => Promise<void>;
  isRepopulate?: boolean;
}

export default function PopulateLatest10QInfoButton({ tickerKey, onSuccess, isRepopulate = false }: PopulateLatest10QInfoButtonProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { postData, loading } = usePostData<Ticker, {}>({
    errorMessage: 'Failed to populate latest 10Q Info.',
  });

  const handlePopulateLatest10QInfo = async () => {
    await postData(`${getBaseUrl()}/api/tickers/${tickerKey}/latest-10q-info`);
    if (onSuccess) {
      await onSuccess();
    }
  };

  return (
    <>
      <Button primary variant="contained" loading={loading} onClick={() => setShowConfirmModal(true)}>
        {isRepopulate ? 'Repopulate Latest 10Q Info' : 'Populate Latest 10Q Info'}
      </Button>

      {showConfirmModal && (
        <ConfirmationModal
          open={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={async () => {
            await handlePopulateLatest10QInfo();
            setShowConfirmModal(false);
          }}
          title={isRepopulate ? 'Repopulate Latest 10Q Info' : 'Populate Latest 10Q Info'}
          confirmationText={
            isRepopulate
              ? 'Are you sure you want to repopulate the latest 10Q information? This will replace the existing data.'
              : 'Are you sure you want to populate the latest 10Q information?'
          }
          askForTextInput={true}
          confirming={loading}
        />
      )}
    </>
  );
}
