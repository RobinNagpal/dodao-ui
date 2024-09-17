'use client';
import Button from '@dodao/web-core/components/core/buttons/Button';
import ViewRubricCriteria from '@/components/Rubric/RubricsView/ViewRubricCriteria';
import ViewRubricLevel from '@/components/Rubric/RubricsView/ViewRubricLevel';
import { RubricWithEntities, RubricRatingWithEntities } from '@/types/rubricsTypes/types';
import { Session } from '@dodao/web-core/types/auth/Session';
import React, { useState } from 'react';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import FinalizeRubricEditModal from '@/components/Rubric/RubricsView/RateRubricFinalizeModal';
import { SpaceWithIntegrationsFragment } from '@/types/rubricsTypes/types';
import { RubricRatingStatus } from '@/types/rubricsTypes/types';
export interface RubricViewProps {
  rubric: RubricWithEntities;
  session?: Session;
  rubricRating?: RubricRatingWithEntities;
  space: SpaceWithIntegrationsFragment;
}

const RubricsView: React.FC<RubricViewProps> = ({ rubric, session, rubricRating, space }) => {
  const [rubricRatingState, setRubricRatingState] = useState<RubricRatingWithEntities | undefined>(rubricRating);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleSelectionsReset = async () => {
    if (!session?.userId || !rubric?.id) return;

    const response = await fetch(`${getBaseUrl()}/api/rubrics/${rubric?.id}/ratings`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: session.userId,
        rubricId: rubric.id,
      }),
    });

    if (response.ok) {
      const updatedRubricRating: RubricRatingWithEntities = await response.json();
      setRubricRatingState(updatedRubricRating);
    }
  };

  const ratedCriteriaIds =
    rubricRatingState?.selections.map((selection) => {
      const cell = rubric.cells.find((c) => c.id === selection.rubricCellId);
      return cell?.criteriaId;
    }) ?? [];

  const allCriteriaIds = rubric.criterias.map((criteria) => criteria.id);
  const isFinalizeDisabled = allCriteriaIds.some((criteriaId) => !ratedCriteriaIds.includes(criteriaId));
  const unratedCriteriaCount = allCriteriaIds.filter((criteriaId) => !ratedCriteriaIds.includes(criteriaId)).length;

  const isRatingFinalized = rubricRating?.status === RubricRatingStatus.Finalized;
  return (
    <div className="container mx-auto py-8 p-4">
      <div className="flex items-center pb-8 align-center justify-center">
        <h1 className="text-3xl text-center font-bold p-2">{rubric.name}</h1>
      </div>

      <h1 className="text-3xl text-center font-bold mb-4">View Mode</h1>

      <h1 className="text-2xl p-2 text-center mb-2">{rubric.programs?.[0]?.name || 'Not Associated With a Program'}</h1>

      <div className="overflow-x-auto mt-4">
        <Button variant="contained" primary className="float-left mt-2 mb-2" onClick={handleSelectionsReset} disabled={isRatingFinalized}>
          Reset
        </Button>
        <Button variant="contained" primary className="float-right mt-2 mb-2" onClick={() => setIsModalOpen(true)} disabled={isFinalizeDisabled}>
          Finalize
        </Button>

        {unratedCriteriaCount > 0 && (
          <p className="text-red-600 text-center mt-4">
            {unratedCriteriaCount} {unratedCriteriaCount === 1 ? 'criterion' : 'criterias'} remaining to be reviewed.
          </p>
        )}

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
              <ViewRubricCriteria
                key={criteria.id}
                rubric={rubric}
                criteria={criteria}
                session={session}
                rubricRating={rubricRatingState}
                setRubricRatingState={setRubricRatingState}
              />
            ))}
          </tbody>
        </table>
      </div>

      <FinalizeRubricEditModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rubric={rubric}
        rubricRating={rubricRatingState}
        setRubricRatingState={setRubricRatingState}
        space={space}
      />
    </div>
  );
};

export default RubricsView;
