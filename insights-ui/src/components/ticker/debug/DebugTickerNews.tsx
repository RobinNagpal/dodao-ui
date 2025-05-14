import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { FullNestedTickerReport } from '@/types/public-equity/ticker-report-types';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import Accordion from '@dodao/web-core/utils/accordion/Accordion';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import TickerNewsButton from './TickerNewsButton';
import { safeParseJsonString } from '@/util/safe-parse-json-string';

export interface DebugTickerNewsProps {
  report: FullNestedTickerReport;
  onPostUpdate: () => Promise<void>;
}

export default function DebugTickerNews({ report, onPostUpdate }: DebugTickerNewsProps) {
  const ticker = report.tickerKey;

  const tickerNews = safeParseJsonString(report.tickerInfo).tickerNews ?? '';

  const [selectedCriterionAccordian, setSelectedCriterionAccordian] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const {
    postData: regenerateTickerNews,
    loading: TickerNewsLoading,
    error: TickerNewsError,
  } = usePostData<string, {}>({
    errorMessage: 'Failed to repopulate ticker news.',
  });

  const handleRegenerateTickerNews = async () => {
    await regenerateTickerNews(`${getBaseUrl()}/api/tickers/${ticker}/ticker-news`);
    await onPostUpdate();
  };

  return (
    <div className="mt-8">
      {TickerNewsError && <div className="text-red-500">{TickerNewsError}</div>}
      <PrivateWrapper>
        <div className="flex justify-end">
          <Button loading={TickerNewsLoading} primary variant="contained" onClick={() => setShowConfirmModal(true)} disabled={TickerNewsLoading}>
            Repopulate Ticker News
          </Button>
        </div>
      </PrivateWrapper>
      <h1 className="mb-8 font-bold text-xl">Ticker News</h1>
      <Accordion
        label={'Ticker News'}
        isOpen={selectedCriterionAccordian === `ticker_news`}
        onClick={() => setSelectedCriterionAccordian(selectedCriterionAccordian === `ticker_news` ? null : `ticker_news`)}
      >
        <div className="mt-4">
          <TickerNewsButton tickerKey={ticker} tickerNewsContent={JSON.stringify(tickerNews, null, 2) || undefined} onUpdate={onPostUpdate} />
          <pre className="whitespace-pre-wrap break-words overflow-x-auto max-h-[400px] overflow-y-auto text-xs">
            {tickerNews ? JSON.stringify(tickerNews, null, 2) : 'Not populated yet'}
          </pre>
        </div>
      </Accordion>
      {showConfirmModal && (
        <ConfirmationModal
          open={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={async () => {
            await handleRegenerateTickerNews();
            setShowConfirmModal(false);
          }}
          title="Repopulate Ticker News"
          confirmationText="Are you sure you want to repopulate the ticker news?"
          askForTextInput={true}
          confirming={TickerNewsLoading}
        />
      )}
    </div>
  );
}
