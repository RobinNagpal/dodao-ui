'use client';

import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { SecFilingAttachment } from '@prisma/client';
import { useState } from 'react';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { CriterionMatchResponse, GetSingleCriteriaMatchingRequest } from '@/types/public-equity/ticker-request-response';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import Button from '@dodao/web-core/components/core/buttons/Button';

export interface AttachmentTableActionsProps {
  tickerKey: string;
  attachment: SecFilingAttachment;
}
export default function AttachementTableActions({ tickerKey, attachment }: AttachmentTableActionsProps) {
  const [showModal, setShowModal] = useState(false);

  const { data, loading, postData, error } = usePostData<CriterionMatchResponse, GetSingleCriteriaMatchingRequest>({
    errorMessage: 'Failed to get criteria matching',
  });

  const renderer = getMarkedRenderer();
  const getMarkdownContent = (content?: string) => {
    return content ? marked.parse(content, { renderer }) : 'No Information';
  };

  const handleRegenerateMatchingCriteria = async () => {
    await postData(`${getBaseUrl()}/api/actions/tickers/${tickerKey}/sec-filings/criteria-matching-for-an-attachment`, {
      sequenceNumber: attachment.sequenceNumber,
    });
  };

  return (
    <div>
      <IconButton onClick={() => setShowModal(true)} iconName={IconTypes.Edit} removeBorder={true} />
      <FullPageModal open={showModal} onClose={() => setShowModal(false)} title={''}>
        <div className="min-h-[70vh]">
          <div className="flex justify-around items-center">
            <div>Sequence # {attachment.sequenceNumber}</div>
            <div>{attachment.purpose ?? attachment.description}</div>
            <Button loading={loading} primary variant="contained" onClick={handleRegenerateMatchingCriteria} disabled={loading}>
              Process Criteria Matching
            </Button>
          </div>
          <div>{error && <div className="text-red-500">{error}</div>}</div>
          <hr className="m-5" />
          <div className="h-full w-full">
            <div
              className="markdown-body text-md text-left py-10 px-5"
              dangerouslySetInnerHTML={{
                __html: getMarkdownContent(data?.criterion_matches.map((match) => `## ${match.criterion_key}\n\n${match.relevant_text}`).join('\n\n')),
              }}
            />
          </div>
        </div>
      </FullPageModal>
    </div>
  );
}
