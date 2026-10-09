'use client';

import { cn } from '@/lib/utils';
import React, { useEffect, useRef } from 'react';

/**
 * Sideways-scrolling box for a row of tab links. On load it scrolls so the
 * current tab (`aria-current="page"`) is in view; otherwise on a phone a
 * later tab would start hidden off the right edge.
 */
export default function ActiveTabScroller({ children, className }: { children: React.ReactNode; className?: string }): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = ref.current;
    const active = box?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!box || !active || box.scrollWidth <= box.clientWidth) return;
    // Center the active tab where possible; the browser clamps scrollLeft to the valid range.
    box.scrollLeft = active.offsetLeft - (box.clientWidth - active.offsetWidth) / 2;
  }, []);

  return (
    <div ref={ref} className={cn('relative overflow-x-auto', className)}>
      {children}
    </div>
  );
}
