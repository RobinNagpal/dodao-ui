import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { FullNestedTickerReport } from '@/types/public-equity/ticker-report-types';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import Accordion from '@dodao/web-core/utils/accordion/Accordion';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import TickerInfoButton from './TickerInfoButton';
import { safeParseJsonString } from '@/util/safe-parse-json-string';

export interface DebugTickerInfoProps {
  report: FullNestedTickerReport;
  onPostUpdate: () => Promise<void>;
}

export default function DebugTickerInfo({ report, onPostUpdate }: DebugTickerInfoProps) {
  const ticker = report.tickerKey;

  const [selectedCriterionAccordian, setSelectedCriterionAccordian] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const {
    postData: regenerateTickerInfo,
    loading: TickerInfoLoading,
    error: TickerInfoError,
  } = usePostData<string, {}>({
    errorMessage: 'Failed to repopulate ticker info.',
  });

  const handleRegenerateTickerInfo = async () => {
    await regenerateTickerInfo(`${getBaseUrl()}/api/tickers/${ticker}/ticker-info`);
    await onPostUpdate();
  };

  return (
    <div className="mt-8">
      {TickerInfoError && <div className="text-red-500">{TickerInfoError}</div>}
      <PrivateWrapper>
        <div className="flex justify-end mb-4">
          <Button loading={TickerInfoLoading} primary variant="contained" onClick={() => setShowConfirmModal(true)} disabled={TickerInfoLoading}>
            Repopulate Ticker Info
          </Button>
        </div>
      </PrivateWrapper>
      <h1 className="mb-8 font-bold text-xl">Ticker Info</h1>
      <Accordion
        label={'Ticker Info'}
        isOpen={selectedCriterionAccordian === `ticker_info`}
        onClick={() => setSelectedCriterionAccordian(selectedCriterionAccordian === `ticker_info` ? null : `ticker_info`)}
      >
        <div className="mt-4">
          <TickerInfoButton tickerKey={ticker} tickerInfoContent={report.tickerInfo || undefined} onUpdate={onPostUpdate} />
          <pre className="whitespace-pre-wrap break-words overflow-x-auto max-h-[400px] overflow-y-auto text-xs">
            {report.tickerInfo ? JSON.stringify(safeParseJsonString(report.tickerInfo), null, 2) : 'Not populated yet'}
          </pre>
        </div>
      </Accordion>
      {showConfirmModal && (
        <ConfirmationModal
          open={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={async () => {
            await handleRegenerateTickerInfo();
            setShowConfirmModal(false);
          }}
          title="Repopulate Ticker Info"
          confirmationText="Are you sure you want to repopulate the ticker info?"
          askForTextInput={true}
          confirming={TickerInfoLoading}
        />
      )}
    </div>
  );
}
