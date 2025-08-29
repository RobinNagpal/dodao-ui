'use client';

import useWindowDimensions from '@/hooks/useWindowDimensions';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';

interface CanvaViewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  src: string;
}

export default function CanvaViewModal({ open, onClose, title, src }: CanvaViewModalProps) {
  const { height } = useWindowDimensions();
  const titleHeight = 52;
  const iframeHeight = height - titleHeight;

  return (
    <FullScreenModal open={true} onClose={onClose} title={title}>
      <iframe src={src} className="w-full" style={{ height: `${iframeHeight}px` }} allowFullScreen></iframe>
    </FullScreenModal>
  );
}
