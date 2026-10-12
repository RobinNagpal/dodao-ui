'use client';

import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React, { useEffect, useRef, useState } from 'react';

/**
 * Sideways-scrolling box for a row of tab links. On load it scrolls so the
 * current tab (`aria-current="page"`) is in view; otherwise on a phone a
 * later tab would start hidden off the right edge.
 *
 * While tabs are hidden past an edge, that edge fades into the page background
 * so the row reads as scrollable (phones hide the scrollbar). Each fade goes
 * away once that end is reached.
 */

const fade = cva('pointer-events-none absolute inset-y-0 w-10 from-bg to-transparent transition-opacity duration-200', {
  variants: {
    side: { start: 'left-0 bg-gradient-to-r', end: 'right-0 bg-gradient-to-l' },
    visible: { true: 'opacity-100', false: 'opacity-0' },
  },
});

export default function ActiveTabScroller({ children, className }: { children: React.ReactNode; className?: string }): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [hiddenStart, setHiddenStart] = useState(false);
  const [hiddenEnd, setHiddenEnd] = useState(false);

  useEffect(() => {
    const box = ref.current;
    if (!box) return;

    const active = box.querySelector<HTMLElement>('[aria-current="page"]');
    if (active && box.scrollWidth > box.clientWidth) {
      // Center the active tab where possible; the browser clamps scrollLeft to the valid range.
      box.scrollLeft = active.offsetLeft - (box.clientWidth - active.offsetWidth) / 2;
    }

    // 1px tolerance: scrollLeft can land on a fraction short of the end on high-DPI screens.
    const updateFades = (): void => {
      setHiddenStart(box.scrollLeft > 1);
      setHiddenEnd(box.scrollLeft + box.clientWidth < box.scrollWidth - 1);
    };
    updateFades();

    box.addEventListener('scroll', updateFades, { passive: true });
    const resizeObserver = new ResizeObserver(updateFades);
    resizeObserver.observe(box);
    return () => {
      box.removeEventListener('scroll', updateFades);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className={cn('relative', className)}>
      {/* `relative` keeps the active tab's offsetLeft measured from this scroll box. */}
      <div ref={ref} className="relative overflow-x-auto">
        {children}
      </div>
      <div aria-hidden="true" className={fade({ side: 'start', visible: hiddenStart })} />
      <div aria-hidden="true" className={fade({ side: 'end', visible: hiddenEnd })} />
    </div>
  );
}
