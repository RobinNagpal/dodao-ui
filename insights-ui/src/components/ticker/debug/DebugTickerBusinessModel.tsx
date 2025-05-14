import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { FullNestedTickerReport } from '@/types/public-equity/ticker-report-types';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import Accordion from '@dodao/web-core/utils/accordion/Accordion';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import TickerBusinessModelButton from './TickerBusinessModelButton';
import { safeParseJsonString } from '@/util/safe-parse-json-string';

export interface DebugTickerBusinessModelProps {
  report: FullNestedTickerReport;
  onPostUpdate: () => Promise<void>;
}

export default function DebugTickerBusinessModel({ report, onPostUpdate }: DebugTickerBusinessModelProps) {
  const ticker = report.tickerKey;

  const tickerBusinessModel = safeParseJsonString(report.tickerInfo).businessModel ?? '';

  const [selectedCriterionAccordian, setSelectedCriterionAccordian] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const {
    postData: regenerateTickerBusinessModel,
    loading: TickerBusinessModelLoading,
    error: TickerBusinessModelError,
  } = usePostData<string, {}>({
    errorMessage: 'Failed to repopulate ticker business model.',
  });

  const handleRegenerateTickerBusinessModel = async () => {
    await regenerateTickerBusinessModel(`${getBaseUrl()}/api/tickers/${ticker}/ticker-business-model`);
    await onPostUpdate();
  };

  return (
    <div className="mt-8">
      {TickerBusinessModelError && <div className="text-red-500">{TickerBusinessModelError}</div>}
      <PrivateWrapper>
        <div className="flex justify-end">
          <Button
            loading={TickerBusinessModelLoading}
            primary
            variant="contained"
            onClick={() => setShowConfirmModal(true)}
            disabled={TickerBusinessModelLoading}
          >
            Repopulate Ticker BusinessModel
          </Button>
        </div>
      </PrivateWrapper>
      <h1 className="mb-8 font-bold text-xl">Ticker BusinessModel</h1>
      <Accordion
        label={'Ticker BusinessModel'}
        isOpen={selectedCriterionAccordian === `ticker_businessModel`}
        onClick={() => setSelectedCriterionAccordian(selectedCriterionAccordian === `ticker_businessModel` ? null : `ticker_businessModel`)}
      >
        <div className="mt-4">
          <TickerBusinessModelButton
            tickerKey={ticker}
            tickerBusinessModelContent={JSON.stringify(tickerBusinessModel, null, 2) || undefined}
            onUpdate={onPostUpdate}
          />
          <pre className="whitespace-pre-wrap break-words overflow-x-auto max-h-[400px] overflow-y-auto text-xs">
            {tickerBusinessModel ? JSON.stringify(tickerBusinessModel, null, 2) : 'Not populated yet'}
          </pre>
        </div>
      </Accordion>
      {showConfirmModal && (
        <ConfirmationModal
          open={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={async () => {
            await handleRegenerateTickerBusinessModel();
            setShowConfirmModal(false);
          }}
          title="Repopulate Ticker BusinessModel"
          confirmationText="Are you sure you want to repopulate the ticker business model?"
          askForTextInput={true}
          confirming={TickerBusinessModelLoading}
        />
      )}
    </div>
  );
}
