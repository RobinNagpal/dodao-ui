/** Radar chart is client-only so it never blocks the first paint */

export function RadarSkeleton(): JSX.Element {
  return (
    <div className="w-full max-w-lg mx-auto" style={{ minHeight: '360px' }}>
      {/* Match the actual radar container dimensions: max-w-lg and ~360px height */}
      <div className="w-full aspect-square max-w-[360px] mx-auto rounded-full bg-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 animate-pulse" />
        {/* simple rings + spokes for a "radar-ish" look */}
        <div className="absolute inset-[10%] rounded-full border border-gray-700" />
        <div className="absolute inset-[20%] rounded-full border border-gray-700" />
        <div className="absolute inset-[30%] rounded-full border border-gray-700" />
        <div className="absolute inset-[40%] rounded-full border border-gray-700" />
        {Array.from({ length: 8 }).map((_, i: number) => (
          <div key={i} className="absolute left-1/2 top-1/2 h-1/2 w-[1px] bg-gray-700 origin-top" style={{ transform: `rotate(${(360 / 8) * i}deg)` }} />
        ))}
      </div>
    </div>
  );
}
