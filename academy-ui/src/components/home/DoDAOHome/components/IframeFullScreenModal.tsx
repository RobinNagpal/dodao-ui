import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
export interface IframeViewModalProps {
  onClose: () => void;
  title: string;
  src: string;
}

export const IframeViewModal = ({ onClose, title, src }: IframeViewModalProps) => {
  return (
    <FullScreenModal open={true} onClose={onClose} title={title}>
      <iframe src={src} className="w-full h-screen" allowFullScreen={true}></iframe>
    </FullScreenModal>
  );
};
