'use client';

import type { EtfReturnsVsEfficiencyQuadrantProps } from '@/components/visualizations/EtfReturnsVsEfficiencyQuadrant';
import { useInView } from '@/util/use-in-view';
import dynamic from 'next/dynamic';

function QuadrantSkeleton(): JSX.Element {
  return (
    <div className="animate-pulse max-w-md mx-auto lg:mx-0">
      <div className="aspect-square bg-surface-2 rounded" />
      <div className="flex flex-wrap gap-4 mt-3 px-4 justify-center">
        <div className="h-3 w-20 bg-surface-2 rounded" />
        <div className="h-3 w-16 bg-surface-2 rounded" />
        <div className="h-3 w-18 bg-surface-2 rounded" />
        <div className="h-3 w-20 bg-surface-2 rounded" />
      </div>
    </div>
  );
}

// Quadrant chart shares the chart.js chunk with the price/radar charts.
// Gate it on viewport intersection so the chunk doesn't fetch during
// hydration for users who never scroll to the competition section.
// Mirrors `CompetitionQuadrantChart.tsx` on the stock side.
const EtfReturnsVsEfficiencyQuadrant = dynamic<EtfReturnsVsEfficiencyQuadrantProps>(
  () => import('@/components/visualizations/EtfReturnsVsEfficiencyQuadrant'),
  {
    ssr: false,
    loading: () => <QuadrantSkeleton />,
  }
);

export default function EtfCompetitionQuadrantChart(props: EtfReturnsVsEfficiencyQuadrantProps): JSX.Element {
  const { ref, inView } = useInView<HTMLDivElement>();
  return <div ref={ref}>{inView ? <EtfReturnsVsEfficiencyQuadrant {...props} /> : <QuadrantSkeleton />}</div>;
}
