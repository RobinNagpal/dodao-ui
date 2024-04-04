import GuideSidebar from '@/components/guides/View/GuideSidebar';
import GuideStepperItem from '@/components/guides/View/GuideStepperItem';

import { useGuideRatings } from '@/components/guides/View/useGuideRatings';
import { UseViewGuideHelper } from '@/components/guides/View/useViewGuide';
import { GuideFeedback, GuideFragment, Space } from '@/graphql/generated/generated-types';
import React, { useMemo } from 'react';
import styles from './GuideStepper.module.scss';
import RatingModal, { FeedbackOptions } from '@/components/app/Modal/Rating/RatingModal';
import { ClipboardDocumentListIcon, QuestionMarkCircleIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

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

  const { showEndRatingsModal, setShowEndRatingsModal, setGuideRating, skipGuideRating } = useGuideRatings(space, guide, viewGuideHelper.guideSubmission);

  const feedbackOptions: FeedbackOptions[] = [
    { name: 'content', label: 'Content', image: ClipboardDocumentListIcon },
    { name: 'questions', label: 'Questions', image: QuestionMarkCircleIcon },
    { name: 'ux', label: 'User Experience', image: RocketLaunchIcon },
  ];

  return (
    <div className="flex">
      <div className={`hidden lg:flex grow flex-col gap-y-5 overflow-hidden px-6 p-4 ${styles.navWrapperDiv}`}>
        <GuideSidebar guide={guide} viewGuideHelper={viewGuideHelper} activeStep={activeStep} />
      </div>
      <div className="w-full flex flex-row overflow-scroll">
        <GuideStepperItem space={space} viewGuideHelper={viewGuideHelper} guide={guide} step={activeStep} />
      </div>

      <RatingModal
        ratingType="Guide"
        open={showEndRatingsModal}
        onClose={() => setShowEndRatingsModal(false)}
        skipRating={skipGuideRating}
        setRating={setGuideRating as (rating: number, feedback?: GuideFeedback) => Promise<void>}
        feedbackOptions={feedbackOptions}
      />
    </div>
  );
};

export default Guide;
