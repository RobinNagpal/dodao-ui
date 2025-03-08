'use client';

import WaterfallChart from '@/components/visualizations/WaterfallChart';

interface CriterionReportWaterfallChartProps {
  content: string;
}
export default function CriterionReportWaterfallChart({ content }: CriterionReportWaterfallChartProps) {
  const data: { label: string; earnings: number }[] = JSON.parse(content);

  return <WaterfallChart width={500} height={500} data={data} xAccessor={(datum) => datum.label} yAccessor={(datum) => datum.earnings} yLabel={'label'} />;
}
