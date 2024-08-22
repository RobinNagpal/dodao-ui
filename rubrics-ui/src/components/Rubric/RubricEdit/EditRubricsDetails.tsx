'use client';

import EditRubricCriteria from '@/components/Rubric/RubricEdit/EditRubricCriteria';
import EditRubricLevel from '@/components/Rubric/RubricEdit/EditRubricLevel';
import { RubricWithEntities, SpaceWithIntegrationsFragment } from '@/types/rubricsTypes/types';
import SidebarButton from '@dodao/web-core/components/core/buttons/SidebarButton';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import PlusCircle from '@heroicons/react/20/solid/PlusCircleIcon';
import React from 'react';

const EditRubricsDetails: React.FC<{
  rubric: RubricWithEntities;
  space: SpaceWithIntegrationsFragment;
  onRubricUpdated: () => void;
}> = ({ rubric, space, onRubricUpdated }) => {
  const handleAddCriteriaWithCells = async () => {
    const newCriteriaTitle = `New Criteria ${rubric.criterias.length + 1}`;
    const newCells = rubric.levels.map((level, index) => {
      let description;

      switch (index) {
        case 0:
          description = `Outstanding performance `;
          break;
        case 1:
          description = `Good performance.`;
          break;
        case 2:
          description = `Adequate performance.`;
          break;
        case 3:
          description = `Needs improvement.`;
          break;
        default:
          description = `Description for ${newCriteriaTitle}.`;
          break;
      }

      return {
        description,
        ratingHeaderId: level.id,
      };
    });

    const response = await fetch(`${getBaseUrl()}/api/rubrics/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rubricId: rubric.id,
        title: newCriteriaTitle,
        cells: newCells,
      }),
    });

    if (response.ok) {
      onRubricUpdated();
    } else {
      console.log('Failed to add new criteria');
    }
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
        <SidebarButton onClick={handleAddCriteriaWithCells} className="m-auto" primary>
          <PlusCircle height={40} width={40} />
        </SidebarButton>
      </div>
    </div>
  );
};

export default EditRubricsDetails;
