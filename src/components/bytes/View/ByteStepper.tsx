import ByteStepperItemWithProgressBar from '@/components/bytes/View/ByteStepperItem/ByteStepperItemWithProgressBar';
import { UseGenericViewByteHelper } from '@/components/bytes/View/useGenericViewByte';
import { ByteDetailsFragment, ByteStepFragment, ProjectByteFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useMemo } from 'react';

type Props = {
  viewByteHelper: UseGenericViewByteHelper;
  byte: ByteDetailsFragment | ProjectByteFragment;
  space: SpaceWithIntegrationsFragment;
};

function ByteViewStepper({ viewByteHelper, byte, space }: Props) {
  const activeStep: ByteStepFragment = useMemo(() => {
    return byte.steps?.[viewByteHelper.activeStepOrder] || byte.steps[0];
  }, [viewByteHelper.activeStepOrder, byte.steps]);

  return <ByteStepperItemWithProgressBar viewByteHelper={viewByteHelper} byte={byte} step={activeStep} space={space} />;
}

export default ByteViewStepper;
