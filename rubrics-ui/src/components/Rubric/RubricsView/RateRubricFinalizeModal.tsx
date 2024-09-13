'use client';
import React from 'react';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import { RubricWithEntities, RubricRatingWithEntities } from '@/types/rubricsTypes/types';
import { RubricCriteria } from '@prisma/client';
import Button from '@dodao/web-core/components/core/buttons/Button';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';

interface FinalizeModalProps {
  open: boolean;
  onClose: () => void;
  rubric: RubricWithEntities;
  rubricRating: RubricRatingWithEntities | undefined;
  setRubricRatingState?: React.Dispatch<React.SetStateAction<RubricRatingWithEntities | undefined>>;
}

const FinalizeModal: React.FC<FinalizeModalProps> = ({ open, onClose, rubric, rubricRating, setRubricRatingState }) => {
  const { showNotification } = useNotificationContext();

  async function finalizeRubricSelections() {
    const response = await fetch(`${getBaseUrl()}/api/rubrics/${rubric.id}/ratings/finalize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rubricId: rubric.id }),
    });

    const updatedRubricRating: RubricRatingWithEntities = await response.json();

    if (response.ok) {
      onClose();
      if (setRubricRatingState) {
        setRubricRatingState(updatedRubricRating);
      }
      showNotification({
        message: 'Selections have been finalized',
        type: 'success',
      });
    } else {
      console.error('Error occurred while finalizing selections');
    }
  }

  const isFinalizedButtonDisabled = !rubricRating || rubricRating.selections.length === 0;

  return (
    <SingleSectionModal title="Finalize Rubric Selections" open={open} onClose={onClose}>
      <div className="p-4">
        <table className="min-w-full border-collapse border">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Criteria</th>
              <th className="py-2 px-4 border-b">Selected Cells</th>
            </tr>
          </thead>
          <tbody>
            {rubric.criterias.map((criteria: RubricCriteria) => {
              const selectedCells = rubricRating?.selections?.filter((selection) =>
                rubric?.cells?.some((cell) => cell.id === selection?.rubricCellId && cell?.criteriaId === criteria?.id)
              );

              return (
                <tr key={criteria.id}>
                  <td className="py-2 px-4 border-b">{criteria.title}</td>
                  <td className="py-2 px-4 border-b">
                    {selectedCells?.map((selection) => {
                      const cell = rubric?.cells?.find((c) => c.id === selection?.rubricCellId);
                      return <div key={selection?.rubricCellId}>{cell?.description}</div>;
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Button variant="contained" primary className="mt-6" onClick={finalizeRubricSelections} disabled={isFinalizedButtonDisabled}>
          Finalize
        </Button>
      </div>
    </SingleSectionModal>
  );
};

export default FinalizeModal;
