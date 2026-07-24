'use client';

import React from 'react';

const LEGEND_ITEMS: { color: string; label: string }[] = [
  { color: 'bg-surface-3', label: 'Not Enabled' },
  { color: 'bg-blue-500', label: 'Pending' },
  { color: 'bg-green-500', label: 'Completed' },
  { color: 'bg-red-500', label: 'Failed' },
];

/** Color key for the per-step status dots rendered in the requests table. */
export default function StatusLegend(): JSX.Element {
  return (
    <div className="p-2 bg-surface rounded-lg mb-4">
      <div className="flex items-center gap-6 text-sm">
        <span className="font-semibold">Legend:</span>
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${item.color}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
