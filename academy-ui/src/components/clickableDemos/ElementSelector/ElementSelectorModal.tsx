import React, { useEffect } from 'react';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import { Space } from '@/graphql/generated/generated-types';

interface Props {
  space: Space;
  showModal: boolean;
  fileUrl: string;
  xPath: string;
  onLoading?: (loading: boolean) => void;
  onInput?: (imageUrl: string) => void;
  setShowModal: (showModal: boolean) => void;
}

export default function ElementSelectorModal({ space, showModal, fileUrl, xPath, onInput, setShowModal }: Props) {
  useEffect(() => {
    function receiveMessage(event: any) {
      if (event.data.xpath) setShowModal(false);
      onInput && onInput(event.data.xpath);
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
      <FullScreenModal open={true} onClose={() => setShowModal(false)} title={'Element Selector'}>
        <div id="iframe-container" style={{ height: '93vh' }}>
          <iframe id="iframe" src={fileUrl}></iframe>
        </div>
      </FullScreenModal>
    </div>
  );
}
