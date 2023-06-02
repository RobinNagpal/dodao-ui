import { StepResponse, TempSimulationSubmission } from '@/components/simulation/Edit/TempSimulationSubmission';
import { SimulationDetailsFragment, SimulationStepFragment, Space, useSimulationDetailsQuery } from '@/graphql/generated/generated-types';

import { useState } from 'react';

export const LAST_STEP_UUID = 'LAST_STEP_UUID';

export interface UseViewSimulationHelper {
  initialize: () => Promise<void>;
  activeStepOrder: number;
  getStepSubmission: (stepUuid: string) => StepResponse | undefined;
  goToNextStep: (currentStep: SimulationStepFragment) => void;
  goToPreviousStep: (currentStep: SimulationStepFragment) => void;
  simulationLoaded: boolean;
  simulationRef: SimulationDetailsFragment | undefined;
  simulationSubmission: TempSimulationSubmission;
  setActiveStep: (order: number) => void;
  submitSimulation: () => Promise<void>;
}

export function useViewSimulation(space: Space, simulationId: string, stepOrder: number): UseViewSimulationHelper {
  const [simulationRef, setSimulationRef] = useState<SimulationDetailsFragment>();
  const [simulationLoaded, setSimulationLoaded] = useState<boolean>(false);
  const [simulationSubmission, setSimulationSubmission] = useState<TempSimulationSubmission>({
    isPristine: true,
    isSubmitted: false,
    stepResponsesMap: {},
  });
  const [activeStepOrder, setActiveStepOrder] = useState<number>(0);
  const [simulationStepsMap, setSimulationStepsMap] = useState<{ [uuid: string]: SimulationStepFragment }>({});
  const { refetch } = useSimulationDetailsQuery({ variables: { spaceId: space.id, simulationId: simulationId }, skip: true });

  async function initialize() {
    setActiveStepOrder(stepOrder);
    const refetchResult = await refetch({ spaceId: space.id, simulationId: simulationId });
    const simulation = refetchResult.data.simulation;

    setSimulationRef({
      ...simulation,
      __typename: 'Simulation',
      steps: [
        ...simulation.steps,
        {
          __typename: 'SimulationStep',
          content: 'The simulation has been completed successfully!',
          name: 'Completed',
          order: simulation.steps.length,
          uuid: LAST_STEP_UUID,
          iframeUrl: null,
        },
      ],
    });

    if (simulationSubmission.isSubmitted) {
      setSimulationSubmission({
        isPristine: true,
        isSubmitted: false,
        stepResponsesMap: {},
      });
    }

    setSimulationStepsMap(Object.fromEntries<SimulationStepFragment>(simulation.steps.map((step) => [step.uuid, step])));

    setSimulationSubmission((prevSubmission) => ({
      ...prevSubmission,
      stepResponsesMap: Object.fromEntries(
        simulation.steps.map((step) => [step.uuid, getStepSubmission(step.uuid) || { itemResponsesMap: {}, isTouched: false, isCompleted: false }])
      ),
    }));

    setSimulationLoaded(true);
  }

  function setActiveStep(order: number) {
    setActiveStepOrder(order);
    history.replaceState(null, '', `/simulations/view/${simulationId}/${order}`);
  }

  function getStepSubmission(stepUuid: string): StepResponse | undefined {
    return simulationSubmission.stepResponsesMap[stepUuid];
  }

  function goToNextStep(currentStep: SimulationStepFragment) {
    const newStepOrder = currentStep.order + 1;
    setActiveStepOrder(newStepOrder);
    setSimulationSubmission((prevSubmission) => ({
      ...prevSubmission,
      stepResponsesMap: {
        ...prevSubmission.stepResponsesMap,
        [currentStep.uuid]: {
          ...prevSubmission.stepResponsesMap[currentStep.uuid],
          isCompleted: true,
          isTouched: true,
        },
      },
    }));
    history.replaceState(null, '', `/simulations/view/${simulationId}/${newStepOrder}`);
  }

  function goToPreviousStep(currentStep: SimulationStepFragment) {
    const newStepOrder = currentStep.order - 1;
    setActiveStepOrder(newStepOrder);
    history.replaceState(null, '', `/simulations/view/${simulationId}/${newStepOrder}`);
  }

  async function submitSimulation() {
    setSimulationSubmission((prevSubmission: any) => ({
      ...prevSubmission,
      isPristine: false,
    }));
  }

  return {
    initialize,
    activeStepOrder,
    getStepSubmission,
    goToNextStep,
    goToPreviousStep,
    simulationLoaded,
    simulationRef,
    simulationSubmission,
    setActiveStep,
    submitSimulation,
  };
}
