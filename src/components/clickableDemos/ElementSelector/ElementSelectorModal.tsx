import React, { useEffect } from 'react';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { Space } from '@/graphql/generated/generated-types';

interface Props {
  space: Space;
  showModal: boolean;
  fileUrl: string;
  onLoading?: (loading: boolean) => void;
  onInput?: (imageUrl: string) => void;
  setShowModal: (showModal: boolean) => void;
}

export default function ElementSelectorModal({ space, showModal, fileUrl, onInput, setShowModal }: Props) {
  useEffect(() => {
    function receiveMessage(event: any) {
      if (event.data.xpath) setShowModal(false);
      onInput && onInput(event.data.xpath);
    }

    const handleLoad = (iframe: HTMLIFrameElement) => {
      if (!iframe) return;

      iframe.contentWindow!.postMessage(
        {
          type: 'elementSelector',
          buttonColor: space?.themeColors?.primaryColor,
          buttonTextColor: space?.themeColors?.textColor,
          hoverColor: space?.themeColors?.bgColor,
          selectedColor: space?.themeColors?.primaryColor,
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
