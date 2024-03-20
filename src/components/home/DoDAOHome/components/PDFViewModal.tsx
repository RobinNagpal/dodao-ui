import FullScreenModal from '@/components/core/modals/FullScreenModal';
export interface PDFViewModalProps {
  onClose: () => void;
}

export const PDFViewModal = ({ onClose }: PDFViewModalProps) => {
  return (
    <FullScreenModal open={true} onClose={onClose} title={'Blockchain BootCamp'}>
      <iframe src={'https://dodao-prod-public-assets.s3.amazonaws.com/dodao-io/bootcamp_pdf.pdf'} className="w-full h-screen" allowFullScreen={true}></iframe>
    </FullScreenModal>
  );
};
