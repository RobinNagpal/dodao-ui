import { RubricWithEntities } from '@/types/rubricsTypes/types';
import { RubricCell, RubricCriteria } from '@prisma/client';
import React from 'react';

export interface EditRubricCellProps {
  rubric: RubricWithEntities;
  cell: RubricCell;
  criteria: RubricCriteria;
  cellIndex: number;
  onUpdated: (cell: RubricCell) => void;
}

const EditRubricCell: React.FC<EditRubricCellProps> = ({ cell, criteria, cellIndex }) => {
  // Updating the cell description should happen from here.
  // Add the logic to show the modal, when user clicks on the cell. Use SingleSectionModal for the modal - see rating logic
  // Call the server from here to update the cell description

  return (
    <td className={`py-2 px-4 border-r border-b cursor-pointer`} onClick={() => {}}>
      <div onClick={() => {}} className="flex items-center overflow-y-auto max-h-26">
        <span className="flex-grow">{cell.description}</span>
      </div>
    </td>
  );
};

export default EditRubricCell;
