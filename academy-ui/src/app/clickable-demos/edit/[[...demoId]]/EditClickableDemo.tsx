import Stepper from '@/components/clickableDemos/Edit/EditClickableDemoStepper';
import { useDeleteClickableDemo } from '@/components/clickableDemos/Edit/useDeleteClickableDemo';
import { useEditClickableDemo } from '@/components/clickableDemos/Edit/useEditClickableDemo';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { CreateSignedUrlInput } from '@/graphql/generated/generated-types';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import { CreateSignedUrlRequest } from '@/types/request/SignedUrl';
import { SingedUrlResponse } from '@/types/response/SignedUrl';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import Block from '@dodao/web-core/components/app/Block';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import Input from '@dodao/web-core/components/core/input/Input';
import PageLoading from '@dodao/web-core/components/core/loaders/PageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { ClickableDemoErrors } from '@dodao/web-core/types/errors/clickableDemoErrors';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { getUploadedImageUrlFromSingedUrl } from '@dodao/web-core/utils/upload/getUploadedImageUrlFromSingedUrl';
import html2canvas from 'html2canvas';
import Link from 'next/link';
import { useEffect, useState } from 'react';

function EditClickableDemo(props: { space: SpaceWithIntegrationsDto; demoId: string }) {
  const { space, demoId } = props;
  const spaceId = space.id;
  const { showNotification } = useNotificationContext();
  const { clickableDemoCreating, clickableDemoLoaded, clickableDemo, clickableDemoErrors, handleSubmit, updateClickableDemoFunctions } = useEditClickableDemo(
    space,
    demoId
  );

  const { postData } = usePostData<SingedUrlResponse, CreateSignedUrlRequest>(
    {
      errorMessage: 'Failed to get signed URL',
    },
    {}
  );

  const { handleDeletion } = useDeleteClickableDemo(space, demoId);
  const threeDotItems: EllipsisDropdownItem[] = [
    { label: 'Delete', key: 'delete' },
    { label: 'Generate Images', key: 'generate_images' },
  ];

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const errors = clickableDemoErrors;

  const inputError = (field: keyof ClickableDemoErrors): string => {
    const error = errors?.[field];
    return error ? error.toString() : '';
  };

  async function uploadToS3AndReturnScreenshotUrl(file: File, objectId: string): Promise<string | undefined> {
    if (!file) return undefined;
    const input: CreateSignedUrlInput = {
      imageType: 'ClickableDemos/SCREENSHOT_CAPTURE',
      contentType: 'image/png',
      objectId,
      name: file.name.replace(' ', '_').toLowerCase(),
    };

    const response = await postData(`${getBaseUrl()}/api/s3-signed-urls`, { spaceId, input });

    const signedUrl = response?.url!;

    await fetch(signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/png' },
      body: file,
    });

    const screenshotUrl = getUploadedImageUrlFromSingedUrl(signedUrl);
    return screenshotUrl;
  }

  function getFileName(url: string): string {
    const segments = url.split('/');
    return segments[segments.length - 1] + '_screenshot.png';
  }

  function base64ToFile(base64String: string, filename: string): File {
    const arr = base64String.split(',');
    const mimeTypeMatch = arr[0].match(/:(.*?);/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';

    const byteString = atob(arr[1]);
    const byteNumbers = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i++) {
      byteNumbers[i] = byteString.charCodeAt(i);
    }

    return new File([byteNumbers], filename, { type: mimeType });
  }

  async function generateImages(): Promise<void> {
    const iframe: HTMLIFrameElement = document.createElement('iframe');
    iframe.id = 'iframe';
    iframe.style.width = '1920px';
    iframe.style.height = '1080px';
    iframe.style.border = 'none';
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    document.body.appendChild(iframe);
    let stepNo = 1;
    for (const step of clickableDemo.steps) {
      try {
        // Fetch the HTML content from the URL
        const response = await fetch(step.url);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const htmlContent = await response.text();
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const iframeElement = document.getElementById('iframe') as HTMLIFrameElement;
        if (iframeElement) {
          const iframeSrc = URL.createObjectURL(blob); // Create a URL from the blob
          iframeElement.src = iframeSrc; // Set the iframe src to the blob URL

          // Wait for the iframe to load
          await new Promise<void>((resolve) => {
            iframeElement.onload = () => {
              resolve();
            };
          });

          const iframeDocument = iframeElement.contentDocument || iframeElement.contentWindow?.document;
          if (iframeDocument) {
            // Capture the screenshot of the entire page
            const canvasFullPage = await html2canvas(iframeDocument.documentElement, {
              useCORS: true,
              width: 1920,
              height: 1080,
              backgroundColor: null,
            });
            if (canvasFullPage.width > 0 && canvasFullPage.height > 0) {
              const dataUrlFullPage = canvasFullPage.toDataURL('image/png');
              const filenameFullPage = getFileName(step.url);
              const screenshotFileFullPage = base64ToFile(dataUrlFullPage, filenameFullPage);
              const objectId = (space?.name && slugify(space?.name)) || space?.id || 'new-space';
              const screenshotURL = await uploadToS3AndReturnScreenshotUrl(screenshotFileFullPage, objectId.replace(/[^a-z0-9]/gi, '_'));
              step.screenImgUrl = screenshotURL;
              showNotification({ message: `Image generated for step ${stepNo} successfully`, type: 'success' });
            }

            // Now capture the screenshot of the selected element
            if (step.selector) {
              // Find the element using the selector (XPath)
              const selectedElement = getElementByXPath(step.selector, iframeDocument) as HTMLElement;
              if (selectedElement) {
                const dataUrlElement = await captureScreenshotWithOverlay(selectedElement, iframeDocument);
                const filenameElement = `${getFileName(step.url)}_element.png`;
                const screenshotFileElement = base64ToFile(dataUrlElement, filenameElement);
                const objectId = (space?.name && slugify(space?.name)) || space?.id || 'new-space';
                const screenshotElementURL = await uploadToS3AndReturnScreenshotUrl(screenshotFileElement, objectId.replace(/[^a-z0-9]/gi, '_'));
                step.elementImgUrl = screenshotElementURL;
                showNotification({ message: `Element image generated for step ${stepNo} successfully`, type: 'success' });
              } else {
                console.error('Selected element not found in the iframe document.');
                showNotification({ message: 'Selected element not found', type: 'error' });
              }
            }

            stepNo += 1;
          }
        }
      } catch (error) {
        console.error('Error fetching or processing the URL:', error);
        showNotification({ message: 'Some Error occurred', type: 'error' });
      }
    }
    showNotification({ message: 'All images Generated Successfully', type: 'success' });
    document.body.removeChild(iframe);
  }

  function getElementByXPath(xpath: string, doc: Document): HTMLElement | null {
    const iterator = doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    const node = iterator.singleNodeValue;
    return node as HTMLElement | null;
  }

  async function captureScreenshotWithOverlay(element: HTMLElement, currentContextNode: Document): Promise<string> {
    // First, create an overlay on the element
    const overlay = createOverlay(element, currentContextNode);
    // Wait for the overlay to be added
    await new Promise<void>((resolve) => setTimeout(resolve, 100));
    // Capture the screenshot
    const rect = element.getBoundingClientRect();
    const canvas = await html2canvas(currentContextNode.body, {
      useCORS: true,
      backgroundColor: null,
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height,
    });
    // Remove the overlay
    overlay.remove();
    return canvas.toDataURL('image/png');
  }

  function createOverlay(element: HTMLElement, currentContextNode: Document): HTMLDivElement {
    const overlay = currentContextNode.createElement('div');
    const rect = element.getBoundingClientRect();
    Object.assign(overlay.style, {
      position: 'absolute',
      top: `${rect.top + window.scrollY}px`,
      left: `${rect.left + window.scrollX}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      backgroundColor: 'rgba(255, 0, 0, 0.5)', // Semi-transparent red overlay
      pointerEvents: 'none',
      zIndex: '999999',
    });
    currentContextNode.body.appendChild(overlay);
    return overlay;
  }

  useEffect(() => {
    updateClickableDemoFunctions.initialize();
  }, [demoId]);

  function clickSubmit() {
    // handleSubmit(byteCollection);
  }

  return (
    <PageWrapper>
      <SingleCardLayout>
        <div>
          <div className="py-4 my-4">
            <div className="px-4 mb-4 md:px-0 overflow-hidden float-left">
              <Link href={demoId ? `/clickable-demos/view/${demoId}/0` : `/clickable-demos`} className="text-color">
                <span className="mr-1 font-bold">&#8592;</span>
                {demoId ? clickableDemo.title : 'Back to Clickable Demos'}
              </Link>
            </div>
            <div className="px-4 mb-4 md:px-0 float-right">
              {demoId && (
                <PrivateEllipsisDropdown
                  items={threeDotItems}
                  onSelect={async (key) => {
                    if (key === 'delete') {
                      setShowDeleteModal(true);
                    }
                    if (key === 'generate_images') {
                      // setGenerateImages(true);
                      await generateImages();
                    }
                  }}
                  className="ml-4"
                />
              )}
            </div>
          </div>
          {clickableDemoLoaded ? (
            <>
              <Block title="Basic Info" className="mt-4">
                <div className="mb-2">
                  <Input
                    modelValue={clickableDemo.title}
                    error={inputError('title') ? 'Title is required' : ''}
                    maxLength={32}
                    onUpdate={(newValue) => updateClickableDemoFunctions.updateClickableDemoField('title', newValue)}
                  >
                    <div>Title*</div>
                  </Input>
                </div>
                <div className="mb-2">
                  <Input
                    modelValue={clickableDemo.excerpt}
                    error={inputError('excerpt') ? 'Excerpt is required' : ''}
                    maxLength={64}
                    onUpdate={(newValue) => updateClickableDemoFunctions.updateClickableDemoField('excerpt', newValue)}
                  >
                    <div>Excerpt*</div>
                  </Input>
                </div>
              </Block>

              {clickableDemo ? (
                <Block title="Clickable Demo Steps" slim={true}>
                  <div className="mt-4">
                    <Stepper
                      space={space}
                      clickableDemo={clickableDemo}
                      clickableDemoErrors={clickableDemoErrors}
                      updateClickableDemoFunctions={updateClickableDemoFunctions}
                    />
                  </div>
                </Block>
              ) : null}

              <Button onClick={clickSubmit} loading={!clickableDemoLoaded || clickableDemoCreating} className="block w-full" variant="contained" primary>
                Publish
              </Button>
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
          }}
        />
      )}
    </PageWrapper>
  );
}

export default EditClickableDemo;
