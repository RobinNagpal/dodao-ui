import { UseGenericViewByteHelper } from '@/components/bytes/View/useGenericViewByte';
import { ByteDetailsFragment, ByteStepFragment, ProjectByteFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useMemo } from 'react';
import styles from './ByteStepper.module.scss';
import ByteStyleWithCarouselAndProgress1 from './NewByteStyles/style1/ByteStyleWIthCarouselAndProgress1';

type Props = {
  viewByteHelper: UseGenericViewByteHelper;
  byte: ByteDetailsFragment | ProjectByteFragment;
  space: SpaceWithIntegrationsFragment;
};

function ByteViewStepper({ viewByteHelper, byte, space }: Props) {
  const activeStep: ByteStepFragment = useMemo(() => {
    return byte.steps?.[viewByteHelper.activeStepOrder] || byte.steps[0];
  }, [viewByteHelper.activeStepOrder, byte.steps]);

  return (
    <div className={styles.container}>
      <ByteStyleWithCarouselAndProgress1 viewByteHelper={viewByteHelper} byte={byte} step={activeStep} space={space} />
    </div>
  );
}

export default ByteViewStepper;
