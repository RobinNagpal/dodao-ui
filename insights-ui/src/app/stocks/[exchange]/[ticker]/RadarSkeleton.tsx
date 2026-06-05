/** Radar chart is client-only so it never blocks the first paint */

import RadarChartFrame from '@/components/ui/containers/RadarChartFrame';

export function RadarSkeleton(): JSX.Element {
  return (
    // Same fixed square box as the live chart (RadarChartFrame) so swapping the
    // skeleton for the real radar causes zero layout shift.
    <RadarChartFrame>
      <div className="w-full h-full rounded-full bg-surface relative overflow-hidden">
        <div className="absolute inset-0 animate-pulse" />
        {/* simple rings + spokes for a "radar-ish" look */}
        <div className="absolute inset-[10%] rounded-full border border-border" />
        <div className="absolute inset-[20%] rounded-full border border-border" />
        <div className="absolute inset-[30%] rounded-full border border-border" />
        <div className="absolute inset-[40%] rounded-full border border-border" />
        {Array.from({ length: 8 }).map((_, i: number) => (
          <div key={i} className="absolute left-1/2 top-1/2 h-1/2 w-[1px] bg-surface-2 origin-top" style={{ transform: `rotate(${(360 / 8) * i}deg)` }} />
        ))}
      </div>
    </RadarChartFrame>
  );
}
