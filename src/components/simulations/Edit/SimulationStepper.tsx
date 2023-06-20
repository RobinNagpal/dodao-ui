import CalendarIcon from '@/components/core/icons/CalendarIcon';
import SimulationStepperItem from '@/components/simulations/Edit/SimulationStepperItem';
import { Space } from '@/graphql/generated/generated-types';
import { SimulationErrors } from '@/types/errors/simulationErrors';
import styled from 'styled-components';
import { EditSimulationType, UpdateSimulationFunctions } from './useEditSimulation';

interface SimulationCreateStepperProps {
  space: Space;
  simulation: EditSimulationType;
  simulationErrors?: SimulationErrors;
  errorColor?: string;
  successColor?: string;
  updateSimulationFunctions: UpdateSimulationFunctions;
}

const SvgContainer = styled.div`
  background-color: var(--primary-color);
`;
function SimulationCreateStepper({
  space,
  simulation,
  simulationErrors,
  errorColor = '#d32f2f',
  successColor = '#00813a',
  updateSimulationFunctions,
}: SimulationCreateStepperProps) {
  const errors = simulationErrors;
  const styleObject = {
    '--error-color': errorColor,
    '--success-color': successColor,
  };

  return (
    <div className="w-full flex flex-row">
      <ol className="border-l-2 border-primary m-5 w-full">
        {simulation.steps.map((step) => (
          <li key={step.uuid} className="ml-10 mb-2 w-full flex">
            <SvgContainer className="bg-primary w-6 h-6 flex items-center justify-center rounded-full -ml-14 mt-6">
              <CalendarIcon />
            </SvgContainer>
            <SimulationStepperItem
              space={space}
              simulation={simulation}
              simulationErrors={simulationErrors}
              step={step}
              stepErrors={errors?.steps?.[step.order]}
              moveStepUp={updateSimulationFunctions.moveStepUp}
              moveStepDown={updateSimulationFunctions.moveStepDown}
              removeStep={updateSimulationFunctions.removeStep}
              onUpdateStep={updateSimulationFunctions.updateStep}
            />
          </li>
        ))}
        <li className="ml-10 mb-10 flex w-full">
          <SvgContainer className="bg-primary w-6 h-6 flex items-center justify-center rounded-full -ml-14 my-2">
            <CalendarIcon />
          </SvgContainer>
          <button
            onClick={updateSimulationFunctions.addStep}
            className="m-auto rounded-full text-2xl bg-primary w-[48px] text-white flex items-center font-bold justify-center h-[48px]"
          >
            <span className="mb-1">+</span>
          </button>
        </li>
      </ol>
    </div>
  );
}

export default SimulationCreateStepper;
