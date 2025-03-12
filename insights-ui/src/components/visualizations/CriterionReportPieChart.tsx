'use client';

import PieChart from './PieChart';

interface CriterionReportPieChartProps {
  content: string;
}
export default function CriterionReportPieChart({ content }: CriterionReportPieChartProps) {
  const data: { labels: string[]; values: number[] } = JSON.parse(content);

  return (
    <div className="max-w-lg mx-auto">
      <PieChart labels={data.labels} values={data.values} />
    </div>
  );
}
