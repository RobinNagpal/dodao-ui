'use client';

import type { QualityVsValueQuadrantProps } from '@/components/visualizations/QualityVsValueQuadrant';
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

// Quadrant chart shares the chart.js chunk with the price/quarterly/radar
// charts. Gate it on viewport intersection so the chunk doesn't fetch
// during hydration for users who never scroll to the competition section.
const QualityVsValueQuadrant = dynamic<QualityVsValueQuadrantProps>(() => import('@/components/visualizations/QualityVsValueQuadrant'), {
  ssr: false,
  loading: () => <QuadrantSkeleton />,
});

export default function CompetitionQuadrantChart(props: QualityVsValueQuadrantProps): JSX.Element {
  const { ref, inView } = useInView<HTMLDivElement>();
  return <div ref={ref}>{inView ? <QualityVsValueQuadrant {...props} /> : <QuadrantSkeleton />}</div>;
}
