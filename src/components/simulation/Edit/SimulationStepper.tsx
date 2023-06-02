import SimulationStepperItem from '@/components/simulation/Edit/SimulationStepperItem';
import { Space } from '@/graphql/generated/generated-types';
import { SimulationErrors } from '@/types/errors/simulationErrors';
import { EditSimulationType, UpdateSimulationFunctions } from './useEditSimulation';

interface SimulationCreateStepperProps {
  space: Space;
  simulation: EditSimulationType;
  simulationErrors?: SimulationErrors;
  errorColor?: string;
  successColor?: string;
  updateSimulationFunctions: UpdateSimulationFunctions;
}

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
            <div className="bg-primary w-6 h-6 flex items-center justify-center rounded-full -ml-4">
              <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                className="text-white w-3 h-3"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path
                  fill="currentColor"
                  d="M0 464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V192H0v272zm64-192c0-8.8 7.2-16 16-16h288c8.8 0 16 7.2 16 16v64c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16v-64zM400 64h-48V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H160V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H48C21.5 64 0 85.5 0 112v48h448v-48c0-26.5-21.5-48-48-48z"
                ></path>
              </svg>
            </div>
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
          <div className="bg-primary w-6 h-6 flex items-center justify-center rounded-full -ml-4 my-2">
            <svg
              aria-hidden="true"
              focusable="false"
              data-prefix="fas"
              className="text-white w-3 h-3"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
            >
              <path
                fill="currentColor"
                d="M0 464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V192H0v272zm64-192c0-8.8 7.2-16 16-16h288c8.8 0 16 7.2 16 16v64c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16v-64zM400 64h-48V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H160V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H48C21.5 64 0 85.5 0 112v48h448v-48c0-26.5-21.5-48-48-48z"
              ></path>
            </svg>
          </div>
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
