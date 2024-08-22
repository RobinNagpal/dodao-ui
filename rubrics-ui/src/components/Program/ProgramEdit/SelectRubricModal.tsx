import Button from '@dodao/web-core/components/core/buttons/Button';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import React from 'react';

export interface RubricSummary {
  id: string;
  name: string;
  summary: string;
}

interface SelectRubricModalProps {
  open: boolean;
  onClose: () => void;
  rubrics: RubricSummary[];
  selectedRubricIds: string[];
  handleRubricSelect: (rubricId: string) => void;
}

export default function SelectRubricModal({ open, onClose, rubrics, selectedRubricIds, handleRubricSelect }: SelectRubricModalProps) {
  return (
    <FullPageModal open={open} onClose={onClose} title="Select Rubrics">
      <div className="p-4 flex flex-wrap gap-4">
        {rubrics.map((rubric) => (
          <div
            key={rubric.id}
            className={`border border-gray-300 rounded-lg p-4 cursor-pointer ${selectedRubricIds.includes(rubric.id) ? 'border-blue-500' : ''}`}
            onClick={() => handleRubricSelect(rubric.id)}
          >
            <h2 className="text-lg font-bold truncate">{rubric.name}</h2>
            <p className="text-sm text-gray-600 truncate">{rubric.summary}</p>
          </div>
        ))}
      </div>
      <Button variant="contained" primary onClick={onClose}>
        Done
      </Button>
    </FullPageModal>
  );
}
