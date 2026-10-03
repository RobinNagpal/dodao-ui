import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';

// react-json-view touches `document` at module scope, so it must never be evaluated during SSR.
const ReactJson = dynamic(() => import('react-json-view'), { ssr: false });

export interface ViewTickerReportJsonModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

export default function ViewTickerReportJsonModal({ open, onClose, title, url }: ViewTickerReportJsonModalProps) {
  const [selectedTickerReport, setSelectedTickerReport] = React.useState<object | null>(null);

  const fetchCriteria = async (url: string) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      setSelectedTickerReport(data);
    } catch (err) {
      console.error('Failed to fetch criteria data.', err);
    }
  };
  useEffect(() => {
    if (open) {
      fetchCriteria(url);
    }
  }, [url, open]);
  return (
    <FullPageModal open={open} onClose={onClose} title={title}>
      <ReactJson src={selectedTickerReport || {}} theme="monokai" enableClipboard={true} style={{ textAlign: 'left', height: '90vh' }} />
    </FullPageModal>
  );
}
