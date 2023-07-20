import FullScreenModal from '@/components/core/modals/FullScreenModal';
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

interface SimulationModalProps {
  title: string;
  iframeId: string;
  iframeUrl: string;
  open: boolean;
  onClose: () => void;
}

const Iframe = styled.iframe`
  width: 100%;
  background: #000;
  border: none;
  min-height: calc(100vh - 100px);
`;

function SimulationModal({ iframeId, iframeUrl, open, onClose, title }: SimulationModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function handleIframeLoaded() {
      if (iframeRef.current?.contentWindow?.location.href && iframeRef.current.contentWindow.location.href.indexOf('/simulation/close-iframe') > 0) {
        onClose();
      }
    }

    // Check if the iframe is initialized
    if (iframeRef.current) {
      iframeRef.current.addEventListener('load', handleIframeLoaded);

      // Remove the event listener when the component is unmounted or before the next render
      return () => {
        iframeRef.current?.removeEventListener('load', handleIframeLoaded);
      };
    }
  }, [onClose, iframeRef.current]); // Add iframeRef.current to the dependency array
  return (
    <FullScreenModal open={open} onClose={onClose} title={title}>
      <Iframe src={iframeUrl} id={iframeId} allowFullScreen ref={iframeRef} />
    </FullScreenModal>
  );
}

export default SimulationModal;
