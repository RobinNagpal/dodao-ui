import IconButton from '@/components/core/buttons/IconButton';
import Input from '@/components/core/input/Input';
import { IconTypes } from '@/components/core/icons/IconTypes';
import { ClickableDemoStepInput, ImageType, Space, UpsertClickableDemoInput, TooltipPlacement } from '@/graphql/generated/generated-types';
import { ClickableDemoErrors, ClickableDemoStepError } from '@/types/errors/clickableDemoErrors';
import UploadInput from '@/components/clickableDemos/FileUpload/UploadInput';
import SelectElementInput from '@/components/clickableDemos/ElementSelector/SelectElementInput';
import { slugify } from '@/utils/auth/slugify';
import { useState } from 'react';
import styles from './ClickableDemoStepperItem.module.scss';
import StyledSelect, { StyledSelectItem } from '@/components/core/select/StyledSelect';

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

const tooltipStyleSelect: StyledSelectItem[] = [
  {
    label: TooltipPlacement.Top,
    id: 'top',
  },
  {
    label: TooltipPlacement.Bottom,
    id: 'bottom',
  },
];

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

  const updateStepTooltipPlacement = (tooltipPlacement: string | number | undefined) => {
    onUpdateStep({ ...step, placement: tooltipPlacement?.toString() || '' });
  };

  const errors = clickableDemoErrors;
  const inputError = (field: keyof ClickableDemoStepError): string => {
    const error = errors?.steps?.[stepIndex]?.[field];
    return error ? error.toString() : '';
  };

  return (
    <div className={`${styles.StyledStepContainer}`} style={{ border: !!clickableDemoErrors?.steps?.[step.id] === true ? '1px solid red' : 'none' }}>
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
          <StyledSelect
            label="Tooltip Position *"
            selectedItemId={step.placement}
            items={tooltipStyleSelect}
            setSelectedItemId={(value) => updateStepTooltipPlacement(value!)}
          />
        </div>
      </div>
      <div className="w-full">
        <div className="mt-4">
          <UploadInput
            label="HTML File"
            error={inputError('url') ? 'URL is required' : ''}
            imageType={ImageType.ClickableDemos}
            spaceId={space?.id || 'new-space'}
            modelValue={step.url}
            objectId={(space?.name && slugify(space?.name)) || space?.id || 'new-space'}
            onInput={updateStepUrl}
            onLoading={setUploadHTMLFileLoading}
          />
        </div>
      </div>
      <div className="w-full">
        <div className="mt-4">
          <SelectElementInput
            label="Selector"
            error={inputError('selector') ? 'Selector is required' : ''}
            space={space}
            modelValue={step.selector}
            objectId={(space?.name && slugify(space?.name)) || space?.id || 'new-space'}
            fileUrl={step.url}
            onInput={updateStepSelector}
            onLoading={setUploadHTMLFileLoading}
          />
        </div>
      </div>
    </div>
  );
}
