import CaptureInput from '@/components/clickableDemos/CaptureSelector/CaptureInput';
import SelectElementInput from '@/components/clickableDemos/ElementSelector/SelectElementInput';
import { ClickableDemoStepInput, Space, UpsertClickableDemoInput } from '@/graphql/generated/generated-types';
import { TooltipPlacement } from '@/types/clickableDemos/ClickableDemoDto';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import Input from '@dodao/web-core/components/core/input/Input';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';
import { ClickableDemoErrors, ClickableDemoStepError } from '@dodao/web-core/types/errors/clickableDemoErrors';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { useState } from 'react';
import styles from './EditClickableDemoStepperItem.module.scss';

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
    label: TooltipPlacement.top,
    id: 'top',
  },
  {
    label: TooltipPlacement.bottom,
    id: 'bottom',
  },
  {
    label: TooltipPlacement.right,
    id: 'right',
  },
  {
    label: TooltipPlacement.left,
    id: 'left',
  },
];

export default function EditClickableDemoStepperItem({
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

  const updateStepSelector = (selector: string | number | undefined, elementImgUrl: string | undefined) => {
    onUpdateStep({ ...step, selector: selector?.toString() || '', elementImgUrl: elementImgUrl?.toString() || '' });
  };

  const updateStepUrl = (url: string | number | undefined, screenImgUrl: string | undefined) => {
    onUpdateStep({ ...step, url: url?.toString() || '', screenImgUrl: screenImgUrl?.toString() || '' });
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

  console.log('step.placement', step.placement);

  return (
    <div className={`${styles.StyledStepContainer}`} style={{ border: !!clickableDemoErrors?.steps?.[step.id] ? '1px solid red' : 'none' }}>
      <div className="flex justify-end min-h-10">
        <IconButton
          onClick={() => moveStepDown?.(step.id)}
          iconName={IconTypes.MoveDown}
          removeBorder
          disabled={stepIndex + 1 === clickableDemo.steps.length}
        />
        <IconButton onClick={() => moveStepUp?.(step.id)} iconName={IconTypes.MoveUp} removeBorder disabled={stepIndex === 0} />
        <IconButton onClick={() => removeStep?.(step.id)} iconName={IconTypes.Trash} removeBorder disabled={clickableDemo.steps.length === 1} />
      </div>
      <div className="w-full">
        <div className="mt-4">
          <Input
            modelValue={step.tooltipInfo}
            placeholder="Tooltip Information"
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
            selectedItemId={step.placement || TooltipPlacement.bottom}
            items={tooltipStyleSelect}
            setSelectedItemId={(value) => updateStepTooltipPlacement(value!)}
          />
        </div>
      </div>
      <div className="w-full">
        <div className="mt-4">
          <CaptureInput
            label="HTML Capture"
            error={inputError('url') ? 'URL is required' : ''}
            modelValue={step.url}
            onInput={updateStepUrl}
            demoId={clickableDemo.id}
            spaceId={space.id}
          />
          {step.screenImgUrl && (
            <div className="mt-4">
              <img src={step.screenImgUrl} alt="Screenshot" className="rounded-lg shadow-md max-w-full h-[150px] object-fit" />
            </div>
          )}
        </div>
      </div>
      <div className="w-full">
        <div className="mt-4">
          <SelectElementInput
            label="Selector"
            error={inputError('selector') ? 'Selector is required' : ''}
            space={space}
            modelValue={step.selector}
            elementImgUrl={step.elementImgUrl}
            objectId={(space?.name && slugify(space?.name)) || space?.id || 'new-space'}
            fileUrl={step.url}
            onInput={updateStepSelector}
            onLoading={setUploadHTMLFileLoading}
          />
          {step.elementImgUrl && ( // Assuming `step.screenImgUrl` holds the URL of the screenshot image
            <div className="mt-4">
              <img src={step.elementImgUrl} alt="Screenshot" className="rounded-lg shadow-md max-w-full max-h-60" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
