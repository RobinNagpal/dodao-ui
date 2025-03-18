'use client';

import WaterfallChart from '@/components/visualizations/WaterfallChart';

interface CriterionReportWaterfallChartProps {
  content: string;
}
export default function CriterionReportWaterfallChart({ content }: CriterionReportWaterfallChartProps) {
  let data: { label: string; earnings: number }[] | undefined = undefined;
  let error: string | undefined;
  try {
    data = JSON.parse(content);
  } catch (e) {
    error = (e as any)?.message;
  }
  if (error) {
    return <div className="text-red-500">{error}</div>;
  }
  return data ? (
    <WaterfallChart width={500} height={500} data={data} xAccessor={(datum) => datum.label} yAccessor={(datum) => datum.earnings} yLabel={'label'} />
  ) : null;
}
