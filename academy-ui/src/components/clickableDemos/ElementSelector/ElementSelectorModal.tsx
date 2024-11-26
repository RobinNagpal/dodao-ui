import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import React, { CSSProperties, useEffect } from 'react';

interface Props {
  space: SpaceWithIntegrationsDto;
  showModal: boolean;
  objectId: string;
  fileUrl: string;
  xPath: string;
  onInput: (imageUrl: string) => void;
  setShowModal: (showModal: boolean) => void;
}

export default function ElementSelectorModal({ space, showModal, fileUrl, xPath, onInput, setShowModal }: Props) {
  async function receiveMessage(event: any) {
    console.log('Received message from element section iframe ', event);
    if (event.data.type === 'elementSelected') {
      const selectedElementXPath = event.data.xpath;
      onInput(selectedElementXPath);
    }
  }

  useEffect(() => {
    window.addEventListener('message', receiveMessage);
    return () => {
      window.removeEventListener('message', receiveMessage);
    };
  }, []);

  const parentStyles = window.getComputedStyle(document.body);
  // Collect CSS variables
  const cssVariables = [
    '--primary-color',
    '--primary-text-color',
    '--bg-color',
    '--text-color',
    '--link-color',
    '--heading-color',
    '--border-color',
    '--block-bg',
  ];

  const cssValues: any = {};
  cssVariables.forEach((variable) => {
    cssValues[variable] = parentStyles.getPropertyValue(variable);
  });

  const data = {
    cssValues,
    buttonColor: space?.themeColors?.primaryColor,
    buttonTextColor: space?.themeColors?.textColor,
    hoverColor: space?.themeColors?.bgColor,
    selectedColor: space?.themeColors?.primaryColor,
    xpath: xPath,
    mode: 'elementSelection',
  };

  const handleLoad = async () => {
    const iframe = document.getElementById('element-selection-iframe') as HTMLIFrameElement;
    iframe.contentWindow!.postMessage(
      {
        type: 'elementSelector',
        xpath: xPath,
      },
      '*'
    );
  };

  const styles: CSSProperties = {
    width: '100vw',
    height: '100%',
    minHeight: '93vh',
    border: 'none',
    position: 'absolute',
    left: '0',
    top: '0',
    opacity: 1,
    transition: 'opacity 0.5s ease-in-out',
  };

  return (
    <div>
      <FullScreenModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
        }}
        title={'Element Selector'}
      >
        <div id="iframe-container" style={{ height: '93vh' }}>
          <iframe id="element-selection-iframe" src={fileUrl} name={JSON.stringify(data)} onLoad={handleLoad} style={styles} />
        </div>
      </FullScreenModal>
    </div>
  );
}
