import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import Input from '@dodao/web-core/components/core/input/Input';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import { ClickableDemoStepInput, ImageType, Space, UpsertClickableDemoInput, TooltipPlacement } from '@/graphql/generated/generated-types';
import { ClickableDemoErrors, ClickableDemoStepError } from '@dodao/web-core/types/errors/clickableDemoErrors';
import UploadInput from '@/components/clickableDemos/FileUpload/UploadInput';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { useState } from 'react';
import styles from './ClickableDemoStepperItem.module.scss';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';
import SelectElementInput from '@/components/clickableDemos/ElementSelector/SelectElementInput';

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
  {
    label: TooltipPlacement.Right,
    id: 'right',
  },
  {
    label: TooltipPlacement.Left,
    id: 'left',
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
        {step.screenImgUrl && ( // Assuming `step.screenImgUrl` holds the URL of the screenshot image
          <div className="mt-4">
            <img src={step.screenImgUrl} alt="Screenshot" className="rounded-lg shadow-md max-w-full h-auto" />
          </div>
        )}
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
              <img src={step.elementImgUrl} alt="Screenshot" className="rounded-lg shadow-md max-w-full h-auto" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
