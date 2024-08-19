'use client';

import CommentModal from '@/components/CommentModal/CommentModal';
import { RubricCellRatingRequest, RubricWithEntities } from '@/types/rubricsTypes/types';
import { Session } from '@dodao/web-core/types/auth/Session';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { RubricCell, RubricCriteria } from '@prisma/client';
import React, { useState } from 'react';

export interface ViewRubricCellProps {
  rubric: RubricWithEntities;
  criteria: RubricCriteria;
  cell: RubricCell;
  isRatingPresent: boolean | undefined;
  session?: Session;
}

const ViewRubricCell: React.FC<ViewRubricCellProps> = ({ rubric, criteria, cell, isRatingPresent }) => {
  const selectCellForRating = async (comment: string) => {
    const request: RubricCellRatingRequest = {
      rubricId: rubric.id,
      cellId: cell.id,
      comment,
    };

    const response = await fetch(`${getBaseUrl()}/api/rubrics/${rubric.id}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to send data');
    }

    const result = await response.json();
    console.log('Successfully sent data to the server:', request);
  };

  const [isCellSelected, setIsCellSelected] = useState(false);

  return (
    <td className={`py-2 px-4 border-r border-b cursor-pointer ${isRatingPresent ? 'border-[var(--primary-color)] border-2' : ''}`}>
      <div className="flex items-center overflow-y-auto max-h-26 cursor-pointer" onClick={() => setIsCellSelected(true)}>
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
        {isCellSelected && <CommentModal criteria={criteria} onClose={() => setIsCellSelected(false)} onSave={selectCellForRating} />}
      </div>
    </td>
  );
};

export default ViewRubricCell;
