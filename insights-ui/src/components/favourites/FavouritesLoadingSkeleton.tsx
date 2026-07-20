import React from 'react';

/**
 * Skeleton placeholder for the favourites page. Mirrors the real layout
 * (header, toolbar, and a few collapsed list rows) so the transition into
 * loaded content is smooth and there is no jarring full-screen spinner.
 */
export default function FavouritesLoadingSkeleton(): React.JSX.Element {
  return (
    <div className="max-w-7xl mx-auto py-4" aria-busy="true" aria-label="Loading your favourites">
      {/* Header + toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div>
          <div className="h-7 w-56 rounded-md shimmer mb-2" />
          <div className="h-3.5 w-72 rounded-md shimmer" />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="h-9 w-40 rounded-lg shimmer" />
          <div className="h-9 w-32 rounded-lg shimmer" />
          <div className="h-9 w-32 rounded-lg shimmer" />
        </div>
      </div>

      {/* Collapsed list rows */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="border border-border rounded-md px-4 py-2.5 flex items-center justify-between">
            <div className="h-4 w-1/3 rounded-md shimmer" />
            <div className="h-5 w-5 rounded-md shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}
