import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { ViewCriterionReportItem } from '@/components/ticker-reports/ViewCriterionReportItem';
import { getWebhookUrlFromLocalStorage } from '@/components/ticker/debug/WebhookUrlInput';
import { CriterionDefinition, CriterionReportDefinition, IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import { CriterionReportItem, ProcessingStatus, TickerReport } from '@/types/public-equity/ticker-report-types';
import { CreateSingleCriterionReportRequest } from '@/types/public-equity/ticker-request-response';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useEffect, useState } from 'react';

export interface DebugCriterionEvaluationProps {
  tickerReport: TickerReport;
  industryGroupCriteria: IndustryGroupCriteriaDefinition;
  criterionDefinition: CriterionDefinition;
  reportDefinition: CriterionReportDefinition;
  report?: CriterionReportItem;
}

export default function DebugCriterionReport({
  tickerReport,
  industryGroupCriteria,
  criterionDefinition,
  reportDefinition,
  report,
}: DebugCriterionEvaluationProps) {
  const [reportContent, setReportContent] = useState<string | null>(null);

  const getReportContent = async () => {
    const outputFileUrl = report?.outputFileUrl;

    if (outputFileUrl) {
      const response = await fetch(outputFileUrl, { cache: 'no-cache' });
      const content = await response.text();
      setReportContent(content);
    }
  };

  useEffect(() => {
    getReportContent();
  }, []);
  const criterionKey = criterionDefinition.key;
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const {
    data: singleCriterionReportsResponse,
    postData: regenerateSingleCriterionReports,
    loading: singleCriterionReportsLoading,
    error: singleCriterionReportsError,
  } = usePostData<{ message: string }, CreateSingleCriterionReportRequest>({
    errorMessage: 'Failed to regenerate criterion reports',
    successMessage: 'Criterion regeneration started successfully',
    redirectPath: ``,
  });

  // Handles section-specific regeneration (for checklist, metrics, or individual reports)
  const handleRegenerateSingleCriterionReports = async (criterionKey: string, reportKey: string) => {
    regenerateSingleCriterionReports(`${getBaseUrl()}/api/actions/tickers/${tickerReport.ticker}/criterion/${criterionKey}/trigger-single-criterion-reports`, {
      langflowWebhookUrl: getWebhookUrlFromLocalStorage(tickerReport.selectedSector.id, tickerReport.selectedIndustryGroup.id, criterionKey),
      reportKey: reportKey,
    });
  };

  return (
    <div className="mt-2">
      {singleCriterionReportsError && <div className="text-red-500">{singleCriterionReportsError}</div>}
      <PrivateWrapper>
        <div className="my-1 flex justify-end">
          <IconButton
            iconName={IconTypes.Reload}
            disabled={singleCriterionReportsLoading}
            onClick={() => {
              setShowConfirmModal(true);
            }}
            loading={singleCriterionReportsLoading || report?.status === ProcessingStatus.InProgress}
          />
        </div>
      </PrivateWrapper>
      <h2 className="font-bold text-xl mt-5">📄 {reportDefinition.key}</h2>
      {report && report.outputFileUrl ? (
        <ViewCriterionReportItem
          criterionKey={criterionKey}
          criterionReport={report}
          industryGroupCriteria={industryGroupCriteria}
          content={reportContent || undefined}
        />
      ) : (
        <div>No report exists</div>
      )}
      {showConfirmModal && (
        <ConfirmationModal
          open={true}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={async () => {
            setShowConfirmModal(false);
            await handleRegenerateSingleCriterionReports(criterionDefinition.key, reportDefinition.key);
            await getReportContent();
          }}
          title="Regenerate Section"
          confirmationText={`Are you sure you want to regenerate the ${reportDefinition.key} report?`}
          askForTextInput={true}
        />
      )}
    </div>
  );
}
