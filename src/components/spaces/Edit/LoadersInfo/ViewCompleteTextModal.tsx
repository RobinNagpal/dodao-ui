import FullPageModal from '@/components/core/modals/FullPageModal';
import { ArticleIndexingInfoFragment, ScrapedUrlInfoFragmentFragment } from '@/graphql/generated/generated-types';
import React from 'react';

export interface ViewCompleteTextModalProps {
  open: boolean;
  indexingInfo?: ScrapedUrlInfoFragmentFragment | ArticleIndexingInfoFragment;
  onClose: () => void;
}
export default function ViewCompleteTextModal({ open, onClose, indexingInfo }: ViewCompleteTextModalProps) {
  return (
    <FullPageModal open={open} onClose={onClose} title={'Complete Text'}>
      <div className="text-justify p-4">{indexingInfo?.text}</div>
    </FullPageModal>
  );
}
