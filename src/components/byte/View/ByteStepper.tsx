import { ByteDetailsFragment, ByteStepFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useMemo } from 'react';
import styled from 'styled-components';
import ByteStepperItem from './ByteStepperItem';
import { UseViewByteHelper } from './useViewByte';

type Props = {
  viewByteHelper: UseViewByteHelper;
  byte: ByteDetailsFragment;
  space: SpaceWithIntegrationsFragment;
  setAccountModalOpen: (shouldOpen: boolean) => void;
};

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
`;

function ByteViewStepper({ viewByteHelper, byte, space, setAccountModalOpen }: Props) {
  const activeStep: ByteStepFragment = useMemo(() => {
    return byte.steps.find((step) => step.order === viewByteHelper.activeStepOrder) || byte.steps[0];
  }, [viewByteHelper.activeStepOrder, byte.steps]);

  return (
    <Container>
      <ByteStepperItem viewByteHelper={viewByteHelper} byte={byte} step={activeStep} space={space} setAccountModalOpen={setAccountModalOpen} />
    </Container>
  );
}

export default ByteViewStepper;
