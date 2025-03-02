import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import React, { useEffect } from 'react';
import ReactJson from 'react-json-view';

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
      const response = await fetch(url);
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
  }, [url]);
  return (
    <FullPageModal open={open} onClose={onClose} title={title}>
      <ReactJson src={selectedCriterion || {}} theme="monokai" enableClipboard={true} style={{ textAlign: 'left', height: '90vh' }} />
    </FullPageModal>
  );
}
