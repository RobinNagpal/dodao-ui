import { ByteDetailsFragment, ByteStepFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useMemo } from 'react';
import ByteStepperItem from './ByteStepperItem';
import { UseViewByteHelper } from './useViewByte';
import styles from './ByteStepper.module.scss';

type Props = {
  viewByteHelper: UseViewByteHelper;
  byte: ByteDetailsFragment;
  space: SpaceWithIntegrationsFragment;
};

function ByteViewStepper({ viewByteHelper, byte, space }: Props) {
  const activeStep: ByteStepFragment = useMemo(() => {
    return byte.steps?.[viewByteHelper.activeStepOrder] || byte.steps[0];
  }, [viewByteHelper.activeStepOrder, byte.steps]);

  return (
    <div className={styles.container}>
      <ByteStepperItem viewByteHelper={viewByteHelper} byte={byte} step={activeStep} space={space} />
    </div>
  );
}

export default ByteViewStepper;
