import { GetAnalysisFactorsResponse } from '@/types/public-equity/analysis-factors-types';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import React from 'react';
import ReactJson from 'react-json-view';

export interface ViewAnalysisFactorsModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  analysisFactors: GetAnalysisFactorsResponse;
}

export default function ViewAnalysisFactorsModal({ open, onClose, title, analysisFactors }: ViewAnalysisFactorsModalProps) {
  return (
    <FullPageModal open={open} onClose={onClose} title={title}>
      <ReactJson src={analysisFactors || {}} theme="monokai" enableClipboard={true} style={{ textAlign: 'left', height: '90vh' }} />
    </FullPageModal>
  );
}
