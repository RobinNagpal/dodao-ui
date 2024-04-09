import IconButton from '@/components/core/buttons/IconButton';
import Input from '@/components/core/input/Input';
import { IconTypes } from '@/components/core/icons/IconTypes';
import { ClickableDemoStepInput, ImageType, Space, UpsertClickableDemoInput } from '@/graphql/generated/generated-types';
import styled from 'styled-components';
import { ClickableDemoErrors, ClickableDemoStepError } from '@/types/errors/clickableDemoErrors';
import UploadInput from '@/components/app/UploadInput';
import { slugify } from '@/utils/auth/slugify';
import { useState } from 'react';

interface StepProps {
  space: Space;
  clickableDemo: UpsertClickableDemoInput;
  clickableDemoErrors?: ClickableDemoErrors;
  step: ClickableDemoStepInput;
  stepIndex: number;
  stepErrors: ClickableDemoStepError | undefined;
  moveStepUp?: (stepUuid: string) => void;
  moveStepDown?: (stepUuid: string) => void;
  removeStep?: (stepUuid: string) => void;
  onUpdateStep: (step: ClickableDemoStepInput) => void;
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

export default function Step({
  space,
  clickableDemo,
  clickableDemoErrors,
  step,
  stepIndex,
  stepErrors,
  moveStepUp,
  moveStepDown,
  removeStep,
  onUpdateStep,
}: StepProps) {
  const [uploadHTMLFileLoading, setUploadHTMLFileLoading] = useState(false);

  const updateStepSelector = (selector: string | number | undefined) => {
    onUpdateStep({ ...step, selector: selector?.toString() || '' });
  };

  const updateStepUrl = (url: string | number | undefined) => {
    onUpdateStep({ ...step, url: url?.toString() || '' });
  };

  const updateStepTooltipInfo = (tooltipInfo: string | number | undefined) => {
    onUpdateStep({ ...step, tooltipInfo: tooltipInfo?.toString() || '' });
  };

  const errors = clickableDemoErrors;
  const inputError = (field: keyof ClickableDemoStepError): string => {
    const error = errors?.steps?.[stepIndex]?.[field];
    return error ? error.toString() : '';
  };

  return (
    <StyledStepContainer error={!!clickableDemoErrors?.steps?.[step.id]}>
      <h3>Step {step.order + 1}</h3>
      <div className="flex justify-end min-h-10">
        <IconButton onClick={() => moveStepUp?.(step.id)} iconName={IconTypes.MoveUp} removeBorder disabled={step.order === 0} />
        <IconButton
          onClick={() => moveStepDown?.(step.id)}
          iconName={IconTypes.MoveDown}
          removeBorder
          disabled={step.order + 1 === clickableDemo.steps.length}
        />
        <IconButton onClick={() => removeStep?.(step.id)} iconName={IconTypes.Trash} removeBorder disabled={clickableDemo.steps.length === 1} />
      </div>
      <div className="w-full">
        <div className="mt-4">
          <Input
            modelValue={step.tooltipInfo}
            placeholder="Toolip Information"
            maxLength={500}
            onUpdate={updateStepTooltipInfo}
            label="Tooltip Information"
            error={inputError('tooltipInfo') ? 'Tooltip Information is required' : ''}
          />
        </div>
      </div>
      <div className="w-full">
        <div className="mt-4">
          <Input
            modelValue={step.selector}
            placeholder="Selector"
            maxLength={500}
            onUpdate={updateStepSelector}
            label="Selector"
            error={inputError('selector') ? 'Selector is required' : ''}
          />
        </div>
      </div>
      <div className="w-full">
        <div className="mt-4">
          <UploadInput
            label="HTML File"
            error={inputError('url') ? 'URL is required' : ''}
            imageType={ImageType.Space}
            spaceId={space?.id || 'new-space'}
            modelValue={step.url}
            objectId={(space?.name && slugify(space?.name)) || space?.id || 'new-space'}
            onInput={updateStepUrl}
            onLoading={setUploadHTMLFileLoading}
          />
        </div>
      </div>
    </StyledStepContainer>
  );
}

export { StyledStepContainer, ActionsContainer };
