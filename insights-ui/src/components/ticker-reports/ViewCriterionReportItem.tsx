import CriterionReportPieChart from '@/components/visualizations/CriterionReportPieChart';
import CriterionReportWaterfallChart from '@/components/visualizations/CriterionReportWaterfallChart';
import { IndustryGroupCriteriaDefinition, OutputType } from '@/types/public-equity/criteria-types';
import { CriterionReportItem } from '@/types/public-equity/ticker-report-types';
import CriterionReportDonutChart from '../visualizations/CriterionReportDoughnutChart';
import { parseMarkdown } from '@/util/parse-markdown';

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
  const getMarkdownContent = (content?: string) => {
    return content ? parseMarkdown(content) : 'No Information';
  };

  if (!content) {
    return <div>No Content For report {reportDefinition?.key}</div>;
  }
  if (reportDefinition && reportDefinition?.outputType === 'WaterfallChart') {
    return <CriterionReportWaterfallChart content={content} />;
  } else if (reportDefinition && reportDefinition?.outputType === 'PieChart') {
    return <CriterionReportPieChart content={content} />;
  } else if (reportDefinition && reportDefinition?.outputType === 'DoughnutChart') {
    return <CriterionReportDonutChart content={content} />;
  }

  return <div className="markdown-body text-md overflow-x-auto" dangerouslySetInnerHTML={{ __html: getMarkdownContent(content) }} />;
}
