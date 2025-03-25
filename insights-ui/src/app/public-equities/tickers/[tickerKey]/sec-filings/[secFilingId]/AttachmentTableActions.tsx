'use client';

import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { SecFilingAttachment } from '@prisma/client';
import { useState, useEffect } from 'react';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { CriterionMatchResponse, CriterionMatchTextItem, GetSingleCriteriaMatchingRequest } from '@/types/public-equity/ticker-request-response';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import Button from '@dodao/web-core/components/core/buttons/Button';

export interface AttachmentTableActionsProps {
  tickerKey: string;
  attachment: SecFilingAttachment;
}
export default function AttachementTableActions({ tickerKey, attachment }: AttachmentTableActionsProps) {
  const [showModal, setShowModal] = useState(false);
  const [attachmentContent, setAttachmentContent] = useState<CriterionMatchResponse | null>(null);

  const { data, loading, postData, error } = usePostData<CriterionMatchResponse, GetSingleCriteriaMatchingRequest>({
    errorMessage: 'Failed to get criteria matching',
  });

  useEffect(() => {
    if (data) {
      setAttachmentContent(data);
    } else if (error) {
      setAttachmentContent({
        status: 'failure',
        criterion_matches: [] as CriterionMatchTextItem[],
        failureReason: error,
      });
    }
  }, [data, error]);

  const renderer = getMarkedRenderer();

  const getContentFromResponse = (response: CriterionMatchResponse): string => {
    if (response.status === 'failure') {
      return response.failureReason || 'No information available';
    }
    if (response.criterion_matches && response.criterion_matches.length > 0) {
      return response.criterion_matches.map((match) => `## ${match.criterion_key}\n\n${match.relevant_text}`).join('\n\n');
    }
    return 'No matching text found.';
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
          <hr className="m-5" />
          <div className="h-full w-full">
            {attachmentContent ? (
              <div
                className="markdown-body text-md text-left py-10 px-5"
                dangerouslySetInnerHTML={{
                  __html: marked.parse(getContentFromResponse(attachmentContent), { renderer }),
                }}
              />
            ) : error ? (
              <div>{error}</div>
            ) : (
              <div className="flex items-center justify-center my-40 text-gray-500">
                Extracted content from attachment based on the Matching Instructions will be shown here.
              </div>
            )}
          </div>
        </div>
      </FullPageModal>
    </div>
  );
}
