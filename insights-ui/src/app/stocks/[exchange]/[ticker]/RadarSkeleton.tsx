/** Radar chart is client-only so it never blocks the first paint */

export function RadarSkeleton(): JSX.Element {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="aspect-square rounded-full bg-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 animate-pulse" />
        {/* simple rings + spokes for a “radar-ish” look */}
        <div className="absolute inset-4 rounded-full border border-gray-700" />
        <div className="absolute inset-10 rounded-full border border-gray-700" />
        <div className="absolute inset-16 rounded-full border border-gray-700" />
        <div className="absolute inset-24 rounded-full border border-gray-700" />
        {Array.from({ length: 8 }).map((_, i: number) => (
          <div key={i} className="absolute left-1/2 top-1/2 h-1/2 w-[1px] bg-gray-700 origin-top" style={{ transform: `rotate(${(360 / 8) * i}deg)` }} />
        ))}
      </div>
    </div>
  );
}
