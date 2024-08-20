'use client';
import EditRubricsDetails from '@/components/RubricEdit/EditRubricsDetails';
import RubricBasicInfoForm from '@/components/RubricEdit/RubricBasicInfoForm';
import { RubricWithEntities, SpaceWithIntegrationsFragment } from '@/types/rubricsTypes/types';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullPageModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Program } from '@prisma/client';
import React, { useState } from 'react';

interface EditRubricProps {
  rubric: RubricWithEntities;
  space: SpaceWithIntegrationsFragment;
  programs: Program[];
}

const EditRubric: React.FC<EditRubricProps> = ({ rubric, programs, space }) => {
  const [updatedRubric, setUpdatedRubric] = useState<RubricWithEntities>(rubric);

  const [showRubricBasicInfoForm, setShowRubricBasicInfoForm] = useState(false);

  const onRubricUpdated = async () => {
    const response = await fetch(`${getBaseUrl()}/api/rubrics/${rubric.id}?spaceId=${space.id}`);
    const rubricResponse = (await response.json()) as RubricWithEntities;
    setUpdatedRubric(rubricResponse);
  };

  return (
    <div>
      <div className="mt-10 p-2 flex-col items-center justify-center gap-x-6">
        <div className="w-full">
          <Button variant="contained" primary onClick={() => setShowRubricBasicInfoForm(true)} className="float-right mt-2">
            Edit Basic Info
          </Button>
        </div>
        {showRubricBasicInfoForm && (
          <FullPageModal
            open={showRubricBasicInfoForm}
            onClose={() => setShowRubricBasicInfoForm(false)}
            title="Edit Rubric Basic Info"
            showCloseButton={false}
          >
            <RubricBasicInfoForm rubric={rubric} programs={programs} space={space} onCreateOrUpdate={() => setShowRubricBasicInfoForm(false)} />
          </FullPageModal>
        )}

        <EditRubricsDetails rubric={updatedRubric} space={space} onRubricUpdated={onRubricUpdated} />
      </div>
    </div>
  );
};

export default EditRubric;
