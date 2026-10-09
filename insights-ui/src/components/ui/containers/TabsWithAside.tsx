import React from 'react';

/**
 * A tab row with a control beside it, e.g. the report's section tabs with the
 * Import | Export switch. On wide screens the aside sits at the right end of
 * the tab row on one line (control, then a short caption), no taller than the
 * tabs, with the tabs' underline running beneath it too — so the tabs sit at the
 * same height whether or not a page has the aside. On smaller screens it sits in
 * one line above the tabs.
 */
export default function TabsWithAside({ tabs, aside }: { tabs: React.ReactNode; aside?: React.ReactNode }): React.JSX.Element {
  if (!aside) return <>{tabs}</>;
  return (
    <div className="flex flex-col-reverse gap-3 xl:flex-row xl:items-end xl:gap-0">
      <div className="min-w-0 xl:flex-1">{tabs}</div>
      <div className="flex items-center gap-3 xl:shrink-0 xl:border-b xl:border-border xl:pb-1 xl:pl-6">{aside}</div>
    </div>
  );
}
