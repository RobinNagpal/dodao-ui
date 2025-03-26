import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import { FullNestedTickerReport } from '@/types/public-equity/ticker-report-types';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import Accordion from '@dodao/web-core/utils/accordion/Accordion';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import { useEffect, useState } from 'react';
import FinancialStatementsButton from './FinancialStatementsButton';

export interface DebugFinancialStatementsProps {
  report: FullNestedTickerReport;
  industryGroupCriteria: IndustryGroupCriteriaDefinition;
}

export default function DebugFinancialStatements({ report }: DebugFinancialStatementsProps) {
  const ticker = report.tickerKey;

  const [financialStatementsContent, setFinancialStatementsContent] = useState(report.latest10QFinancialStatements ?? 'No Financial Statements');
  const [selectedCriterionAccordian, setSelectedCriterionAccordian] = useState<string | null>(null);
  const renderer = getMarkedRenderer();
  const getMarkdownContent = (content?: string) => {
    return content ? marked.parse(content, { renderer }) : 'No Information';
  };

  const {
    data: financialStatementsData,
    postData: regeneratefinancialStatements,
    loading: financialStatementsLoading,
    error: financialStatementsError,
  } = usePostData<string, {}>({
    errorMessage: 'Failed to refetch financial statements.',
    successMessage: 'Financial Statements refetching started successfully',
    redirectPath: ``,
  });

  useEffect(() => {
    if (financialStatementsData) {
      setFinancialStatementsContent(financialStatementsData);
    } else if (financialStatementsError) {
      setFinancialStatementsContent(financialStatementsError);
    }
  }, [financialStatementsData, financialStatementsError]);

  const handleRegenerateFinancialStatements = async () => {
    await regeneratefinancialStatements(`${getBaseUrl()}/api/actions/tickers/${ticker}/trigger-financial-statements`);
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
            <FinancialStatementsButton tickerKey={ticker} financialStatementsContent={financialStatementsContent} />
          </PrivateWrapper>
          <div className="markdown-body text-md" dangerouslySetInnerHTML={{ __html: getMarkdownContent(financialStatementsContent) }} />
        </div>
      </Accordion>
    </div>
  );
}
