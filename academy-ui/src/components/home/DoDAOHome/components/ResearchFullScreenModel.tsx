import useWindowDimensions from '@/hooks/useWindowDimensions';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';

export interface IframeViewModalProps {
  onClose: () => void;
  title: string;
  src: string;
}

export const ResearchIframeViewModal = ({ onClose, title, src }: IframeViewModalProps) => {
  const { height } = useWindowDimensions();
  const titleHeight = 52;
  const iframeHeight = height - titleHeight;

  return (
    <FullScreenModal open={true} onClose={onClose} title={title}>
      <iframe src={src} className="w-full" style={{ height: `${iframeHeight}px` }} allowFullScreen></iframe>
    </FullScreenModal>
  );
};
