'use client';

import EditRubricCriteria from '@/components/RubricEdit/EditRubricCriteria';
import EditRubricLevel from '@/components/RubricEdit/EditRubricLevel';
import { RubricWithEntities, SpaceWithIntegrationsFragment } from '@/types/rubricsTypes/types';
import React from 'react';

const EditRubricsDetails: React.FC<{
  rubric: RubricWithEntities;
  space: SpaceWithIntegrationsFragment;
  onRubricUpdated: () => void;
}> = ({ rubric, space, onRubricUpdated }) => {
  const handleAddCriteria = () => {
    // Add logic to add criteria
  };

  return (
    <div className="container mx-auto py-8 p-4">
      <div className="flex items-center pb-8 align-center justify-center">
        <h1 className="text-3xl text-center font-bold p-2">{rubric.name}</h1>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="min-w-full bg-white border-collapse border">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b"></th>
              {rubric.levels.map((level, index) => (
                <EditRubricLevel key={index} level={level} levelIndex={index} onLevelChanged={onRubricUpdated} rubric={rubric} />
              ))}
            </tr>
          </thead>
          <tbody>
            {rubric.criterias.map((criteria, criteriaIndex) => (
              <EditRubricCriteria rubric={rubric} criteria={criteria} onCriteriaEdited={onRubricUpdated} key={criteria.id} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center">
        <button className="bg-blue-500 mt-2 text-white py-2 px-4 rounded-full flex items-center justify-center" onClick={handleAddCriteria}>
          +
        </button>
      </div>
    </div>
  );
};

export default EditRubricsDetails;
