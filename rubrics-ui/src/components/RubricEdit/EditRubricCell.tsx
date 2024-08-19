import React from 'react';
import { RubricCellProps } from '@/types/rubricsTypes/types';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const RubricCell: React.FC<RubricCellProps> = ({ cell, criteria, cellIndex, isEditAccess, onEditClick, handleCommentModal, className, onClick, isClicked }) => {
  return (
    <td className={`py-2 px-4 border-r border-b cursor-pointer ${isClicked ? 'border-[var(--primary-color)] border-2' : ''}`} onClick={onClick}>
      <div
        onClick={() => {
          if (isEditAccess) {
            onEditClick('rubric', criteria, cellIndex, cell);
          }
        }}
        className="flex items-center overflow-y-auto max-h-26"
      >
        <span className="flex-grow">{cell}</span>
        {isClicked && (
          <CheckCircleIcon
            style={{
              width: '40px',
              height: '40px',
              color: 'var(--primary-color)',
            }}
            className="pl-2"
          />
        )}
      </div>
    </td>
  );
};

export default RubricCell;
