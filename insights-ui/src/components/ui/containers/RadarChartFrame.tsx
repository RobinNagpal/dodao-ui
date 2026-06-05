import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Fixed-size square box that holds the radar / spider chart AND its loading
 * skeleton. Both states render into this same box so the dynamic-import +
 * Suspense swap produces ZERO layout shift (CLS) — chart.js draws the radar at
 * a 1:1 aspect ratio, so the canvas exactly fills this square.
 *
 * This is the single source of truth for the chart's rendered dimensions: the
 * skeleton, the in-view live chart, and the Suspense fallback all wrap with it,
 * so they can never drift apart (which is what made the chart visibly "jump"
 * when it finished loading). `aspect-square` reserves the height up front from
 * the very first paint, so nothing reflows once chart.js mounts.
 */
const radarFrame = cva('mx-auto w-full max-w-[350px] aspect-square');

export type RadarChartFrameProps = {
  children: React.ReactNode;
  className?: string;
};

export default function RadarChartFrame({ children, className }: RadarChartFrameProps): React.JSX.Element {
  return <div className={cn(radarFrame(), className)}>{children}</div>;
}
