import ViewRubricCell from '@/components/Rubric/RubricsView/ViewRubricCell';
import { RubricWithEntities, RubricRatingWithEntities } from '@/types/rubricsTypes/types';
import { Session } from '@dodao/web-core/types/auth/Session';
import { RatingCellSelection, RubricCriteria } from '@prisma/client';
import React from 'react';

export interface ViewRubricCriteriaProps {
  rubric: RubricWithEntities;
  criteria: RubricCriteria;
  session?: Session;
  rubricRatingsResponse?: RatingCellSelection[];
  rubricRating?: RubricRatingWithEntities;
  setRubricRatingState?: React.Dispatch<React.SetStateAction<RubricRatingWithEntities | undefined>>;
}

const ViewRubricCriteria: React.FC<ViewRubricCriteriaProps> = ({ session, rubric, criteria, rubricRating, setRubricRatingState }) => {
  return (
    <tr>
      <td className="py-2 px-4 border-r border-b font-bold cursor-pointer max-w-xs break-words relative">
        <div className="overflow-y-auto max-h-24">{criteria.title}</div>
      </td>
      {rubric.cells
        .filter((cell) => cell.criteriaId === criteria.id)
        .map((cell) => {
          const isRatingPresent = rubricRating?.selections.some((selection) => selection.rubricCellId === cell.id);
          return (
            <ViewRubricCell
              cell={cell}
              key={cell.id}
              isRatingPresent={isRatingPresent}
              session={session}
              criteria={criteria}
              rubric={rubric}
              setRubricRatingState={setRubricRatingState}
            />
          );
        })}
    </tr>
  );
};

export default ViewRubricCriteria;
