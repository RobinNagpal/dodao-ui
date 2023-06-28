import GuideSidebar from '@/components/guides/View/GuideSidebar';
import GuideStepperItem from '@/components/guides/View/GuideStepperItem';
import { UseViewGuideHelper } from '@/components/guides/View/useViewGuide';
import { GuideFragment, Space } from '@/graphql/generated/generated-types';
import React, { useMemo } from 'react';
import styled from 'styled-components';

interface GuideProps {
  viewGuideHelper: UseViewGuideHelper;
  guide: GuideFragment;
  space: Space;
}

const Guide: React.FC<GuideProps> = ({ viewGuideHelper, guide, space }) => {
  const activeStep = useMemo(
    () => guide.steps.find((step) => step.order === viewGuideHelper.activeStepOrder) || guide.steps[0],
    [guide.steps, viewGuideHelper.activeStepOrder]
  );

  return (
    <div className="flex">
      <div className=" hidden lg:flex grow flex-col gap-y-5 overflow-hidden  px-6 p-4">
        <GuideSidebar guide={guide} viewGuideHelper={viewGuideHelper} activeStep={activeStep} />
      </div>
      <div className="w-full flex flex-row">
        <GuideStepperItem space={space} viewGuideHelper={viewGuideHelper} guide={guide} step={activeStep} />
      </div>
    </div>
  );
};

export default Guide;
