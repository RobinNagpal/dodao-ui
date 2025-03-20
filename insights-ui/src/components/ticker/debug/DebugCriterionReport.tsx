import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { ReportSection } from '@/components/ticker-reports/ReportSection';
import { getWebhookUrlFromLocalStorage } from '@/components/ticker/debug/WebhookUrlInput';
import { CriterionDefinition, CriterionReportDefinition, IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import { CriterionReportItem, ProcessingStatus, TickerReport } from '@/types/public-equity/ticker-report-types';
import { CreateSingleCriterionReportRequest } from '@/types/public-equity/ticker-request-response';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';

export interface DebugCriterionReportProps {
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
}: DebugCriterionReportProps) {
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
    regenerateSingleCriterionReports(
      `${getBaseUrl()}/api/actions/tickers/${tickerReport.tickerKey}/criterion/${criterionKey}/trigger-single-criterion-reports`,
      {
        langflowWebhookUrl: getWebhookUrlFromLocalStorage(tickerReport.sectorId, tickerReport.industryGroupId, criterionKey)!,
        reportKey: reportKey,
      }
    );
  };

  return (
    <div className="mt-2">
      {singleCriterionReportsError && <div className="text-red-500">{singleCriterionReportsError}</div>}

      <h2 className="font-bold text-lg mt-5 flex ">
        <span className="inline-block align-bottom"> 📄 {reportDefinition.key}</span>{' '}
        <PrivateWrapper>
          <IconButton
            iconName={IconTypes.Reload}
            disabled={singleCriterionReportsLoading}
            onClick={() => {
              setShowConfirmModal(true);
            }}
            className={'ml-2'}
            primary
            variant={'outlined'}
            loading={singleCriterionReportsLoading || report?.status === ProcessingStatus.InProgress}
          />
        </PrivateWrapper>
      </h2>
      <ReportSection industryGroupCriteria={industryGroupCriteria} reportDefinition={reportDefinition} report={report} criterionKey={criterionKey} />
      {showConfirmModal && (
        <ConfirmationModal
          open={true}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={async () => {
            setShowConfirmModal(false);
            await handleRegenerateSingleCriterionReports(criterionDefinition.key, reportDefinition.key);
          }}
          title="Regenerate Section"
          confirmationText={`Are you sure you want to regenerate the ${reportDefinition.key} report?`}
          askForTextInput={true}
        />
      )}
    </div>
  );
}
