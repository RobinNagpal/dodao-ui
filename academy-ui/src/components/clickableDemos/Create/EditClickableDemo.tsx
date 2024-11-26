'use client';

import EditClickableDemoErrorMessage from '@/components/clickableDemos/Create/EditClickableDemoErrorMessage';
import EditClickableDemoStepper from '@/components/clickableDemos/Edit/EditClickableDemoStepper';
import { useDeleteClickableDemo } from '@/components/clickableDemos/Edit/useDeleteClickableDemo';
import { useEditClickableDemo } from '@/components/clickableDemos/Edit/useEditClickableDemo';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { base64ToFile, getFileName, getScreenshotFromIframe } from '@/utils/clickableDemos/clickableDemoUtils';
import Block from '@dodao/web-core/components/app/Block';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import Input from '@dodao/web-core/components/core/input/Input';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageLoading from '@dodao/web-core/components/core/loaders/PageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { ClickableDemoErrors } from '@dodao/web-core/types/errors/clickableDemoErrors';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useRouter } from 'next/navigation';
import { CSSProperties, useEffect, useState } from 'react';

export interface EditClickableDemoProps {
  space: SpaceWithIntegrationsDto;
  demoId?: string | null;
  byteCollection: ByteCollectionSummary;
  closeDemoEditModal?: () => void;
}

