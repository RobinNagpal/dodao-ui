import { TickerReport } from '@/types/public-equity/ticker-report-types';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { Spinner } from '@dodao/web-core/components/core/icons/Spinner';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import Accordion from '@dodao/web-core/utils/accordion/Accordion';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import { useState } from 'react';

export interface DebugMatchingAttachmentsProps {
  report: TickerReport;
}

export default function DebugMatchingAttachments({ report }: DebugMatchingAttachmentsProps) {
  const ticker = report.ticker;

  const [selectedCriterionAccordian, setSelectedCriterionAccordian] = useState<string | null>(null);
  const renderer = getMarkedRenderer();
  const getMarkdownContent = (content?: string) => {
    return content ? marked.parse(content, { renderer }) : 'No Information';
  };

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
    regenerateMatchingCriteria(`${getBaseUrl()}/api/actions/tickers/${ticker}/trigger-criteria-matching`);
  };

  return (
    <div className="mt-8">
      {matchingCriteriaError && <div className="text-red-500">{matchingCriteriaError}</div>}
      <div className="flex justify-end mb-4">
        <Button disabled={matchingCriteriaLoading} loading={matchingCriteriaLoading} primary variant={'contained'} onClick={handleRegenerateMatchingCriteria}>
          Regenerate Matching Criteria
        </Button>
      </div>
      <h1 className="mb-8 font-bold text-xl">Matching Attachments</h1>
      {report.criteriaMatchesOfLatest10Q?.criterionMatches?.map((criterion) => {
        return (
          <Accordion
            key={criterion.criterionKey}
            label={criterion.criterionKey}
            isOpen={selectedCriterionAccordian === `attachments_${criterion.criterionKey}`}
            onClick={() =>
              setSelectedCriterionAccordian(
                selectedCriterionAccordian === `attachments_${criterion.criterionKey}` ? null : `attachments_${criterion.criterionKey}`
              )
            }
          >
            <div key={criterion.criterionKey} className="mt-8">
              <div>
                <h3>Matching Attachments</h3>
                {criterion.matchedAttachments.map((attachment) => {
                  return (
                    <table key={attachment.attachmentSequenceNumber} className="border-2 w-full mt-2">
                      <thead>
                        <tr>
                          <th className="border-2 px-2 w-32">Name</th>
                          <th className="border-2 px-2">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border-2 px-2">Attachment SequenceNumber</td>
                          <td className="border-2 px-2">{attachment.attachmentSequenceNumber}</td>
                        </tr>
                        <tr>
                          <td className="border-2 px-2">Attachment Name</td>
                          <td className="border-2 px-2">{attachment.attachmentDocumentName}</td>
                        </tr>
                        <tr>
                          <td className="border-2 px-2">Attachment Purpose</td>
                          <td className="border-2 px-2">{attachment.attachmentPurpose}</td>
                        </tr>
                        <tr>
                          <td className="border-2 px-2">Matched Content Percentage</td>
                          <td className="border-2 px-2">{attachment.matchedPercentage}</td>
                        </tr>
                        <tr>
                          <td className="border-2 px-2">Attachment Url</td>
                          <td className="border-2 px-2">
                            <a href={attachment.attachmentUrl} target="_blank">
                              {attachment.attachmentUrl}
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  );
                })}
              </div>
            </div>

            <h1>Matched Content</h1>
            <div className="mt-4">
              {criterion.matchedContent ? (
                <div className="markdown-body text-md" dangerouslySetInnerHTML={{ __html: getMarkdownContent(criterion.matchedContent) }} />
              ) : (
                'No Matched Content'
              )}
            </div>
          </Accordion>
        );
      })}
    </div>
  );
}
