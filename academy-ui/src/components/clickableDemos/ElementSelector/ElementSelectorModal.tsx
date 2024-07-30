import React, { useEffect, useState } from 'react';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import { CreateSignedUrlInput, Space, useCreateSignedUrlMutation } from '@/graphql/generated/generated-types';
import { getUploadedImageUrlFromSingedUrl } from '@dodao/web-core/utils/upload/getUploadedImageUrlFromSingedUrl';
import axios from 'axios';

interface Props {
  space: Space;
  showModal: boolean;
  objectId: string;
  fileUrl: string;
  xPath: string;
  selectedElementImgUrl: string;
  onLoading?: (loading: boolean) => void;
  onInput?: (imageUrl: string, selectedElementImgUrl: string) => void;
  setShowModal: (showModal: boolean) => void;
}

export default function ElementSelectorModal({ space, showModal, objectId, fileUrl, xPath, selectedElementImgUrl, onInput, setShowModal }: Props) {
  const [currentXpath, setCurrenXpath] = useState(xPath);
  const [currentCapture, setCurrentCapture] = useState(selectedElementImgUrl);
  const [createSignedUrlMutation] = useCreateSignedUrlMutation();
  const spaceId = space.id;

  async function uploadToS3AndReturnScreenshotUrl(file: File | null, objectId: string) {
    if (!file) return;
    const input: CreateSignedUrlInput = {
      imageType: 'ClickableDemos/Element_Image',
      contentType: 'image/png',
      objectId,
      name: file.name.replace(' ', '_').toLowerCase(),
    };

    const response = await createSignedUrlMutation({ variables: { spaceId, input } });

    const signedUrl = response?.data?.payload!;
    await axios.put(signedUrl, file, {
      headers: { 'Content-Type': 'image/png' },
    });
    const imageUrl = getUploadedImageUrlFromSingedUrl(signedUrl);
    return imageUrl;
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
    async function receiveMessage(event: any) {
      if (event.data.xpath && event.data.selectedElementImgUrl) {
        let screenshotFile = base64ToFile(event.data.selectedElementImgUrl, filename);
        let screenshotURL: string | undefined;
        screenshotURL = await uploadToS3AndReturnScreenshotUrl(screenshotFile, objectId.replace(/[^a-z0-9]/gi, '_'));
        if (event.data.xpath && screenshotURL) {
          setShowModal(false);
          onInput && onInput(event.data.xpath, screenshotURL);
        }
      }
    }
    const handleLoad = (iframe: HTMLIFrameElement) => {
      if (!iframe) return;

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

    iframe.width = '100%';
    iframe.style.height = '93vh';
    iframe.onload = function () {
      handleLoad(iframe);
    };

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
          <iframe id="iframe" src={fileUrl}></iframe>
        </div>
      </FullScreenModal>
    </div>
  );
}
