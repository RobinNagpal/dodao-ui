import ViewRubricCell from '@/components/RubricsView/ViewRubricCell';
import { RubricWithEntities } from '@/types/rubricsTypes/types';
import { Session } from '@dodao/web-core/types/auth/Session';
import { RatingCellSelection, RubricCriteria } from '@prisma/client';
import React from 'react';

export interface ViewRubricCriteriaProps {
  rubric: RubricWithEntities;
  criteria: RubricCriteria;
  session?: Session;
  rubricRatingsResponse?: RatingCellSelection[];
}

const ViewRubricCriteria: React.FC<ViewRubricCriteriaProps> = ({ session, rubric, criteria }) => {
  return (
    <tr>
      <td className="py-2 px-4 border-r border-b font-bold cursor-pointer max-w-xs break-words relative">
        <div className="overflow-y-auto max-h-24">{criteria.title}</div>
      </td>
      {rubric.cells
        .filter((cell) => cell.criteriaId === criteria.id)
        .map((cell, cellIndex) => (
          <ViewRubricCell cell={cell} key={cell.id} isRatingPresent={false} session={session} />
        ))}
    </tr>
  );
};

export default ViewRubricCriteria;
