import Modal from '@/components/app/Modal';
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

interface SimulationModalProps {
  iframeId: string;
  iframeUrl: string;
  open: boolean;
  onClose: () => void;
}

const Header = styled.h3`
  /* Add header styles here */
`;

const Iframe = styled.iframe`
  width: 100%;
  background: #000;
  border: none;
  min-height: calc(100vh - 100px);
`;

function SimulationModal({ iframeId, iframeUrl, open, onClose }: SimulationModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function handleIframeLoaded() {
      if (iframeRef.current?.contentWindow?.location.href && iframeRef.current.contentWindow.location.href.indexOf('/simulation/close-iframe') > 0) {
        onClose();
      }
    }

    const iframeElement = iframeRef.current;
    iframeElement?.addEventListener('load', handleIframeLoaded);

    return () => {
      iframeElement?.removeEventListener('load', handleIframeLoaded);
    };
  }, [onClose]);

  return (
    <Modal open={open} onClose={onClose} shellClass="simulation-iframe-shell-max">
      <div className="border-b pt-3 pb-2 text-center">
        <Header>Simulation</Header>
      </div>
      <Iframe src={iframeUrl} id={iframeId} allowFullScreen ref={iframeRef} />
    </Modal>
  );
}

export default SimulationModal;
