import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { base64ToFile, getFileName } from '@/utils/clickableDemos/clickableDemoUtils';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import React, { useEffect } from 'react';

interface Props {
  space: SpaceWithIntegrationsDto;
  showModal: boolean;
  objectId: string;
  fileUrl: string;
  xPath: string;
  onInput: (imageUrl: string, elementImgUrl: string) => void;
  setShowModal: (showModal: boolean) => void;
  uploadToS3AndReturnScreenshotUrl: (file: File, stepNumber: number, imageType: 'page-screenshot' | 'element-screenshot') => Promise<string>;
  stepIndex: number;
}

export default function ElementSelectorModal({ space, showModal, fileUrl, xPath, onInput, setShowModal, uploadToS3AndReturnScreenshotUrl, stepIndex }: Props) {
  const filename = getFileName(fileUrl);
  useEffect(() => {
    let hasModifiedIframe = false; // Flag to track if the iframe has been modified
    async function receiveMessage(event: any) {
      if (event.data.xpath && event.data.elementImgUrl) {
        const screenshotFile = base64ToFile(event.data.elementImgUrl, filename);
        if (!screenshotFile) return;
        const screenshotURL: string = await uploadToS3AndReturnScreenshotUrl(screenshotFile, stepIndex, 'element-screenshot');
        if (event.data.xpath && screenshotURL) {
          setShowModal(false);
          onInput(event.data.xpath, screenshotURL);
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
