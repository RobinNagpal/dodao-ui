import GuideEndRatingModal from '@/components/app/Modal/Guide/GuideEndRatingModal';
import GuideStartRatingModal from '@/components/app/Modal/Guide/GuideStartRatingModal';
import GuideSidebar from '@/components/guides/View/GuideSidebar';
import GuideStepperItem from '@/components/guides/View/GuideStepperItem';
import { useGuideRatings } from '@/components/guides/View/useGuideRatings';
import { UseViewGuideHelper } from '@/components/guides/View/useViewGuide';
import { GuideFragment, Space } from '@/graphql/generated/generated-types';
import React, { useEffect, useMemo } from 'react';

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

  const {
    initialize,
    guideRatings,
    showStartRatingsModal,
    showEndRatingsModal,
    setStartRating,
    setEndRating,
    skipStartRating,
    skipEndRating,

    setGuideFeedback,
  } = useGuideRatings(space, guide, viewGuideHelper.guideSubmission);

  useEffect(() => {
    initialize();
  }, []);

  return (
    <div className="flex">
      <div className="hidden lg:flex grow flex-col gap-y-5 overflow-hidden px-6 p-4">
        <GuideSidebar guide={guide} viewGuideHelper={viewGuideHelper} activeStep={activeStep} />
      </div>
      <div className="w-full flex flex-row">
        <GuideStepperItem space={space} viewGuideHelper={viewGuideHelper} guide={guide} step={activeStep} />
      </div>
      <GuideStartRatingModal open={showStartRatingsModal} onClose={() => skipStartRating()} skipStartRating={skipStartRating} setStartRating={setStartRating} />
      <GuideEndRatingModal
        open={showEndRatingsModal}
        onClose={() => skipEndRating()}
        skipEndRating={skipEndRating}
        setEndRating={setEndRating}
        setFeedback={setGuideFeedback}
        guideSuccess={false}
        showFeedBackModal={false}
      />
    </div>
  );
};

export default Guide;
