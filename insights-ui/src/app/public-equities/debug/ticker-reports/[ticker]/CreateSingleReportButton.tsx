import { Criterion } from '@/types/criteria/criteria';
import { CreateSingleReportsRequest } from '@/types/public-equity/ticker-report';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useState } from 'react';

export interface CreateSingleReportButtonProps {
  ticker: string;
  criterion: Criterion;
}
export function CreateSingleReportButton({ ticker, criterion }: CreateSingleReportButtonProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const {
    data: reponse,
    postData,
    loading,
    error,
  } = usePostData<{ message: string }, CreateSingleReportsRequest>({
    errorMessage: 'Failed to create ticker report',
    successMessage: 'Ticker report created successfully',
    redirectPath: `/public-equities/debug/ticker-reports/${ticker}`,
  });
  const baseURL = process.env.NEXT_PUBLIC_AGENT_APP_URL?.toString() || '';

  const handleCreateSingleCriterionReport = async (criterionKey: string) => {
    postData(`${baseURL}/api/public-equities/US/create-single-report`, {
      sectorId: 60,
      industryGroupId: 6010,
      ticker,
      criterionKey,
    });
  };

  return (
    <>
      <IconButton
        iconName={IconTypes.Reload}
        tooltip="Create Ticker Report"
        onClick={() => setShowConfirmModal(true)}
        disabled={loading}
        loading={loading}
        variant="text"
        removeBorder={true}
        className="link-color pointer-cursor"
      />
      {showConfirmModal && (
        <ConfirmationModal
          open={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => {
            setShowConfirmModal(false);
            handleCreateSingleCriterionReport(criterion.key);
          }}
          confirming={loading}
          title={`Create Report for ${criterion.name} - ${ticker}`}
          confirmationText="Are you sure you want to create this report?"
          askForTextInput={true}
        />
      )}
    </>
  );
}
