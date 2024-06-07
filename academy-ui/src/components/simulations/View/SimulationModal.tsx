import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
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

  function handleIframeLoaded() {
    try {
      if (iframeRef.current?.contentWindow?.location.href && iframeRef.current.contentWindow.location.href.indexOf('/simulation/close-iframe') > 0) {
        onClose();
      }
    } catch (e) {}
  }
  return (
    <FullScreenModal open={open} onClose={onClose} title={title}>
      <Iframe src={iframeUrl} id={iframeId} allowFullScreen onLoad={handleIframeLoaded} ref={iframeRef} />
    </FullScreenModal>
  );
}

export default SimulationModal;
