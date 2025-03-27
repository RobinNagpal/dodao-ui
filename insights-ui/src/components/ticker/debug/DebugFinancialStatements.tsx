import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import { FullNestedTickerReport } from '@/types/public-equity/ticker-report-types';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import Accordion from '@dodao/web-core/utils/accordion/Accordion';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import { useState } from 'react';
import FinancialStatementsButton from './FinancialStatementsButton';

export interface DebugFinancialStatementsProps {
  report: FullNestedTickerReport;
  industryGroupCriteria: IndustryGroupCriteriaDefinition;
  onPostUpdate: () => Promise<void>;
}

export default function DebugFinancialStatements({ report, onPostUpdate }: DebugFinancialStatementsProps) {
  const ticker = report.tickerKey;

  const [selectedCriterionAccordian, setSelectedCriterionAccordian] = useState<string | null>(null);
  const renderer = getMarkedRenderer();
  const getMarkdownContent = (content?: string) => {
    return content ? marked.parse(content, { renderer }) : 'No Information';
  };

  const {
    postData: regenerateFinancialStatements,
    loading: financialStatementsLoading,
    error: financialStatementsError,
  } = usePostData<string, {}>({
    errorMessage: 'Failed to refetch financial statements.',
    redirectPath: ``,
  });

  const handleRegenerateFinancialStatements = async () => {
    await regenerateFinancialStatements(`${getBaseUrl()}/api/actions/tickers/${ticker}/trigger-financial-statements`);
    await onPostUpdate();
  };

  return (
    <div className="mt-8">
      {financialStatementsError && <div className="text-red-500">{financialStatementsError}</div>}
      <PrivateWrapper>
        <div className="flex justify-end mb-4">
          <Button
            loading={financialStatementsLoading}
            primary
            variant="contained"
            onClick={handleRegenerateFinancialStatements}
            disabled={financialStatementsLoading}
          >
            Refetch Financial Statements
          </Button>
        </div>
      </PrivateWrapper>
      <h1 className="mb-8 font-bold text-xl">Financial Statements</h1>
      <Accordion
        label={'Financial Statements'}
        isOpen={selectedCriterionAccordian === `financial_statements`}
        onClick={() => setSelectedCriterionAccordian(selectedCriterionAccordian === `financial_statements` ? null : `financial_statements`)}
      >
        <div className="mt-4">
          <PrivateWrapper>
            <FinancialStatementsButton
              tickerKey={ticker}
              financialStatementsContent={report?.latest10QFinancialStatements || undefined}
              onPostUpdate={onPostUpdate}
            />
          </PrivateWrapper>
          <div className="markdown-body text-md" dangerouslySetInnerHTML={{ __html: getMarkdownContent(report?.latest10QFinancialStatements ?? '') }} />
        </div>
      </Accordion>
    </div>
  );
}
