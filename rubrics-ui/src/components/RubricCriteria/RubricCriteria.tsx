import React from 'react';
import RubricCell from '@/components/RubricCell/RubricCell';
import { RubricCriteriaProps, Criterion } from '@/types/rubricsTypes/types';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';

const RubricCriteria: React.FC<RubricCriteriaProps> = ({ criteria, rubrics, isEditAccess, onEditClick, onDeleteCriteria, rubricCell }) => {
  return (
    <tr>
      <td className="py-2 px-4 border-r border-b font-bold cursor-pointer max-w-xs break-words relative">
        <div onClick={() => isEditAccess && onEditClick('criteria', criteria, -1)} className="overflow-y-auto max-h-24">
          {criteria}
        </div>
      </td>
      {rubrics![criteria].map((cell, cellIndex) => (
        <RubricCell key={cellIndex} cell={cell} criteria={criteria} cellIndex={cellIndex} isEditAccess={isEditAccess} onEditClick={onEditClick} />
      ))}
      <td>
        {isEditAccess && (
          <button onClick={() => onDeleteCriteria(criteria)}>
            <TrashIcon className="w-8 h-8 text-red-500 mx-auto" />
          </button>
        )}
      </td>
    </tr>
  );
};

export default RubricCriteria;
