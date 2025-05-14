import { ViewCriterionReportItem } from '@/components/ticker-reports/ViewCriterionReportItem';
import { CriterionReportDefinition, IndustryGroupCriteriaDefinition, OutputType } from '@/types/public-equity/criteria-types';
import { CriterionReportItem } from '@/types/public-equity/ticker-report-types';

interface ReportSectionProps {
  industryGroupCriteria: IndustryGroupCriteriaDefinition;
  reportDefinition: CriterionReportDefinition;
  report?: CriterionReportItem;
  criterionKey: string;
}

export function ReportSection({ reportDefinition, report, criterionKey, industryGroupCriteria }: ReportSectionProps) {
  const headingPortion = (
    <h2 className="text-lg font-semibold my-2">{reportDefinition.key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}</h2>
  );

  if (!report) {
    return (
      <div>
        {headingPortion}
        <div className="text-center">Report not yet started</div>
      </div>
    );
  }

  if (reportDefinition.outputType === OutputType.Text && !report.textData) {
    return (
      <div>
        {headingPortion}
        <div className="text-center">No data available</div>
      </div>
    );
  }

  if (reportDefinition.outputType !== OutputType.Text && !report.jsonData) {
    return (
      <div>
        {headingPortion}
        <div className="text-center">No data available</div>
      </div>
    );
  }

  return (
    <div>
      {headingPortion}
      <ViewCriterionReportItem report={report} industryGroupCriteria={industryGroupCriteria} criterionKey={criterionKey} />
    </div>
  );
}
