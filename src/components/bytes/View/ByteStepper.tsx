import ByteRatingModal from '@/components/app/Modal/Byte/ByteRatingModal';
import ByteStepperItemWithProgressBar from '@/components/bytes/View/ByteStepperItem/ByteStepperItemWithProgressBar';
import { UseGenericViewByteHelper } from '@/components/bytes/View/useGenericViewByte';
import { ByteDetailsFragment, ByteStepFragment, ProjectByteFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useMemo, useState } from 'react';
import { useByteRatings } from '@/components/bytes/Rating/useByteRating';

type Props = {
  viewByteHelper: UseGenericViewByteHelper;
  byte: ByteDetailsFragment | ProjectByteFragment;
  space: SpaceWithIntegrationsFragment;
};

function ByteViewStepper({ viewByteHelper, byte, space }: Props) {
  const activeStep: ByteStepFragment = useMemo(() => {
    return byte.steps?.[viewByteHelper.activeStepOrder] || byte.steps[0];
  }, [viewByteHelper.activeStepOrder, byte.steps]);

  const [byteSubmitted, setByteSubmitted] = useState<boolean>(false);

  const { showRatingsModal, setShowRatingsModal, setByteRating, skipByteRating } = useByteRatings(space, byte as ByteDetailsFragment, byteSubmitted);

  return (
    <div>
      <ByteStepperItemWithProgressBar viewByteHelper={viewByteHelper} byte={byte} step={activeStep} space={space} setByteSubmitted={setByteSubmitted} />
      <ByteRatingModal open={showRatingsModal} onClose={() => setShowRatingsModal(false)} skipByteRating={skipByteRating} setByteRating={setByteRating} />
    </div>
  );
}

export default ByteViewStepper;
