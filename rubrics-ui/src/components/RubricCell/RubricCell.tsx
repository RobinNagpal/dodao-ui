import React from 'react';
import { RubricCellProps } from '@/types/rubricsTypes/types';

const RubricCell: React.FC<RubricCellProps> = ({ cell, criteria, cellIndex, isEditAccess, onEditClick }) => {
  return (
    <td className="py-2 px-4 border-r border-b cursor-pointer max-w-xs break-words" onClick={() => isEditAccess && onEditClick('rubric', criteria, cellIndex)}>
      <div className="overflow-y-auto max-h-24">{cell}</div>
    </td>
  );
};

export default RubricCell;
