import FullPageModal from '@/components/core/modals/FullPageModal';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
export interface PDFViewModalProps {
  onClose: () => void;
}

export const PDFViewModal = ({ onClose }: PDFViewModalProps) => {
  return (
    <FullPageModal open={true} onClose={onClose} title={'Blockchain BootCamp'}>
      <iframe src={"https://www.clickdimensions.com/links/TestPDFfile.pdf"}></iframe>
    </FullPageModal>
  );
};
