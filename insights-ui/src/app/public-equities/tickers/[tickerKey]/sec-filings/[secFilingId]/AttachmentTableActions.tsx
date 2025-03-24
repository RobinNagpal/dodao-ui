'use client';

import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { SecFilingAttachment } from '@prisma/client';
import { useState, useEffect } from 'react';
import { IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { GetSingleCriteriaMatchingRequest } from '@/types/public-equity/ticker-request-response';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { marked } from 'marked';

export interface AttachmentTableActionsProps {
  tickerKey: string;
  attachment: SecFilingAttachment;
  industryGroupCriteria: IndustryGroupCriteriaDefinition;
}
export default function AttachementTableActions({ tickerKey, attachment, industryGroupCriteria }: AttachmentTableActionsProps) {
  const [showModal, setShowModal] = useState(false);
  const [attachmentContent, setAttachmentContent] = useState('');
  const [criterionKey, setCriterionKey] = useState('');

  const { data, loading, postData, error } = usePostData<string, GetSingleCriteriaMatchingRequest>({
    errorMessage: 'Failed to get criteria matching',
  });

  useEffect(() => {
    if (data) {
      setAttachmentContent(data);
    } else if (error) {
      setAttachmentContent(error);
    }
  }, [data, error]);

  const renderer = getMarkedRenderer();

  const getMarkdownContent = (content?: string) => {
    return content ? marked.parse(content, { renderer }) : 'No Information';
  };

  const handleRegenerateMatchingCriteria = async () => {
    if (!criterionKey.trim()) {
      setAttachmentContent('Please select the criterion key from the dropdown');
      return;
    }
    await postData(`${getBaseUrl()}/api/actions/tickers/${tickerKey}/sec-filings/single-criteria-matching`, {
      criterionKey: criterionKey || '',
      sequenceNumber: attachment.sequenceNumber,
    });
    // setAttachmentContent(response ?? error ?? '');
  };

  return (
    <div>
      <IconButton onClick={() => setShowModal(true)} iconName={IconTypes.Edit} removeBorder={true} />
      <FullPageModal open={showModal} onClose={() => setShowModal(false)} title={''}>
        <div className="min-h-[70vh]">
          <div className="flex justify-around items-center">
            <div>Sequence # {attachment.sequenceNumber}</div>
            <div>{attachment.purpose ?? attachment.description}</div>
            <div className="min-w-[200px]">
              <select value={criterionKey} onChange={(e) => setCriterionKey(e.target.value)} className="rounded border p-1 text-black w-full" required>
                <option value="">Select a criterion</option>
                <option value="all">all</option>
                {industryGroupCriteria.criteria.map((criterion) => (
                  <option key={criterion.key} value={criterion.key}>
                    {criterion.key}
                  </option>
                ))}
              </select>
            </div>
            <Button disabled={loading} loading={loading} primary variant={'contained'} onClick={handleRegenerateMatchingCriteria}>
              Process Criteria Matching
            </Button>
          </div>
          <hr className="m-5"></hr>
          <div className="h-full w-full">
            {attachmentContent ? (
              <div className="markdown-body text-md text-left py-10 px-5" dangerouslySetInnerHTML={{ __html: getMarkdownContent(attachmentContent) }} />
            ) : (
              <div className="my-40 text-gray-500">Extracted content from attachment based on the Matching Instructions will be shown here.</div>
            )}
          </div>
        </div>
      </FullPageModal>
    </div>
  );
}
