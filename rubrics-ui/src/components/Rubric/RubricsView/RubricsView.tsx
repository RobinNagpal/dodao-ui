import ViewRubricCriteria from '@/components/Rubric/RubricsView/ViewRubricCriteria';
import ViewRubricLevel from '@/components/Rubric/RubricsView/ViewRubricLevel';
import { RubricWithEntities, RubricRatingWithEntities } from '@/types/rubricsTypes/types';
import { Session } from '@dodao/web-core/types/auth/Session';
import React from 'react';

export interface RubricViewProps {
  rubric: RubricWithEntities;
  session?: Session;
  rubricRating?: RubricRatingWithEntities;
}

const RubricsView: React.FC<RubricViewProps> = ({ rubric, session, rubricRating }) => {
  return (
    <div className="container mx-auto py-8 p-4">
      <div className="flex items-center pb-8 align-center justify-center">
        <h1 className="text-3xl text-center font-bold p-2">{rubric.name}</h1>
      </div>
      <h1 className="text-3xl text-center font-bold mb-4">View Mode</h1>
      <h1 className="text-2xl p-2 text-center mb-2">{rubric.programs?.[0]?.name || 'Not Associated With a Program'}</h1>

      <div className="overflow-x-auto mt-4">
        <table className="min-w-full bg-white border-collapse border">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b"></th>
              {rubric.levels?.map((level, index) => (
                <ViewRubricLevel key={index} index={index} rubricLevel={level} />
              ))}
            </tr>
          </thead>
          <tbody>
            {rubric.criterias.map((criteria) => (
              <ViewRubricCriteria key={criteria.id} rubric={rubric} criteria={criteria} session={session} rubricRating={rubricRating} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RubricsView;
