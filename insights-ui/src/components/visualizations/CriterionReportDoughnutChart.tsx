'use client';

import DonutChart from './DoughnutChart';

interface CriterionReportDonutChartProps {
  content: string;
}

export default function CriterionReportDonutChart({ content }: CriterionReportDonutChartProps) {
  const data: { labels: string[]; values: number[] } = JSON.parse(content);

  return (
    <div className="max-w-lg mx-auto">
      <DonutChart labels={data.labels} values={data.values} />
    </div>
  );
}
