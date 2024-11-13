import { CreateSignedUrlInput } from '@/graphql/generated/generated-types';
import { CreateSignedUrlRequest } from '@/types/request/SignedUrl';
import { SingedUrlResponse } from '@/types/response/SignedUrl';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import { useFetchUtils } from '@dodao/web-core/ui/hooks/useFetchUtils';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { getUploadedImageUrlFromSingedUrl } from '@dodao/web-core/utils/upload/getUploadedImageUrlFromSingedUrl';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface Props {
  space: SpaceWithIntegrationsDto;
  showModal: boolean;
  objectId: string;
  fileUrl: string;
  xPath: string;
  elementImgUrl: string;
  onLoading?: (loading: boolean) => void;
  onInput?: (imageUrl: string, elementImgUrl: string) => void;
  setShowModal: (showModal: boolean) => void;
}

export default function ElementSelectorModal({ space, showModal, objectId, fileUrl, xPath, elementImgUrl, onInput, setShowModal }: Props) {
  const [currentXpath, setCurrenXpath] = useState(xPath);
  const [currentCapture, setCurrentCapture] = useState(elementImgUrl);
  const spaceId = space.id;
  const { postData } = useFetchUtils();

  async function uploadToS3AndReturnScreenshotUrl(file: File | null, objectId: string) {
    if (!file) return;
    const input: CreateSignedUrlInput = {
      imageType: 'ClickableDemos/Element_Image',
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
    return segments[segments.length - 1] + '_selectedElementImg';
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
  const filename = getFileName(fileUrl);
  useEffect(() => {
    let hasModifiedIframe = false; // Flag to track if the iframe has been modified
    async function receiveMessage(event: any) {
      if (event.data.xpath && event.data.elementImgUrl) {
        let screenshotFile = base64ToFile(event.data.elementImgUrl, filename);
        let screenshotURL: string | undefined;
        screenshotURL = await uploadToS3AndReturnScreenshotUrl(screenshotFile, objectId.replace(/[^a-z0-9]/gi, '_'));
        if (event.data.xpath && screenshotURL) {
          setShowModal(false);
          onInput && onInput(event.data.xpath, screenshotURL);
        }
      }
    }

    const handleLoad = async (iframe: HTMLIFrameElement) => {
      if (!iframe) return;
      if (!hasModifiedIframe) {
        // Modify the HTML and get the new URL
        const newUrl = fileUrl;

        // Set the iframe's source to the modified URL
        iframe.src = newUrl;

        // Set the flag to indicate the iframe has been modified
        hasModifiedIframe = true;
      }

      // Set the CSS variables in the iframe
      const parentStyles = window.getComputedStyle(document.body);

      // Collect CSS variables
      const cssVariables = ['--primary-color', '--bg-color', '--text-color', '--link-color', '--heading-color', '--border-color', '--block-bg'];

      const cssValues: any = {};
      cssVariables.forEach((variable) => {
        cssValues[variable] = parentStyles.getPropertyValue(variable);
      });

      // Send the CSS variables to the iframe
      iframe.contentWindow!.postMessage({ type: 'setCssVariables', cssValues }, '*');

      iframe.contentWindow!.postMessage(
        {
          type: 'elementSelector',
          buttonColor: space?.themeColors?.primaryColor,
          buttonTextColor: space?.themeColors?.textColor,
          hoverColor: space?.themeColors?.bgColor,
          selectedColor: space?.themeColors?.primaryColor,
          xpath: xPath,
        },
        '*'
      );
    };

    window.addEventListener('message', receiveMessage);

    const iframe = document.getElementById('iframe') as HTMLIFrameElement;

    iframe.onload = function () {
      handleLoad(iframe);
    };
    iframe.width = '100%';
    iframe.style.height = '93vh';

    // In case the onload event has already fired
    if (!hasModifiedIframe) {
      handleLoad(iframe);
    }

    return () => {
      window.removeEventListener('message', receiveMessage);
    };
  }, [showModal, fileUrl]);

  return (
    <div>
      <FullScreenModal
        open={true}
        onClose={() => {
          setShowModal(false);
          onInput && onInput(currentXpath, currentCapture);
        }}
        title={'Element Selector'}
      >
        <div id="iframe-container" style={{ height: '93vh' }}>
          <iframe id="iframe"></iframe>
        </div>
      </FullScreenModal>
    </div>
  );
}
