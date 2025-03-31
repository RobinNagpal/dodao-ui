import { CriterionDefinition } from '@/types/public-equity/criteria-types';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import React from 'react';
import ReactJson from 'react-json-view';

export interface ViewCriterionModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  criterion: CriterionDefinition;
}

export default function ViewCriterionModal({ open, onClose, title, criterion }: ViewCriterionModalProps) {
  return (
    <FullPageModal open={open} onClose={onClose} title={title}>
      <ReactJson src={criterion || {}} theme="monokai" enableClipboard={true} style={{ textAlign: 'left', height: '90vh' }} />
    </FullPageModal>
  );
}
