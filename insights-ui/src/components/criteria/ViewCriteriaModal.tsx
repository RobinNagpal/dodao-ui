import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';

// react-json-view touches `document` at module scope, so it must never be evaluated during SSR.
const ReactJson = dynamic(() => import('react-json-view'), { ssr: false });

export interface ViewCriteriaModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

export default function ViewCriteriaModal({ open, onClose, title, url }: ViewCriteriaModalProps) {
  const [selectedCriterion, setSelectedCriterion] = React.useState<object | null>(null);

  const fetchCriteria = async (url: string) => {
    try {
      const response = await fetch(url, { cache: 'no-cache' });
      const data = await response.json();
      setSelectedCriterion(data);
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
      <ReactJson src={selectedCriterion || {}} theme="monokai" enableClipboard={true} style={{ textAlign: 'left', height: '90vh' }} />
    </FullPageModal>
  );
}
