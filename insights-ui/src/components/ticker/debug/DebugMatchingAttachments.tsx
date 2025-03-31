import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import { FullNestedTickerReport, ProcessingStatus } from '@/types/public-equity/ticker-report-types';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import Accordion from '@dodao/web-core/utils/accordion/Accordion';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import { useState } from 'react';
import ManagementDiscussionButton from './ManagementDiscussionButton';
import Button from '@dodao/web-core/components/core/buttons/Button';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';

export interface DebugMatchingAttachmentsProps {
  report: FullNestedTickerReport;
  industryGroupCriteria: IndustryGroupCriteriaDefinition;
  onPostUpdate: () => Promise<void>;
}

export default function DebugMatchingAttachments({ report, onPostUpdate }: DebugMatchingAttachmentsProps) {
  const ticker = report.tickerKey;

  const [selectedCriterionAccordian, setSelectedCriterionAccordian] = useState<string | null>(null);
  const renderer = getMarkedRenderer();
  const getMarkdownContent = (content?: string) => {
    return content ? marked.parse(content, { renderer }) : 'No Matched Content';
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const {
    postData: regenerateMatchingCriteria,
    loading: matchingCriteriaLoading,
    error: matchingCriteriaError,
  } = usePostData<{ message: string }, {}>({
    errorMessage: 'Failed to regenerate matching criteria',
    successMessage: 'Matching criteria regeneration started successfully',
    redirectPath: ``,
  });

  const handleRegenerateMatchingCriteria = async () => {
    await regenerateMatchingCriteria(`${getBaseUrl()}/api/actions/tickers/${ticker}/trigger-criteria-matching`);
    await onPostUpdate();
  };

  return (
    <div className="mt-8">
      {matchingCriteriaError && <div className="text-red-500">{matchingCriteriaError}</div>}
      <PrivateWrapper>
        <div className="flex justify-end mb-4">
          <Button
            loading={matchingCriteriaLoading || report.criteriaMatchesOfLatest10Q?.status === ProcessingStatus.InProgress}
            primary
            variant="contained"
            onClick={() => setShowConfirmModal(true)}
            disabled={matchingCriteriaLoading}
          >
            Regenerate Matching Criteria
          </Button>
        </div>
      </PrivateWrapper>
      <h1 className="mb-8 font-bold text-xl">Matching Attachments</h1>
      {report.criteriaMatchesOfLatest10Q?.criterionMatches?.map((criterion) => {
        return (
          <div key={criterion.criterionKey}>
            <div className="flex justify-end my-5">
              <PrivateWrapper>
                <ManagementDiscussionButton tickerKey={ticker} criterionKey={criterion.criterionKey} />
              </PrivateWrapper>
            </div>
            <Accordion
              label={criterion.criterionKey}
              isOpen={selectedCriterionAccordian === `attachments_${criterion.criterionKey}`}
              onClick={() =>
                setSelectedCriterionAccordian(
                  selectedCriterionAccordian === `attachments_${criterion.criterionKey}` ? null : `attachments_${criterion.criterionKey}`
                )
              }
            >
              <div className="mt-4">
                <div className="markdown-body text-md" dangerouslySetInnerHTML={{ __html: getMarkdownContent(criterion.matchedContent) }} />
              </div>
            </Accordion>
          </div>
        );
      })}
      {showConfirmModal && (
        <ConfirmationModal
          open={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={async () => {
            await handleRegenerateMatchingCriteria();
            setShowConfirmModal(false);
          }}
          title="Regenerate Matching Criteria"
          confirmationText="Are you sure you want to regenerate the matching criteria?"
          askForTextInput={true}
          confirming={matchingCriteriaLoading}
        />
      )}
    </div>
  );
}
