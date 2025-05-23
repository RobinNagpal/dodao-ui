import MarkdownEditor from '@/components/Markdown/MarkdownEditor';
import { SaveLatest10QFinancialStatementsRequest } from '@/types/public-equity/ticker-request-response';
import { parseMarkdown } from '@/util/parse-markdown';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';

export interface FinancialStatementsButtonProps {
  tickerKey: string;
  financialStatementsContent?: string;
  onPostUpdate: () => Promise<void>;
}

export default function FinancialStatementsButton({
  tickerKey,
  financialStatementsContent: financialStatementsContentRaw,
  onPostUpdate,
}: FinancialStatementsButtonProps) {
  const [showFinancialStatementsModal, setShowFinancialStatementsModal] = useState(false);
  const [financialStatementsContent, setFinancialStatementsContent] = useState(financialStatementsContentRaw);
  const [showPreview, setShowPreview] = useState(false);
  const getMarkdownContent = (content?: string) => {
    return content ? parseMarkdown(content) : 'No Information';
  };

  const {
    postData: saveFinancialStatements,
    loading: financialStatementsLoading,
    error: financialStatementsError,
  } = usePostData<string, SaveLatest10QFinancialStatementsRequest>({
    errorMessage: 'Failed to save financial statements',
    successMessage: 'Financial Statements saved successfully',
    redirectPath: ``,
  });

  const handleSaveFinancialStatements = async () => {
    await saveFinancialStatements(`${getBaseUrl()}/api/tickers/${tickerKey}/financial-statements`, {
      latest10QFinancialStatements: financialStatementsContent ?? '',
    });
    await onPostUpdate();
  };

  return (
    <div>
      <div className="flex justify-end">
        <Button primary onClick={() => setShowFinancialStatementsModal(true)}>
          Upsert Statements
        </Button>
      </div>
      <FullPageModal open={showFinancialStatementsModal} onClose={() => setShowFinancialStatementsModal(false)} title={''}>
        <div className="min-h-[70vh]">
          <div className="flex justify-around items-center">
            <div>Financial Statements</div>
            <Button primary onClick={() => setShowPreview(!showPreview)}>
              {showPreview ? 'Editor' : 'Preview'}
            </Button>
            <Button
              loading={financialStatementsLoading}
              primary
              variant="contained"
              onClick={() => handleSaveFinancialStatements()}
              disabled={financialStatementsLoading}
            >
              Save Financial Statements
            </Button>
          </div>
          <div>{financialStatementsError && <div className="text-red-500">{financialStatementsError}</div>}</div>
          <hr className="m-5" />
          <div className="max-h-[80vh] w-full text-left">
            {showPreview ? (
              <div className="p-5 h-full">
                <div className="markdown-body text-md" dangerouslySetInnerHTML={{ __html: getMarkdownContent(financialStatementsContent) }} />
              </div>
            ) : (
              <div className="p-5">
                <MarkdownEditor
                  label={``}
                  modelValue={financialStatementsContent}
                  placeholder="Event content"
                  onUpdate={(value) => setFinancialStatementsContent(value || '')}
                  objectId={'financial-statements'}
                  maxHeight={'70vh'}
                  className="mt-4"
                />
              </div>
            )}
          </div>
        </div>
      </FullPageModal>
    </div>
  );
}
