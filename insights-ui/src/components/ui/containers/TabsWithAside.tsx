import React from 'react';

/**
 * A tab row with a control beside it, e.g. the report's section tabs with the
 * Import | Export switch. On wide screens the aside sits at the right end of
 * the tab row, its contents stacked and right-aligned, with the tabs' underline
 * running beneath it too; on smaller screens it sits in one line above the tabs.
 */
export default function TabsWithAside({ tabs, aside }: { tabs: React.ReactNode; aside?: React.ReactNode }): React.JSX.Element {
  if (!aside) return <>{tabs}</>;
  return (
    <div className="flex flex-col-reverse gap-3 xl:flex-row xl:items-end xl:gap-0">
      <div className="min-w-0 xl:flex-1">{tabs}</div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 xl:shrink-0 xl:flex-col xl:items-end xl:border-b xl:border-border xl:pb-2 xl:pl-6">
        {aside}
      </div>
    </div>
  );
}
