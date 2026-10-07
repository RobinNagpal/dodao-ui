import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Full-width box with a fixed height for a chart.js canvas (chart.js sizes the
 * canvas to its parent, so the parent must reserve the height up front — that
 * also keeps the layout from shifting when the client chart mounts). The
 * square radar charts use `RadarChartFrame` instead.
 */
const chartFrame = cva('relative w-full', {
  variants: {
    height: { sm: 'h-56', md: 'h-72', lg: 'h-96' },
  },
  defaultVariants: { height: 'md' },
});

export type ChartFrameProps = VariantProps<typeof chartFrame> & {
  children: React.ReactNode;
  /** Accessible description of what the chart shows. */
  label: string;
  className?: string;
};

export default function ChartFrame({ children, height, label, className }: ChartFrameProps): React.JSX.Element {
  return (
    <div role="img" aria-label={label} className={cn(chartFrame({ height }), className)}>
      {children}
    </div>
  );
}
