import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
export interface PDFViewModalProps {
  onClose: () => void;
  title: string;
  pdfUrl: string;
}

export const PDFViewModal = ({ onClose, title, pdfUrl }: PDFViewModalProps) => {
  return (
    <FullScreenModal open={true} onClose={onClose} title={title}>
      <iframe src={pdfUrl} className="w-full h-screen" allowFullScreen={true}></iframe>
    </FullScreenModal>
  );
};
