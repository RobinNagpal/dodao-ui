import Button from '@dodao/web-core/components/core/buttons/Button';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import { useEffect, useState } from 'react';

export interface ManagementDiscussionButtonProps {
  tickerKey: string;
  criterionKey: string;
}

export default function ManagementDiscussionButton({ tickerKey, criterionKey }: ManagementDiscussionButtonProps) {
  const [showManagementModal, setShowManagementModal] = useState(false);

  const renderer = getMarkedRenderer();
  const getMarkdownContent = (content?: string) => {
    return content ? marked.parse(content, { renderer }) : 'No Information';
  };

  const {
    data: updatedManagementDiscussion,
    postData: regenerateManagementDiscussion,
    loading: managementDiscussionLoading,
    error: managementDiscussionError,
  } = usePostData<string, {}>({
    errorMessage: 'Failed to regenerate management discussion',
    redirectPath: ``,
  });

  const handleRegenerateManagementDiscussion = async (criterionKey: string) => {
    await regenerateManagementDiscussion(
      `${getBaseUrl()}/api/actions/tickers/${tickerKey}/criterion/${criterionKey}/criteria-matching-for-management-discussion`
    );
  };

  return (
    <div>
      <Button primary onClick={() => setShowManagementModal(true)}>
        Management Discussion
      </Button>
      <FullPageModal open={showManagementModal} onClose={() => setShowManagementModal(false)} title={''}>
        <div className="min-h-[70vh]">
          <div className="flex justify-around items-center">
            <div>Management Discussion Criteria Matching</div>
            <div>Criterion : {criterionKey}</div>
            <Button
              loading={managementDiscussionLoading}
              primary
              variant="contained"
              onClick={() => handleRegenerateManagementDiscussion(criterionKey)}
              disabled={managementDiscussionLoading}
            >
              Process Criteria Matching
            </Button>
          </div>
          <div>{managementDiscussionError && <div className="text-red-500">{managementDiscussionError}</div>}</div>
          <hr className="m-5" />
          <div className="h-full w-full">
            <div
              className="markdown-body text-md text-left py-10 px-5"
              dangerouslySetInnerHTML={{
                __html: getMarkdownContent(updatedManagementDiscussion),
              }}
            />
          </div>
        </div>
      </FullPageModal>
    </div>
  );
}
