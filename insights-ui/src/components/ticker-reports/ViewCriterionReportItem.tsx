import CriterionReportPieChart from '@/components/visualizations/CriterionReportPieChart';
import CriterionReportWaterfallChart from '@/components/visualizations/CriterionReportWaterfallChart';
import { IndustryGroupCriteriaDefinition, OutputType } from '@/types/public-equity/criteria-types';
import { CriterionReportItem } from '@/types/public-equity/ticker-report-types';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { marked } from 'marked';

interface ReportContentProps {
  criterionKey: string;
  report: CriterionReportItem;
  industryGroupCriteria: IndustryGroupCriteriaDefinition;
}

export function ViewCriterionReportItem({ criterionKey, report, industryGroupCriteria }: ReportContentProps) {
  const reportDefinition = industryGroupCriteria.criteria.find((item) => item.key === criterionKey)?.reports.find((item) => item.key === report.reportKey);
  if (!reportDefinition) {
    return <div>Report not found</div>;
  }
  const content = reportDefinition.outputType === OutputType.Text ? report.textData : JSON.stringify(report.jsonData, null, 2);
  const renderer = getMarkedRenderer();
  const getMarkdownContent = (content?: string) => {
    return content ? marked.parse(content, { renderer }) : 'No Information';
  };

  if (!content) {
    return <div>No Content For report {reportDefinition?.key}</div>;
  }
  if (reportDefinition && reportDefinition?.outputType === 'WaterfallChart') {
    return <CriterionReportWaterfallChart content={content} />;
  } else if (reportDefinition && reportDefinition?.outputType === 'PieChart') {
    return <CriterionReportPieChart content={content} />;
  }

  return <div className="markdown-body text-md" dangerouslySetInnerHTML={{ __html: getMarkdownContent(content) }} />;
}
