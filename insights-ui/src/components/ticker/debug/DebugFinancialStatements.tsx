import PrivateWrapper from '@/components/auth/PrivateWrapper';
import DisabledOnLocalhostButton from '@/components/ui/DisabledOnLocalhostButton';
import { IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import { FullNestedTickerReport } from '@/types/public-equity/ticker-report-types';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import Accordion from '@dodao/web-core/utils/accordion/Accordion';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import { useState } from 'react';

export interface DebugFinancialStatementsProps {
  report: FullNestedTickerReport;
  industryGroupCriteria: IndustryGroupCriteriaDefinition;
}

export default function DebugFinancialStatements({ report }: DebugFinancialStatementsProps) {
  const ticker = report.tickerKey;

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
    regenerateMatchingCriteria(`${getBaseUrl()}/api/actions/tickers/${ticker}/trigger-financial-statements`);
  };

  return (
    <div className="mt-8">
      {matchingCriteriaError && <div className="text-red-500">{matchingCriteriaError}</div>}
      <PrivateWrapper>
        <div className="flex justify-end mb-4">
          <DisabledOnLocalhostButton
            loading={matchingCriteriaLoading}
            primary
            variant="contained"
            onClick={handleRegenerateMatchingCriteria}
            disabled={matchingCriteriaLoading}
            disabledLabel="Disabled on Localhost"
          >
            Refetch Financial Statements
          </DisabledOnLocalhostButton>
        </div>
      </PrivateWrapper>
      <h1 className="mb-8 font-bold text-xl">Financial Statements</h1>
      <Accordion
        label={'Financial Statements'}
        isOpen={selectedCriterionAccordian === `financial_statements`}
        onClick={() => setSelectedCriterionAccordian(selectedCriterionAccordian === `financial_statements` ? null : `financial_statements`)}
      >
        <div className="mt-4">
          {report.latest10QFinancialStatements ? (
            <div className="markdown-body text-md" dangerouslySetInnerHTML={{ __html: getMarkdownContent(report.latest10QFinancialStatements) }} />
          ) : (
            'No Financial Statements'
          )}
        </div>
      </Accordion>
    </div>
  );
}
