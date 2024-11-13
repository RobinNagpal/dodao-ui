import EditGuideSidebar from '@/components/guides/Edit/EditGuideSidebar';
import EditGuideStepperItem from '@/components/guides/Edit/EditGuideStepperItem';
import { EditGuideType } from '@/components/guides/Edit/editGuideType';
import { UseEditGuideHelper } from '@/components/guides/Edit/useEditGuide';
import { GuideStepFragment } from '@/graphql/generated/generated-types';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { UserDiscordConnectType } from '@dodao/web-core/types/deprecated/models/enums';
import { GuideError } from '@dodao/web-core/types/errors/error';
import React, { useMemo } from 'react';

interface EditGuideStepperProps {
  guide: EditGuideType;
  guideErrors?: GuideError;
  editGuideHelper: UseEditGuideHelper;
  space: SpaceWithIntegrationsDto;
}

export function EditGuideStepper(props: EditGuideStepperProps) {
  const { guide, guideErrors, editGuideHelper, space } = props;
  const guideHasDiscordEnabled = useMemo<boolean>(() => {
    for (let i = 0; i < guide.steps.length; i++) {
      for (let j = 0; j < guide.steps[i].stepItems.length; j++) {
        if (guide.steps[i].stepItems[j].type === UserDiscordConnectType) {
          return true;
        }
      }
    }
    return false;
  }, [guide]);

  const minOrder = Math.min(...guide.steps.map((step: GuideStepFragment) => step.stepOrder));
  const activeStepId = guide.steps.find((step: GuideStepFragment) => step.stepOrder === minOrder)?.uuid;
  const activeStep: GuideStepFragment = guide.steps.find((step) => step.uuid === activeStepId)!;
  return (
    <div className="flex">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto  px-6 p-4">
        <EditGuideSidebar guide={guide} errorsInSteps={guideErrors?.steps} editGuideHelper={editGuideHelper} activeStep={activeStep} />
      </div>
      <div className="w-full flex flex-row ">
        <EditGuideStepperItem
          guide={guide}
          stepErrors={guideErrors?.steps?.[activeStep.uuid]}
          editGuideHelper={editGuideHelper}
          guideHasDiscordEnabled={guideHasDiscordEnabled}
          step={activeStep}
          space={space}
        />
      </div>
    </div>
  );
}
