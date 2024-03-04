import FullPageModal from '@/components/core/modals/FullPageModal';
import { useScrapedUrlInfoQuery } from '@/graphql/generated/generated-types';
import React from 'react';

interface IndexingInfo {
  spaceId: string;
  scrapedUrlInfoId: string;
}

export interface ViewCompleteTextModalProps {
  open: boolean;
  indexingInfo?: IndexingInfo;
  onClose: () => void;
}
export default function ViewCompleteWebsiteTextModal({ open, onClose, indexingInfo }: ViewCompleteTextModalProps) {
  const { data, loading } = useScrapedUrlInfoQuery({
    variables: {
      spaceId: indexingInfo?.spaceId || '',
      scrapedUrlInfoId: indexingInfo?.scrapedUrlInfoId || '',
    },
  });
  return (
    <FullPageModal open={open} onClose={onClose} title={'Complete Text'}>
      {loading && <div>Loading...</div>}
      <div className="text-justify p-4">{data && data.scrapedUrlInfo.text}</div>
    </FullPageModal>
  );
}
