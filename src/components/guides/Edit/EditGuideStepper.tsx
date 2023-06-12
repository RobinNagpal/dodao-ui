import EditGuideSidebar from '@/components/guides/Edit/EditGuideSidebar';
import EditGuideStepperItem from '@/components/guides/Edit/EditGuideStepperItem';
import { UseEditGuideHelper } from '@/components/guides/Edit/useEditGuide';
import { GuideFragment, GuideStepFragment, Space } from '@/graphql/generated/generated-types';
import { UserDiscordConnectType } from '@/types/deprecated/models/enums';
import { GuideError } from '@/types/errors/error';
import React, { useMemo } from 'react';

interface EditGuideStepperProps {
  guide: GuideFragment;
  guideErrors?: GuideError;
  editGuideHelper: UseEditGuideHelper;
  space: Space;
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

  const activeStepI = editGuideHelper.activeStepId;
  const activeStep: GuideStepFragment = guide.steps.find((step) => step.uuid === activeStepI)!;
  return (
    <div className="flex">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto  px-6 p-4">
        <EditGuideSidebar guide={guide} stepErrors={guideErrors?.steps?.[activeStep.uuid]} editGuideHelper={editGuideHelper} activeStep={activeStep} />
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
