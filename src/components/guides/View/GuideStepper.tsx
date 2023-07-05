import GuideSuccessModal from '@/components/app/Modal/Guide/GuideSuccess';
import GuideSidebar from '@/components/guides/View/GuideSidebar';
import GuideStepperItem from '@/components/guides/View/GuideStepperItem';
import { useGuideRatings } from '@/components/guides/View/useGuideRatings';
import { UseViewGuideHelper } from '@/components/guides/View/useViewGuide';
import { GuideFragment, Space } from '@/graphql/generated/generated-types';
import { UserIdKey } from '@/types/auth/User';
import React, { useEffect, useMemo } from 'react';

interface GuideProps {
  viewGuideHelper: UseViewGuideHelper;
  guide: GuideFragment;
  space: Space;
}

const Guide: React.FC<GuideProps> = ({ viewGuideHelper, guide, space }) => {
  const { initialize, guideRatings, showRatingsModal } = useGuideRatings(space, guide);

  const activeStep = useMemo(
    () => guide.steps.find((step) => step.order === viewGuideHelper.activeStepOrder) || guide.steps[0],
    [guide.steps, viewGuideHelper.activeStepOrder]
  );

  useEffect(() => {
    initialize();
  }, []);

  return (
    <div className="flex">
      <div className=" hidden lg:flex grow flex-col gap-y-5 overflow-hidden  px-6 p-4">
        <GuideSidebar guide={guide} viewGuideHelper={viewGuideHelper} activeStep={activeStep} />
      </div>
      <div className="w-full flex flex-row">
        <GuideStepperItem space={space} viewGuideHelper={viewGuideHelper} guide={guide} step={activeStep} />
      </div>
      {showRatingsModal && <GuideSuccessModal page={0} userKey={localStorage.getItem(UserIdKey)!} guideName={guide.name} />}
    </div>
  );
};

export default Guide;
