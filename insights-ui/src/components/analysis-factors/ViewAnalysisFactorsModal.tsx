import { UpsertAnalysisFactorsRequest } from '@/types/public-equity/analysis-factors-types';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import React from 'react';
import dynamic from 'next/dynamic';

// react-json-view touches `document` at module scope, so it must never be evaluated during SSR.
const ReactJson = dynamic(() => import('react-json-view'), { ssr: false });

export interface ViewAnalysisFactorsModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  analysisFactors: UpsertAnalysisFactorsRequest;
}

export default function ViewAnalysisFactorsModal({ open, onClose, title, analysisFactors }: ViewAnalysisFactorsModalProps) {
  return (
    <FullPageModal open={open} onClose={onClose} title={title}>
      <ReactJson src={analysisFactors || {}} theme="monokai" enableClipboard={true} style={{ textAlign: 'left', height: '90vh' }} />
    </FullPageModal>
  );
}
