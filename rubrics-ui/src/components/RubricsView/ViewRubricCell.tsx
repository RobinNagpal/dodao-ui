'use client';

import { Session } from '@dodao/web-core/types/auth/Session';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { RubricCell } from '@prisma/client';
import React from 'react';

export interface ViewRubricCellProps {
  cell: RubricCell;
  isRatingPresent: boolean;
  session?: Session;
}

const ViewRubricCell: React.FC<ViewRubricCellProps> = ({ cell, isRatingPresent }) => {
  return (
    <td className={`py-2 px-4 border-r border-b cursor-pointer ${isRatingPresent ? 'border-[var(--primary-color)] border-2' : ''}`}>
      <div className="flex items-center overflow-y-auto max-h-26">
        <span className="flex-grow">{cell.description}</span>
        {isRatingPresent && (
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

export default ViewRubricCell;
