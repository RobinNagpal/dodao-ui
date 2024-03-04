import FullPageModal from '@/components/core/modals/FullPageModal';
import { useArticleIndexingInfoQuery } from '@/graphql/generated/generated-types';
import React from 'react';

interface IndexingInfo {
  spaceId: string;
  articleIndexingInfoId: string;
}

export interface ViewCompleteTextModalProps {
  open: boolean;
  indexingInfo?: IndexingInfo;
  onClose: () => void;
}
export default function ViewCompleteTextModal({ open, onClose, indexingInfo }: ViewCompleteTextModalProps) {
  const { data, loading } = useArticleIndexingInfoQuery({
    variables: {
      spaceId: indexingInfo?.spaceId || '',
      articleIndexingInfoId: indexingInfo?.articleIndexingInfoId || '',
    },
  });

  return (
    <FullPageModal open={open} onClose={onClose} title={'Complete Text'}>
      {loading && <div>Loading...</div>}
      <div className="text-justify p-4">{data && data.articleIndexingInfo.text}</div>
    </FullPageModal>
  );
}
