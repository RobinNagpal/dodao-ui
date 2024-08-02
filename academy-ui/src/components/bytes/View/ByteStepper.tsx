import ByteStepperItemWithProgressBar from '@/components/bytes/View/ByteStepperItem/ByteStepperItemWithProgressBar';
import { UseGenericViewByteHelper } from '@/components/bytes/View/useGenericViewByte';
import { ByteDetailsFragment, ByteFeedback, ByteStepFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useMemo, useState } from 'react';
import { useByteRatings } from '@/components/bytes/Rating/useByteRating';
import RatingModal, { FeedbackOptions } from '@/components/app/Modal/Rating/RatingModal';
import { ClipboardDocumentListIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

type Props = {
  viewByteHelper: UseGenericViewByteHelper;
  byte: ByteDetailsFragment;
  space: SpaceWithIntegrationsFragment;
};

function ByteViewStepper({ viewByteHelper, byte, space }: Props) {
  const activeStep: ByteStepFragment = useMemo(() => {
    return byte.steps?.[viewByteHelper.activeStepOrder] || byte.steps[0];
  }, [viewByteHelper.activeStepOrder, byte.steps]);

  const [byteSubmitted, setByteSubmitted] = useState<boolean>(false);

  const { showRatingsModal, setShowRatingsModal, setByteRating, skipByteRating } = useByteRatings(space, byte as ByteDetailsFragment, byteSubmitted);
  const feedbackOptions: FeedbackOptions[] = [
    { name: 'content', label: 'Content', image: ClipboardDocumentListIcon },
    { name: 'ux', label: 'User Experience', image: RocketLaunchIcon },
  ];

  return (
    <div>
      <ByteStepperItemWithProgressBar viewByteHelper={viewByteHelper} byte={byte} step={activeStep} space={space} setByteSubmitted={setByteSubmitted} />
      <RatingModal
        ratingType="Byte"
        open={showRatingsModal && (space.byteSettings.captureRating as boolean)}
        onClose={() => setShowRatingsModal(false)}
        skipRating={skipByteRating}
        setRating={setByteRating as (rating: number, feedback?: ByteFeedback) => Promise<void>}
        feedbackOptions={feedbackOptions}
      />
    </div>
  );
}

export default ByteViewStepper;
