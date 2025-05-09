import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { FullNestedTickerReport } from '@/types/public-equity/ticker-report-types';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import Accordion from '@dodao/web-core/utils/accordion/Accordion';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import { safeParseJsonString } from '@/util/safe-parse-json-string';

export interface DebugTickerDividendsProps {
  report: FullNestedTickerReport;
  onPostUpdate: () => Promise<void>;
}

export default function DebugTickerDividends({ report, onPostUpdate }: DebugTickerDividendsProps) {
  const ticker = report.tickerKey;

  const tickerDividends = safeParseJsonString(report.tickerInfo).dividends ?? '';

  const [selectedCriterionAccordian, setSelectedCriterionAccordian] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const {
    postData: regenerateTickerDividends,
    loading: TickerDividendsLoading,
    error: TickerDividendsError,
  } = usePostData<string, {}>({
    errorMessage: 'Failed to repopulate ticker dividends.',
  });

  const handleRegenerateTickerDividends = async () => {
    await regenerateTickerDividends(`${getBaseUrl()}/api/tickers/${ticker}/ticker-dividends`);
    await onPostUpdate();
  };

  return (
    <div className="mt-8">
      {TickerDividendsError && <div className="text-red-500">{TickerDividendsError}</div>}
      <PrivateWrapper>
        <div className="flex justify-end">
          <Button loading={TickerDividendsLoading} primary variant="contained" onClick={() => setShowConfirmModal(true)} disabled={TickerDividendsLoading}>
            Repopulate Ticker Dividends
          </Button>
        </div>
      </PrivateWrapper>
      <h1 className="mb-8 font-bold text-xl">Ticker Dividends</h1>
      <Accordion
        label={'Ticker Dividends'}
        isOpen={selectedCriterionAccordian === `ticker_dividends`}
        onClick={() => setSelectedCriterionAccordian(selectedCriterionAccordian === `ticker_dividends` ? null : `ticker_dividends`)}
      >
        <div className="mt-4">
          <pre className="whitespace-pre-wrap break-words overflow-x-auto max-h-[400px] overflow-y-auto text-xs">
            {tickerDividends ? JSON.stringify(tickerDividends, null, 2) : 'Not populated yet'}
          </pre>
        </div>
      </Accordion>
      {showConfirmModal && (
        <ConfirmationModal
          open={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={async () => {
            await handleRegenerateTickerDividends();
            setShowConfirmModal(false);
          }}
          title="Repopulate Ticker Dividends"
          confirmationText="Are you sure you want to repopulate the ticker dividends?"
          askForTextInput={true}
          confirming={TickerDividendsLoading}
        />
      )}
    </div>
  );
}
