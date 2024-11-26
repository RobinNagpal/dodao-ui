import { ClickableDemoStepInput, UpsertClickableDemoInput } from '@/graphql/generated/generated-types';
import { TooltipPlacement } from '@/types/clickableDemos/ClickableDemoDto';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { base64ToFile, getFileName, getScreenshotFromIframe } from '@/utils/clickableDemos/clickableDemoUtils';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import Input from '@dodao/web-core/components/core/input/Input';
import CardLoader from '@dodao/web-core/components/core/loaders/CardLoader';
import LoadingSpinner from '@dodao/web-core/components/core/loaders/LoadingSpinner';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';
import { ClickableDemoErrors, ClickableDemoStepError } from '@dodao/web-core/types/errors/clickableDemoErrors';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import React, { CSSProperties, useState } from 'react';
import styles from './EditClickableDemoStepperItem.module.scss';
import EditableImage from '@dodao/web-core/components/core/image/EditableImage';
import { ClickableDemoHtmlCaptureDto } from '@/types/html-captures/ClickableDemoHtmlCaptureDto';
import SelectHtmlCaptureModal from '@/components/clickableDemoHtmlCapture/SelectHtmlCaptureModal';
import ElementSelectorModal from '../ElementSelector/ElementSelectorModal';

interface StepProps {
  space: SpaceWithIntegrationsDto;
  clickableDemo: UpsertClickableDemoInput;
  clickableDemoErrors?: ClickableDemoErrors;
  step: ClickableDemoStepInput;
  stepIndex: number;
  stepErrors: ClickableDemoStepError | undefined;
  moveStepUp?: (stepUuid: string) => void;
  moveStepDown?: (stepUuid: string) => void;
  removeStep?: (stepUuid: string) => void;
  onUpdateStep: (step: ClickableDemoStepInput) => void;
  uploadToS3AndReturnScreenshotUrl: (file: File, stepNumber: number, imageType: 'page-screenshot' | 'element-screenshot') => Promise<string>;
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
  uploadToS3AndReturnScreenshotUrl,
}: StepProps) {
  const [showSelectHtmlCaptureModal, setShowSelectHtmlCaptureModal] = useState(false);
  const [showElementSelectorModal, setShowElementSelectorModal] = useState(false);
  const [generatingElementScreenshot, setGeneratingElementScreenshot] = useState(false);
  const [currentElementSelector, setCurrentElementSelector] = useState<string>('');

  const handleSelectHtmlCapture = (selectedCapture: ClickableDemoHtmlCaptureDto) => {
    updateStepUrl(selectedCapture.fileUrl, selectedCapture.fileImageUrl);
    setShowSelectHtmlCaptureModal(false);
  };

  const updateStepSelector = async (selector: string) => {
    if (!selector?.trim()) {
      onUpdateStep({ ...step, selector: '', elementImgUrl: '' });
      return;
    }
    setGeneratingElementScreenshot(true);
    setCurrentElementSelector(selector);
    setShowElementSelectorModal(false);
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

  async function generateScreenshotOfElement() {
    const iframe = document.getElementById('element-screenshot-iframe') as HTMLIFrameElement;
    const dataUrl = await getScreenshotFromIframe(iframe, { type: 'captureElementScreenshot', selector: currentElementSelector });

    const urlOfElementScreenshot = await uploadToS3AndReturnScreenshotUrl(base64ToFile(dataUrl, getFileName(iframe.src))!, stepIndex, 'element-screenshot');
    onUpdateStep({ ...step, selector: currentElementSelector, elementImgUrl: urlOfElementScreenshot });
    setGeneratingElementScreenshot(false);
  }

  const screenshotIframeStyles: CSSProperties = {
    width: '1024px',
    height: '100%',
    minHeight: '93vh',
    border: 'none',
    position: 'absolute',
    left: '0',
    top: '0',
    transition: 'opacity 0.5s ease-in-out',
    pointerEvents: 'none',
    visibility: 'hidden',
  };

  return (
    <div className={`${styles.StyledStepContainer} p-5`} style={{ border: !!clickableDemoErrors?.steps?.[step.id] ? '1px solid red' : 'none' }}>
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
            label="Tooltip Position*"
            selectedItemId={step.placement || TooltipPlacement.bottom}
            items={tooltipStyleSelect}
            setSelectedItemId={(value) => updateStepTooltipPlacement(value!)}
          />
        </div>
      </div>

      <div className="w-full my-2 flex flex-wrap sm:flex-nowrap justify-around items-end gap-5">
        <EditableImage
          label="Select Capture"
          afterUploadLabel="Capture Selected"
          imageUrl={step.screenImgUrl}
          onRemove={() => updateStepUrl('', '')}
          onUpload={() => setShowSelectHtmlCaptureModal(true)}
          height="200px"
          error={inputError('url') ? 'Screen Capture is required' : ''}
        />

        {generatingElementScreenshot ? (
          <div
            style={{
              height: '150px',
              maxWidth: '250px',
            }}
            className="flex justify-center align-center w-full"
          >
            <LoadingSpinner />
          </div>
        ) : (
          <EditableImage
            label="Select Element"
            afterUploadLabel="Element Selected"
            imageUrl={step.elementImgUrl}
            onRemove={() => updateStepSelector('')}
            onUpload={() => setShowElementSelectorModal(true)}
            height="150px"
            maxWidth="250px"
            disabled={step.screenImgUrl != ''}
            disabledTooltip="Please select a capture first"
            error={inputError('selector') ? 'Selector is required' : ''}
          />
        )}
      </div>
      {showSelectHtmlCaptureModal && (
        <SelectHtmlCaptureModal
          showSelectHtmlCaptureModal={showSelectHtmlCaptureModal}
          onClose={() => setShowSelectHtmlCaptureModal(false)}
          selectHtmlCapture={handleSelectHtmlCapture}
          demoId={clickableDemo.id}
          spaceId={space.id}
        />
      )}
      {showElementSelectorModal && (
        <ElementSelectorModal
          space={space}
          onInput={updateStepSelector}
          showModal={showElementSelectorModal}
          objectId={(space?.name && slugify(space?.name)) || space?.id || 'new-space'}
          fileUrl={step.url!}
          xPath={step.selector || ''}
          setShowModal={setShowElementSelectorModal}
        />
      )}
      {generatingElementScreenshot && currentElementSelector && (
        <div id="iframe-container" style={{ height: '93vh' }}>
          <iframe id="element-screenshot-iframe" src={step.url} onLoad={generateScreenshotOfElement} style={screenshotIframeStyles} />
        </div>
      )}
    </div>
  );
}
