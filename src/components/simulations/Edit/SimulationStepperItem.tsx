// Add necessary imports for your project
import IconButton from '@/components/core/buttons/IconButton';
import Input from '@/components/core/input/Input';
import { IconTypes } from '@/components/core/icons/IconTypes';
import MarkdownEditor from '@/components/app/Markdown/MarkdownEditor';
import { EditSimulationType } from '@/components/simulations/Edit/useEditSimulation';
import { SimulationStepInput, Space } from '@/graphql/generated/generated-types';
import { StepError } from '@/types/errors/error';
import { SimulationErrors } from '@/types/errors/simulationErrors';
import styled from 'styled-components';

interface StepProps {
  space: Space;
  simulation: EditSimulationType;
  simulationErrors?: SimulationErrors;
  step: SimulationStepInput;
  stepErrors: StepError | undefined;
  moveStepUp?: (stepUuid: string) => void;
  moveStepDown?: (stepUuid: string) => void;
  removeStep?: (stepUuid: string) => void;
  onUpdateStep: (step: SimulationStepInput) => void;
}

const StyledStepContainer = styled.div<{ error: boolean }>`
  border: ${(props) => (props.error ? '1px solid red' : 'none')};
  border-radius: 0.375rem;
  padding: 1rem;
  margin-bottom: 1rem;
  margin-left: 1rem;
  width: 100%;
`;

const ActionsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  min-height: 40px;
`;

// Export the styled-components

export default function Step({ space, simulation, simulationErrors, step, stepErrors, moveStepUp, moveStepDown, removeStep, onUpdateStep }: StepProps) {
  const updateStepContent = (content: string) => {
    onUpdateStep({ ...step, content });
  };

  const updateStepIframeUrl = (url: string | undefined | null | number) => {
    onUpdateStep({ ...step, iframeUrl: url?.toString() });
  };

  return (
    <StyledStepContainer error={!!simulationErrors?.steps?.[step.uuid]}>
      <h3>Step {step.order + 1}</h3>
      <ActionsContainer>
        <IconButton onClick={() => moveStepUp?.(step.uuid)} iconName={IconTypes.MoveUp} removeBorder disabled={step.order === 0} />
        <IconButton
          onClick={() => moveStepDown?.(step.uuid)}
          iconName={IconTypes.MoveDown}
          removeBorder
          disabled={step.order + 1 === simulation.steps.length}
        />
        <IconButton onClick={() => removeStep?.(step.uuid)} iconName={IconTypes.Trash} removeBorder disabled={simulation.steps.length === 1} />
      </ActionsContainer>
      <div className="w-full">
        <MarkdownEditor
          id={step.uuid}
          modelValue={step.content}
          onUpdate={updateStepContent}
          spaceId={space.id}
          objectId={simulation.id || ''}
          imageType="Simulation"
          editorStyles={{ height: '200px' }}
        />
      </div>
      <div className="w-full">
        <div className="mt-4">
          <Input modelValue={step.iframeUrl} placeholder="Iframe Url" maxLength={500} onUpdate={updateStepIframeUrl} label="Iframe Url" />
        </div>
      </div>
    </StyledStepContainer>
  );
}

export { StyledStepContainer, ActionsContainer };
