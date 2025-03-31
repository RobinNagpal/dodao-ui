import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { ReportSection } from '@/components/ticker-reports/ReportSection';
import { CriterionDefinition, CriterionReportDefinition, IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import { CriterionReportItem, ProcessingStatus, TickerReport } from '@/types/public-equity/ticker-report-types';
import { CreateSingleCriterionReportRequest } from '@/types/public-equity/ticker-request-response';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useState } from 'react';

export interface DebugCriterionReportProps {
  tickerReport: TickerReport;
  industryGroupCriteria: IndustryGroupCriteriaDefinition;
  criterionDefinition: CriterionDefinition;
  reportDefinition: CriterionReportDefinition;
  report?: CriterionReportItem;
  onRegenerate?: (section: string, reportKey?: string) => void;
}

export default function DebugCriterionReport({
  tickerReport,
  industryGroupCriteria,
  criterionDefinition,
  reportDefinition,
  report,
  onRegenerate,
}: DebugCriterionReportProps) {
  const criterionKey = criterionDefinition.key;
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleRegenerateSingleCriterionReports = async () => {
    if (onRegenerate) {
      onRegenerate('report', reportDefinition.key);
      setShowConfirmModal(false);
      return;
    }
  };

  return (
    <div className="mt-2">
      <h2 className="font-bold text-lg mt-5 flex ">
        <span className="inline-block align-bottom"> 📄 {reportDefinition.key}</span>{' '}
        <PrivateWrapper>
          <IconButton
            iconName={IconTypes.Reload}
            onClick={() => {
              setShowConfirmModal(true);
            }}
            className={'ml-2'}
            primary
            variant={'outlined'}
            loading={report?.status === ProcessingStatus.InProgress}
          />
        </PrivateWrapper>
      </h2>
      <ReportSection industryGroupCriteria={industryGroupCriteria} reportDefinition={reportDefinition} report={report} criterionKey={criterionKey} />
      {showConfirmModal && (
        <ConfirmationModal
          open={true}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={async () => {
            await handleRegenerateSingleCriterionReports();
          }}
          title="Regenerate Section"
          confirmationText={`Are you sure you want to regenerate the ${reportDefinition.key} report?`}
          askForTextInput={true}
        />
      )}
    </div>
  );
}
