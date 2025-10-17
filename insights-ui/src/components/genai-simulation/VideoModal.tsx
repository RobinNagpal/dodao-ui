'use client';
import { useEffect, useRef } from 'react';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoModal({ isOpen, onClose }: VideoModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Convert Google Drive share URL to embeddable URL
  const videoUrl = 'https://drive.google.com/file/d/1RRRRLBXn0k3WTgT1CXnD6oVnhnH44rmw/preview';

  useEffect(() => {
    if (isOpen && iframeRef.current) {
      // Reset the iframe src to restart the video when modal opens
      iframeRef.current.src = videoUrl;
    }
  }, [isOpen, videoUrl]);

  const handleClose = () => {
    // Stop the video by clearing the iframe src
    if (iframeRef.current) {
      iframeRef.current.src = '';
    }
    onClose();
  };

  return (
    <FullScreenModal open={isOpen} onClose={handleClose} title="GenAI Business Simulations Demo" showCloseButton={true} showTitleBg={true}>
      <div className="w-full h-full" style={{ height: 'calc(100vh - 65px)' }}>
        <iframe
          ref={iframeRef}
          src={videoUrl}
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
          style={{
            border: 'none',
          }}
          title="GenAI Business Simulations Demo Video"
        />
      </div>
    </FullScreenModal>
  );
}
