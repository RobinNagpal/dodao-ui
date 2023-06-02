// SimulationViewStepper.tsx
import SimulationStepperItem from '@/components/simulation/View/SimulationStepperItem';
import { UseViewSimulationHelper } from '@/components/simulation/View/useViewSimulation';
import { SimulationDetailsFragment, SimulationStepFragment } from '@/graphql/generated/generated-types';
import React, { useMemo } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
`;

interface SimulationViewStepperProps {
  viewSimulationHelper: UseViewSimulationHelper;
  simulation: SimulationDetailsFragment;
}

function SimulationViewStepper({ viewSimulationHelper, simulation }: SimulationViewStepperProps) {
  const activeStep: SimulationStepFragment | undefined = useMemo(
    () => simulation.steps.find((step) => step.order === viewSimulationHelper.activeStepOrder) || simulation.steps[0],
    [simulation.steps, viewSimulationHelper.activeStepOrder]
  );

  return (
    <Container>
      {activeStep && (
        <SimulationStepperItem
          viewSimulationHelper={viewSimulationHelper}
          simulation={simulation}
          step={activeStep}
          submitSimulation={viewSimulationHelper.submitSimulation}
        />
      )}
    </Container>
  );
}

export default SimulationViewStepper;
