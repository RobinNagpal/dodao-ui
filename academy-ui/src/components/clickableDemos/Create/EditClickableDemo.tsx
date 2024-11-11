'use client';

import Stepper from '@/components/clickableDemos/Edit/EditClickableDemoStepper';
import { useDeleteClickableDemo } from '@/components/clickableDemos/Edit/useDeleteClickableDemo';
import { useEditClickableDemo } from '@/components/clickableDemos/Edit/useEditClickableDemo';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import withSpace from '@/contexts/withSpace';
import { useI18 } from '@/hooks/useI18';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import { CreateSignedUrlRequest } from '@/types/request/SignedUrl';
import { SingedUrlResponse } from '@/types/response/SignedUrl';
import Block from '@dodao/web-core/components/app/Block';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import Input from '@dodao/web-core/components/core/input/Input';
import PageLoading from '@dodao/web-core/components/core/loaders/PageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { CreateSignedUrlInput, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { ClickableDemoErrors } from '@dodao/web-core/types/errors/clickableDemoErrors';
import { useFetchUtils } from '@dodao/web-core/ui/hooks/useFetchUtils';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { getUploadedImageUrlFromSingedUrl } from '@dodao/web-core/utils/upload/getUploadedImageUrlFromSingedUrl';
import html2canvas from 'html2canvas';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import EditClickableDemoErrorMessage from '@/components/clickableDemos/Create/EditClickableDemoErrorMessage';
import { useRouter } from 'next/navigation';

interface EditClickableDemoProps {
  space: SpaceWithIntegrationsFragment;
  demoId?: string | null;
  byteCollection: ByteCollectionSummary;
  closeDemoEditModal?: () => void;
}

function EditClickableDemo({ space, demoId, byteCollection, closeDemoEditModal }: EditClickableDemoProps) {
  const spaceId = space.id;
  const { postData } = useFetchUtils();

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
  const errors = clickableDemoErrors;
  const router = useRouter();

  const inputError = (field: keyof ClickableDemoErrors): string => {
    const error = errors?.[field];
    return error ? error.toString() : '';
  };

  const { $t } = useI18();
  async function uploadToS3AndReturnScreenshotUrl(file: File | null, objectId: string) {
    if (!file) return;
    const input: CreateSignedUrlInput = {
      imageType: 'ClickableDemos/SCREENSHOT_CAPTURE',
      contentType: 'image/png',
      objectId,
      name: file.name.replace(' ', '_').toLowerCase(),
    };

    const response = await postData<SingedUrlResponse, CreateSignedUrlRequest>(
      `${getBaseUrl()}/api/s3-signed-urls`,
      { spaceId, input },
      {
        errorMessage: 'Failed to get signed URL',
      }
    );

    const signedUrl = response?.url!;
    await axios.put(signedUrl, file, {
      headers: { 'Content-Type': 'image/png' },
    });
    const screenshotUrl = getUploadedImageUrlFromSingedUrl(signedUrl);
    return screenshotUrl;
  }
  function getFileName(url: string): string {
    const segments = url.split('/');
    return segments[segments.length - 1] + '_screenshot.png';
  }
  function base64ToFile(base64String: string | undefined, filename: string): File | null {
    if (!base64String) {
      console.error('Invalid Base64 string');
      return null;
    }

    const arr = base64String.split(',');
    if (arr.length !== 2) {
      console.error('Invalid Base64 string format');
      return null;
    }

    const mimeTypeMatch = arr[0].match(/:(.*?);/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : '';

    const byteString = atob(arr[1]);
    const byteNumbers = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i++) {
      byteNumbers[i] = byteString.charCodeAt(i);
    }

    return new File([byteNumbers], filename, { type: mimeType });
  }
  async function generate_images() {
    const iframe = document.createElement('iframe') as HTMLIFrameElement;
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
        const response = await axios.get(step.url);
        if (response.status !== 200) {
          throw new Error('Network response was not ok');
        }
        const htmlContent = response.data;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const iframe = document.getElementById('iframe') as HTMLIFrameElement;
        if (iframe) {
          const iframeSrc = URL.createObjectURL(blob); // Create a URL from the blob
          iframe.src = iframeSrc; // Set the iframe src to the blob URL

          // Optionally wait for the iframe to load
          await new Promise<void>((resolve) => {
            iframe.onload = () => {
              resolve();
            };
          });

          const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDocument) {
            const canvas = await html2canvas(iframeDocument.documentElement, {
              useCORS: true,
              width: 1920,
              height: 1080,
              backgroundColor: null,
            });
            if (canvas.width > 0 && canvas.height > 0) {
              let dataUrl = canvas.toDataURL('image/png');
              const filename = getFileName(step.url);
              let screenshotFile = base64ToFile(dataUrl, filename);
              let screenshotURL: string | undefined;
              const objectId = (space?.name && slugify(space?.name)) || space?.id || 'new-space';
              screenshotURL = await uploadToS3AndReturnScreenshotUrl(screenshotFile, objectId.replace(/[^a-z0-9]/gi, '_'));
              step.screenImgUrl = screenshotURL;
              showNotification({ message: `Image generated for step ${stepNo} successfully`, type: 'success' });
              stepNo += 1;
            }
          }
        }
      } catch {
        console.error('Error fetching or processing the URL:');
        showNotification({ message: 'Some Error occurred', type: 'error' });
      }
    }
    showNotification({ message: 'All images Generated Successfully', type: 'success' });
    document.body.removeChild(iframe);
  }
  useEffect(() => {
    updateClickableDemoFunctions.initialize();
  }, [demoId]);

  async function clickSubmit(byteCollection: ByteCollectionSummary) {
    handleSubmit(byteCollection);
  }

  return (
    <PageWrapper>
      <SingleCardLayout>
        <div className="text-color">
          <div className="py-4 my-4">
            <div className="px-4 mb-4 md:px-0 overflow-hidden float-left"></div>
            <div className="px-4 mb-4 md:px-0 float-right">
              {demoId && (
                <PrivateEllipsisDropdown
                  items={threeDotItems}
                  onSelect={(key) => {
                    if (key === 'delete') {
                      setShowDeleteModal(true);
                    }
                    if (key === 'generate_images') {
                      generate_images();
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
                    placeholder="only 32 characters"
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
                    placeholder="only 64 characters"
                    onUpdate={(newValue) => updateClickableDemoFunctions.updateClickableDemoField('excerpt', newValue)}
                  >
                    <div>Summary*</div>
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

              <EditClickableDemoErrorMessage clickableDemo={clickableDemo} clickableDemoErrors={clickableDemoErrors} />

              <Button
                onClick={() => clickSubmit(byteCollection)}
                loading={!clickableDemoLoaded || clickableDemoCreating}
                className="block w-full"
                variant="contained"
                primary
              >
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
            const timestamp = new Date().getTime();
            router.push(`/tidbit-collections?update=${timestamp}`);
            setTimeout(() => closeDemoEditModal?.(), 3000);
          }}
        />
      )}
    </PageWrapper>
  );
}

export default withSpace(EditClickableDemo);
