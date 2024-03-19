import FullScreenModal from '@/components/core/modals/FullScreenModal';
export interface PDFViewModalProps {
  onClose: () => void;
}

export const PDFViewModal = ({ onClose }: PDFViewModalProps) => {
  const pdfPath = 'public/blockchain_pdf.pdf';
  return (
    <FullScreenModal open={true} onClose={onClose} title={'Blockchain BootCamp'}>
      <iframe src={pdfPath} className="w-full h-full"></iframe>
    </FullScreenModal>
  );
};
