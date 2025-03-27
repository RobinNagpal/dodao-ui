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
  const [showManangementModal, setShowManangementModal] = useState(false);
  const [managementDiscussionContent, setManagementDiscussionContent] = useState('');
  const renderer = getMarkedRenderer();
  const getMarkdownContent = (content?: string) => {
    return content ? marked.parse(content, { renderer }) : 'No Information';
  };

  const {
    data: managementDiscussionData,
    postData: regenerateManamentDiscussion,
    loading: managementDiscussionLoading,
    error: managementDiscussionError,
  } = usePostData<string, {}>({
    errorMessage: 'Failed to regenerate management discussion',
    successMessage: 'Management Discussion regeneration started successfully',
    redirectPath: ``,
  });

  useEffect(() => {
    if (managementDiscussionData) {
      setManagementDiscussionContent(managementDiscussionData);
    } else if (managementDiscussionError) {
      setManagementDiscussionContent(managementDiscussionError);
    }
  }, [managementDiscussionData, managementDiscussionError]);

  const handleRegenerateManagementDiscussion = async (criterionKey: string) => {
    await regenerateManamentDiscussion(
      `${getBaseUrl()}/api/actions/tickers/${tickerKey}/criterion/${criterionKey}/criteria-matching-for-management-discussion`
    );
  };

  return (
    <div>
      <Button primary onClick={() => setShowManangementModal(true)}>
        Management Discussion
      </Button>
      <FullPageModal open={showManangementModal} onClose={() => setShowManangementModal(false)} title={''}>
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
          <hr className="m-5" />
          <div className="h-full w-full">
            {managementDiscussionContent ? (
              <div
                className="markdown-body text-md text-left py-10 px-5"
                dangerouslySetInnerHTML={{
                  __html: getMarkdownContent(managementDiscussionContent),
                }}
              />
            ) : managementDiscussionError ? (
              <div className="text-red-500">{managementDiscussionError}</div>
            ) : (
              <div className="flex items-center justify-center my-40 text-gray-500">
                Extracted content from Management Discussion section, based on the Matching Instructions will be shown here.
              </div>
            )}
          </div>
        </div>
      </FullPageModal>
    </div>
  );
}
