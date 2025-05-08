import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { FullNestedTickerReport } from '@/types/public-equity/ticker-report-types';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import Accordion from '@dodao/web-core/utils/accordion/Accordion';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import TickerFinancialsButton from './TickerFinancialsButton';
import { safeParseJsonString } from '@/util/safe-parse-json-string';

export interface DebugTickerFinancialsProps {
  report: FullNestedTickerReport;
  onPostUpdate: () => Promise<void>;
}

export default function DebugTickerFinancials({ report, onPostUpdate }: DebugTickerFinancialsProps) {
  const ticker = report.tickerKey;

  const tickerFinancials = safeParseJsonString(report.tickerInfo).financials ?? '';

  const [selectedCriterionAccordian, setSelectedCriterionAccordian] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const {
    postData: regenerateTickerFinancials,
    loading: TickerFinancialsLoading,
    error: TickerFinancialsError,
  } = usePostData<string, {}>({
    errorMessage: 'Failed to repopulate ticker financials.',
  });

  const handleRegenerateTickerFinancials = async () => {
    await regenerateTickerFinancials(`${getBaseUrl()}/api/tickers/${ticker}/ticker-financials`);
    await onPostUpdate();
  };

  return (
    <div className="mt-8">
      {TickerFinancialsError && <div className="text-red-500">{TickerFinancialsError}</div>}
      <PrivateWrapper>
        <div className="flex justify-end">
          <Button loading={TickerFinancialsLoading} primary variant="contained" onClick={() => setShowConfirmModal(true)} disabled={TickerFinancialsLoading}>
            Repopulate Ticker Financials
          </Button>
        </div>
      </PrivateWrapper>
      <h1 className="mb-8 font-bold text-xl">Ticker Financials</h1>
      <Accordion
        label={'Ticker Financials'}
        isOpen={selectedCriterionAccordian === `ticker_financials`}
        onClick={() => setSelectedCriterionAccordian(selectedCriterionAccordian === `ticker_financials` ? null : `ticker_financials`)}
      >
        <div className="mt-4">
          <TickerFinancialsButton tickerKey={ticker} tickerFinancialsContent={JSON.stringify(tickerFinancials, null, 2) || undefined} onUpdate={onPostUpdate} />
          <pre className="whitespace-pre-wrap break-words overflow-x-auto max-h-[400px] overflow-y-auto text-xs">
            {tickerFinancials ? JSON.stringify(tickerFinancials, null, 2) : 'Not populated yet'}
          </pre>
        </div>
      </Accordion>
      {showConfirmModal && (
        <ConfirmationModal
          open={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={async () => {
            await handleRegenerateTickerFinancials();
            setShowConfirmModal(false);
          }}
          title="Repopulate Ticker Financials"
          confirmationText="Are you sure you want to repopulate the ticker financials?"
          askForTextInput={true}
          confirming={TickerFinancialsLoading}
        />
      )}
    </div>
  );
}
