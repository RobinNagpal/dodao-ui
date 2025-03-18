import CriterionReportPieChart from '@/components/visualizations/CriterionReportPieChart';
import CriterionReportWaterfallChart from '@/components/visualizations/CriterionReportWaterfallChart';
import { IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import { CriterionReportItem } from '@/types/public-equity/ticker-report-types';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { marked } from 'marked';

interface ReportContentProps {
  criterionKey: string;
  criterionReport: CriterionReportItem;
  industryGroupCriteria: IndustryGroupCriteriaDefinition;
  content?: string;
}

export function ViewCriterionReportItem({ criterionKey, criterionReport, industryGroupCriteria, content }: ReportContentProps) {
  const renderer = getMarkedRenderer();
  const getMarkdownContent = (content?: string) => {
    return content ? marked.parse(content, { renderer }) : 'No Information';
  };

  const reportDefinition = industryGroupCriteria.criteria
    .find((item) => item.key === criterionKey)
    ?.reports.find((item) => item.key === criterionReport.reportKey);

  if (!content) {
    return <div>No Content For report {reportDefinition.key}</div>;
  }
  if (reportDefinition && reportDefinition.outputType === 'WaterfallChart') {
    return <CriterionReportWaterfallChart content={content} />;
  } else if (reportDefinition && reportDefinition.outputType === 'PieChart') {
    return <CriterionReportPieChart content={content} />;
  }

  return <div className="markdown-body text-md" dangerouslySetInnerHTML={{ __html: getMarkdownContent(content) }} />;
}
