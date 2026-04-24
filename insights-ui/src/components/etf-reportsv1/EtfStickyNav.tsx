'use client';

import * as React from 'react';

export interface EtfStickyNavItem {
  readonly id: string;
  readonly label: string;
}

export interface EtfStickyNavProps {
  readonly items: ReadonlyArray<EtfStickyNavItem>;
  /** Offset applied when smooth-scrolling to an anchor so the sticky nav doesn't cover the heading. */
  readonly scrollOffsetPx?: number;
}

const DEFAULT_SCROLL_OFFSET_PX = 80 as const;

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Horizontal sticky anchor nav for long ETF detail pages.
 *
 * - Sticks to the top of the scroll container on all breakpoints.
 * - Pills are horizontally scrollable on narrow screens (scrollbar hidden).
 * - The active pill is tracked via IntersectionObserver and auto-centered in the rail.
 * - Items whose target element is not present in the DOM are filtered out after mount,
 *   so the server can safely pass the full list of potential sections.
 */
export default function EtfStickyNav({ items, scrollOffsetPx = DEFAULT_SCROLL_OFFSET_PX }: EtfStickyNavProps): JSX.Element | null {
  const [visibleItems, setVisibleItems] = React.useState<ReadonlyArray<EtfStickyNavItem>>([]);
  const [activeId, setActiveId] = React.useState<string>('');
  const navRailRef = React.useRef<HTMLDivElement | null>(null);

  // Filter down to sections that actually rendered on the page.
  React.useEffect(() => {
    const present: EtfStickyNavItem[] = [];
    for (const it of items) {
      if (document.getElementById(it.id)) present.push(it);
    }
    setVisibleItems(present);
    if (present.length > 0) setActiveId(present[0].id);
  }, [items]);

  // Track which section is currently in view.
  React.useEffect(() => {
    if (visibleItems.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (intersecting.length > 0) {
          const topId = (intersecting[0].target as HTMLElement).id;
          if (topId) setActiveId(topId);
          return;
        }

        // Nothing inside the viewport band — pick the last section scrolled past.
        const scrollY = window.scrollY + scrollOffsetPx + 1;
        let fallbackId = '';
        for (const it of visibleItems) {
          const el = document.getElementById(it.id);
          if (!el) continue;
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (top <= scrollY) fallbackId = it.id;
        }
        if (fallbackId) setActiveId(fallbackId);
      },
      {
        root: null,
        rootMargin: `-${scrollOffsetPx + 8}px 0px -55% 0px`,
        threshold: [0, 0.25, 0.5, 1],
      }
    );

    const observed: HTMLElement[] = [];
    for (const it of visibleItems) {
      const el = document.getElementById(it.id);
      if (el) {
        observer.observe(el);
        observed.push(el);
      }
    }
    return () => {
      for (const el of observed) observer.unobserve(el);
      observer.disconnect();
    };
  }, [visibleItems, scrollOffsetPx]);

  // Keep the active pill centered within the horizontal rail on narrow screens.
  React.useEffect(() => {
    if (!navRailRef.current || !activeId) return;
    const pill = navRailRef.current.querySelector<HTMLElement>(`[data-nav-id="${activeId}"]`);
    if (!pill) return;
    const rail = navRailRef.current;
    const pillCenter = pill.offsetLeft + pill.offsetWidth / 2;
    const railCenter = rail.clientWidth / 2;
    rail.scrollTo({ left: Math.max(0, pillCenter - railCenter), behavior: 'smooth' });
  }, [activeId]);

  const scrollToId = React.useCallback(
    (id: string): void => {
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.pageYOffset - scrollOffsetPx;
      window.scrollTo({ top, behavior: 'smooth' });
    },
    [scrollOffsetPx]
  );

  if (visibleItems.length === 0) return null;

  return (
    <div
      className={cx('sticky top-0 z-30 -mx-1 sm:-mx-2 mb-6', 'border-y border-gray-800 bg-gray-950/85 backdrop-blur supports-[backdrop-filter]:bg-gray-950/70')}
      role="navigation"
      aria-label="On this page"
    >
      <div
        ref={navRailRef}
        className={cx(
          'flex gap-1 overflow-x-auto px-3 sm:px-4 py-2',
          'snap-x',
          '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
        )}
      >
        {visibleItems.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              data-nav-id={item.id}
              onClick={(): void => scrollToId(item.id)}
              aria-current={isActive ? 'true' : undefined}
              className={cx(
                'whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150 snap-start',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white border border-transparent hover:border-gray-700'
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