export default function EditClickableDemo({ space, demoId, byteCollection, closeDemoEditModal }: EditClickableDemoProps) {
  const { clickableDemoCreating, clickableDemoLoaded, clickableDemo, clickableDemoErrors, handleSubmit, updateClickableDemoFunctions } = useEditClickableDemo(
    space,
    demoId!
  );
  const { handleDeletion } = useDeleteClickableDemo(space, demoId!);
  const { showNotification } = useNotificationContext();
  const threeDotItems: EllipsisDropdownItem[] = [
    { label: 'Delete', key: 'delete' },
    { label: 'Genarate Images', key: 'generate_images' },
  ];

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<boolean>(false);
  const [currentScreenshotStep, setCurrentScreenshotStep] = useState<number>(0);

  const errors = clickableDemoErrors;
  const router = useRouter();

  const inputError = (field: keyof ClickableDemoErrors): string => {
    const error = errors?.[field];
    return error ? error.toString() : '';
  };

  const iframeId = 'generating_screen_shot_iframe';

  async function generateImages(): Promise<void> {
    setGeneratedImages(true);
  }

  const iframeLoaded = async () => {
    const step = clickableDemo.steps[currentScreenshotStep];
    console.log('iframe loaded');
    const iframe: HTMLIFrameElement | null = document.getElementById(iframeId) as HTMLIFrameElement | null;

    if (!iframe) {
      showNotification({
        type: 'error',
        message: 'Failed to load iframe',
        heading: 'Error',
      });
      return;
    }
    const imageDataUrl = await getScreenshotFromIframe(iframe, { type: 'capturePageScreenshot' });
    const urlOfPageScreenshot = await updateClickableDemoFunctions.uploadToS3AndReturnScreenshotUrl(
      base64ToFile(imageDataUrl, getFileName(iframe.src))!,
      currentScreenshotStep,
      'page-screenshot'
    );

    updateClickableDemoFunctions.updateStep({ ...step, screenImgUrl: urlOfPageScreenshot });
    if (step.selector) {
      const elementDataUrl = await getScreenshotFromIframe(iframe, { type: 'captureElementScreenshot', selector: step.selector });
      const urlOfElementScreenshot = await updateClickableDemoFunctions.uploadToS3AndReturnScreenshotUrl(
        base64ToFile(elementDataUrl, getFileName(iframe.src))!,
        currentScreenshotStep,
        'element-screenshot'
      );
      updateClickableDemoFunctions.updateStep({ ...step, elementImgUrl: urlOfElementScreenshot });
    }

    if (currentScreenshotStep < clickableDemo.steps.length - 1) {
      setCurrentScreenshotStep(currentScreenshotStep + 1);
      iframe.src = clickableDemo.steps[currentScreenshotStep + 1].url;
    } else {
      setGeneratedImages(false);
      setCurrentScreenshotStep(0);
    }
  };

  useEffect(() => {
    updateClickableDemoFunctions.initialize();
  }, [demoId]);

  async function clickSubmit(byteCollection: ByteCollectionSummary) {
    await handleSubmit(byteCollection);
  }

  const iframeStyles: CSSProperties = {
    width: '1024px',
    height: '100%',
    minHeight: '93vh',
    border: 'none',
    position: 'absolute',
    left: '0',
    top: '100',
    opacity: 1,
    transition: 'opacity 0.5s ease-in-out',
    pointerEvents: 'none',
  };

  return (
    <PageWrapper>
      <SingleCardLayout>
        <div className="text-color pb-10">
          <div className="py-4 my-4">
            <div className="px-4 mb-4 md:px-0 float-right">
              {demoId && (
                <PrivateEllipsisDropdown
                  items={threeDotItems}
                  onSelect={(key) => {
                    if (key === 'delete') {
                      setShowDeleteModal(true);
                    }
                    if (key === 'generate_images') {
                      generateImages();
                    }
                  }}
                  className="ml-4"
                />
              )}
            </div>
          </div>
          {clickableDemoLoaded ? (
            <>
              <Block title="Basic Info" className="mt-4 font-semibold">
                <div className="mb-2">
                  <Input
                    modelValue={clickableDemo.title}
                    error={inputError('title') ? 'Title is required and should be less than 32 characters long' : ''}
                    maxLength={32}
                    placeholder="only 32 characters"
                    onUpdate={(newValue) => updateClickableDemoFunctions.updateClickableDemoField('title', newValue)}
                  >
                    <div className="font-semibold">Title*</div>
                  </Input>
                </div>
                <div className="mb-2">
                  <Input
                    modelValue={clickableDemo.excerpt}
                    error={inputError('excerpt') ? 'Summary is required and should be less than 64 characters long' : ''}
                    maxLength={64}
                    placeholder="only 64 characters"
                    onUpdate={(newValue) => updateClickableDemoFunctions.updateClickableDemoField('excerpt', newValue)}
                  >
                    <div className="font-semibold">Summary*</div>
                  </Input>
                </div>
              </Block>

              {clickableDemo ? (
                <Block title="Clickable Demo Steps" slim={true} className="font-semibold">
                  <div className="mt-4">
                    <EditClickableDemoStepper
                      space={space}
                      clickableDemo={clickableDemo}
                      clickableDemoErrors={clickableDemoErrors}
                      updateClickableDemoFunctions={updateClickableDemoFunctions}
                    />
                  </div>
                </Block>
              ) : null}

              <EditClickableDemoErrorMessage clickableDemo={clickableDemo} clickableDemoErrors={clickableDemoErrors} />

              <div className="flex justify-center items-center">
                <Button
                  onClick={() => clickSubmit(byteCollection)}
                  loading={!clickableDemoLoaded || clickableDemoCreating}
                  className="block"
                  variant="contained"
                  primary
                >
                  Save
                </Button>
              </div>
            </>
          ) : (
            <PageLoading />
          )}
        </div>
      </SingleCardLayout>
      {showDeleteModal && (
        <DeleteConfirmationModal
          title={`Delete Demo - ${clickableDemo.title}`}
          deleteButtonText="Delete Demo"
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={async () => {
            handleDeletion();
            setShowDeleteModal(false);
            const timestamp = new Date().getTime();
            router.push(`/tidbit-collections?update=${timestamp}`);
            setTimeout(() => closeDemoEditModal?.(), 3000);
          }}
        />
      )}
      {generatedImages && clickableDemo.steps?.[0].url && (
        <>
          <iframe src={clickableDemo.steps?.[0].url} style={iframeStyles} id={iframeId} onLoad={iframeLoaded} />
          <FullPageLoader message={`Generating Screenshot for Step # ${currentScreenshotStep + 1}`} className={'z-50 h-20 block-bg-color'} />
        </>
      )}
    </PageWrapper>
  );
}
