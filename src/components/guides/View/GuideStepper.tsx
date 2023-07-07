import GuideStartRatingModal from '@/components/app/Modal/Guide/GuideStartRatingModal';
import GuideSidebar from '@/components/guides/View/GuideSidebar';
import GuideStepperItem from '@/components/guides/View/GuideStepperItem';
import { useGuideRatings } from '@/components/guides/View/useGuideRatings';
import { UseViewGuideHelper } from '@/components/guides/View/useViewGuide';
import { GuideFragment, Space } from '@/graphql/generated/generated-types';
import React, { useEffect, useMemo } from 'react';
import GuideEndRatingModal from '@/components/app/Modal/Guide/GuideEndRatingModal';

interface GuideProps {
  viewGuideHelper: UseViewGuideHelper;
  guide: GuideFragment;
  space: Space;
}

const Guide: React.FC<GuideProps> = ({ viewGuideHelper, guide, space }) => {
  const { initialize, guideRatings, showRatingsModal, setStartRating,setFinalRating, skipInitialRating , skipFinalRating ,guideSuccess , showFeedBackModal } = useGuideRatings(space, guide);

  const activeStep = useMemo(
    () => guide.steps.find((step) => step.order === viewGuideHelper.activeStepOrder) || guide.steps[0],
    [guide.steps, viewGuideHelper.activeStepOrder]
  );
  console.log(activeStep , 'THis is a Active Step\n') ; 
  
  useEffect(() => {
    console.log('Initialize function \n') ; 
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
      { ( showRatingsModal && activeStep.order  === 0 ) && (
        <GuideStartRatingModal
          open={showRatingsModal}
          onClose={() => skipInitialRating()}
          skipStartRating={skipInitialRating}
          setStartRating={setStartRating}
        />
      )}
      { ( showRatingsModal && activeStep.order  === guide.steps.length  - 1 ) && (
        <GuideEndRatingModal
          open={showRatingsModal}
          onClose={() => skipFinalRating()}
          skipEndRating={skipFinalRating}
          setEndRating={setFinalRating}
          guideSuccess={guideSuccess}
          showFeedBackModal={showFeedBackModal}
        />
      )}
    </div>
  );
};

export default Guide;
