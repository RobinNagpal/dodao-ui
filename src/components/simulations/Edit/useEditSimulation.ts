import { emptySimulation } from '@/components/simulations/Edit/EmptySimulation';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { SimulationStepInput, Space, UpsertSimulationInput, useSimulationDetailsQuery, useUpsertSimulationMutation } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { StepError } from '@/types/errors/error';
import { SimulationErrors } from '@/types/errors/simulationErrors';
import orderBy from 'lodash/orderBy';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const simulationExceptContentLimit = 64;
const nameLimit = 32;

export type EditSimulationType = UpsertSimulationInput & {
  isPristine: boolean;
  simulationExists: boolean;
};

type KeyOfSimulationInput = keyof EditSimulationType;

export type UpdateSimulationFunctions = {
  initialize: () => Promise<void>;
  moveStepDown: (stepUuid: string) => void;
  addStep: () => void;
  updateSimulationErrorField: (field: KeyOfSimulationInput, value: any) => void;
  updateSimulationField: (field: KeyOfSimulationInput, value: any) => void;
  updateStep: (step: SimulationStepInput) => void;
  removeStep: (stepUuid: string) => void;
  moveStepUp: (stepUuid: string) => void;
};

export function useEditSimulation(space: Space, simulationId: string | null) {
  const router = useRouter();
  const emptySimulationModel = emptySimulation();
  const { showNotification } = useNotificationContext();
  const { $t } = useI18();

  const [simulation, setSimulation] = useState<EditSimulationType>({
    ...emptySimulationModel,
    simulationExists: false,
  });
  const [simulationErrors, setSimulationErrors] = useState<SimulationErrors>({});
  const [simulationLoaded, setSimulationLoaded] = useState<boolean>(false);
  const [simulationCreating, setSimulationCreating] = useState<boolean>(false);
  const { refetch: querySimulationDetails } = useSimulationDetailsQuery({ skip: true });
  const [upsertSimulationMutation] = useUpsertSimulationMutation();

  async function initialize() {
    if (simulationId) {
      const result = await querySimulationDetails({ simulationId: simulationId, spaceId: space.id });
      const fetchedSimulation = result.data.simulation;
      setSimulation({
        ...fetchedSimulation,
        simulationExists: true,
        isPristine: true,
      });
      setSimulationLoaded(true);
    } else {
      setSimulationLoaded(true);
    }
  }
  function updateStep(step: SimulationStepInput) {
    setSimulation((prevSimulation) => ({
      ...prevSimulation,
      steps: prevSimulation.steps.map((s) => {
        if (s.uuid === step.uuid) {
          return step;
        } else {
          return s;
        }
      }),
    }));
  }

  function moveStepUp(stepUuid: string) {
    setSimulation((prevSimulation) => {
      const stepIndex = prevSimulation.steps.findIndex((s) => s.uuid === stepUuid);
      const updatedSteps = [...prevSimulation.steps];
      updatedSteps[stepIndex - 1].order = stepIndex;
      updatedSteps[stepIndex].order = stepIndex - 1;

      return {
        ...prevSimulation,
        steps: orderBy(updatedSteps, 'order'),
      };
    });
  }

  function moveStepDown(stepUuid: string) {
    setSimulation((prevSimulation) => {
      const stepIndex = prevSimulation.steps.findIndex((s) => s.uuid === stepUuid);
      const updatedSteps = [...prevSimulation.steps];
      updatedSteps[stepIndex + 1].order = stepIndex;
      updatedSteps[stepIndex].order = stepIndex + 1;

      return {
        ...prevSimulation,
        steps: orderBy(updatedSteps, 'order'),
      };
    });
  }

  function removeStep(stepUuid: string) {
    setSimulation((prevSimulation) => {
      const updatedSteps = prevSimulation.steps.filter((s) => s.uuid !== stepUuid);
      return {
        ...prevSimulation,
        steps: updatedSteps.map((step, index) => ({
          ...step,
          order: index,
        })),
      };
    });
  }

  function addStep() {
    const uuid = uuidv4();
    setSimulation((prevSimulation) => ({
      ...prevSimulation,
      steps: [
        ...prevSimulation.steps,
        {
          uuid: uuid,
          name: `Step ${prevSimulation.steps.length + 1}`,
          order: prevSimulation.steps.length,
          content: '',
        },
      ],
    }));
  }

  function validateSimulation(simulation: EditSimulationType) {
    const newSimulationErrors: SimulationErrors = { ...simulationErrors };

    newSimulationErrors.name = !simulation.name || simulation.name.length > nameLimit;
    newSimulationErrors.content = !simulation.content || simulation.content?.length > simulationExceptContentLimit;

    newSimulationErrors.steps = simulation.steps.reduce((acc: any, step: SimulationStepInput) => {
      const stepError: StepError = {};
      if (!step.name || step.name.length > nameLimit) {
        stepError.name = true;
      }
      if (!step.iframeUrl?.trim() && !step.content?.trim()?.length) {
        stepError.content = true;
      }

      if (Object.keys(stepError).length > 0) {
        acc[step.order] = stepError;
      }
      return acc;
    }, {});

    setSimulationErrors(newSimulationErrors);

    const isValid = newSimulationErrors.name || newSimulationErrors.content || Object.values(newSimulationErrors?.steps || {}).filter((v) => !!v).length === 0;

    console.log('newSimulationErrors.name', newSimulationErrors.name);
    console.log('newSimulationErrors.content', newSimulationErrors.content);
    console.log(
      'Object.values(newSimulationErrors.steps).filter(v => !!v).length',
      Object.values(newSimulationErrors?.steps || {}).filter((v) => !!v),
    );
    return isValid;
  }

  function getSimulationInput(): UpsertSimulationInput {
    return {
      content: simulation.content,
      id: simulation.id,
      name: simulation.name,
      steps: simulation.steps.map((s) => ({
        content: s.content,
        name: s.name,
        order: s.order,
        iframeUrl: s.iframeUrl,
        uuid: s.uuid,
      })),
      publishStatus: simulation.publishStatus,
      thumbnail: simulation.thumbnail,
      created: simulation.created,
      admins: simulation.admins,
      tags: simulation.tags,
      priority: simulation.priority,
    };
  }

  async function handleSubmit() {
    setSimulationCreating(true);
    try {
      const valid = validateSimulation(simulation);
      console.log('simulation valid', valid);
      setSimulation((prevSimulation) => ({ ...prevSimulation, isPristine: false }));
      if (!valid) {
        showNotification({ type: 'error', message: $t('notify.validationFailed') });

        setSimulationCreating(false);
        return;
      }

      const response = await upsertSimulationMutation({
        variables: {
          spaceId: space.id,
          input: getSimulationInput(),
        },
        errorPolicy: 'all',
      });

      const payload = response?.data?.payload;
      if (payload) {
        showNotification({
          type: 'success',
          message: 'Simulation saved successfully!',
        });

        router.push(`/simulations/view/${payload.id}`);
      } else {
        console.error(response.errors);
        showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      }
    } catch (e) {
      console.error(e);

      showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
    }
    setSimulationCreating(false);
  }

  function updateSimulationField(field: KeyOfSimulationInput, value: any) {
    setSimulation((prevSimulation) => ({
      ...prevSimulation,
      [field]: value,
    }));
  }

  function updateSimulationErrorField(field: KeyOfSimulationInput, value: any) {
    setSimulationErrors((prevSimulationErrors) => ({
      ...prevSimulationErrors,
      [field]: value,
    }));
  }

  const updateSimulationFunctions: UpdateSimulationFunctions = {
    initialize,
    addStep,
    moveStepUp,
    moveStepDown,
    removeStep,
    updateSimulationErrorField,
    updateSimulationField,
    updateStep,
  };

  // Return the necessary values and functions
  return {
    simulationCreating,
    simulationLoaded,
    simulation,
    simulationErrors,
    updateSimulationFunctions,
    handleSubmit,
  };
}
