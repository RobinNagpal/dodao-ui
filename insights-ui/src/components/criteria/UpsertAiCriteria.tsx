import ViewCriteriaModal from '@/components/criteria/ViewCriteriaModal';
import { CriteriaLookupItem } from '@/types/public-equity/criteria-types';
import { CreateAiCriteriaRequest } from '@/types/public-equity/ticker-request-response';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useState } from 'react';

interface UpsertAiCriteriaProps {
  item: CriteriaLookupItem;
  onPostUpsertAiCriteria: () => void;
}

export default function UpsertAiCriteria({ item, onPostUpsertAiCriteria }: UpsertAiCriteriaProps) {
  const [updating, setUpdating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showViewCriteriaModal, setShowViewCriteriaModal] = useState(false);

  const { data, loading, postData } = usePostData<{ message: string }, CreateAiCriteriaRequest>({
    errorMessage: 'Failed to create AI criteria',
  });
  const handleUpsertAICriteria = async () => {
    setUpdating(true);
    setShowConfirmModal(false);
    await postData(`/api/ai-criteria`, {
      industryGroupId: item.industryGroupId,
      sectorId: item.sectorId,
    });
    setUpdating(false);
    onPostUpsertAiCriteria();
  };

  return (
    <div className="flex gap-2">
      {!item.aiCriteriaFileUrl ? (
        <IconButton
          iconName={IconTypes.PlusIcon}
          tooltip="Create AI Criteria"
          onClick={() => setShowConfirmModal(true)}
          disabled={updating}
          loading={updating}
          variant="text"
          removeBorder={true}
          className="link-color pointer-cursor"
        />
      ) : (
        <>
          <span
            onClick={() => {
              setShowViewCriteriaModal(true);
            }}
            className="link-color cursor-pointer mt-2"
          >
            View AI Criteria
          </span>
          <IconButton
            iconName={IconTypes.Reload}
            tooltip="Re-generate AI Criteria"
            onClick={() => {
              setShowConfirmModal(true);
            }}
            removeBorder={true}
            loading={updating}
            disabled={updating}
            variant="text"
            className="link-color pointer-cursor"
          />
        </>
      )}
      {showViewCriteriaModal && (
        <ViewCriteriaModal
          open={showViewCriteriaModal}
          onClose={() => setShowViewCriteriaModal(false)}
          title={item.industryGroupName}
          url={item.aiCriteriaFileUrl!}
        />
      )}
      {showConfirmModal && (
        <ConfirmationModal
          open={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => handleUpsertAICriteria()}
          confirming={updating}
          title="Regenerate AI Criteria"
          confirmationText="Are you sure you want to re-generate the AI criteria for this industry group?"
          askForTextInput={true}
        />
      )}
    </div>
  );
}
