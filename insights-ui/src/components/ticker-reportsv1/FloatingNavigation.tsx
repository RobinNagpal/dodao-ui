'use client';

import * as React from 'react';
import { Bars3Icon, XMarkIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

/* ───────────────────────────── Types ───────────────────────────── */

export interface NavigationSubsection {
  readonly id: string;
  readonly title: string;
}

export interface NavigationSection {
  readonly id: string;
  readonly title: string;
  /** If omitted, treated as true. */
  readonly hasContent?: boolean;
  readonly subsections?: ReadonlyArray<NavigationSubsection>;
}

export interface FloatingNavigationProps {
  /** Sections to render. */
  readonly sections: ReadonlyArray<NavigationSection>;
  /** Title shown in header / handle. Default: "Navigation". */
  readonly title?: string;
  /** Docked panel width in px (must match Tailwind width). Default: 384 (w-96). */
  readonly dockWidthPxXL?: number;
  /** Minimum right-side gap (px) required to consider docking non-overlapping. Default: 16. */
  readonly dockMinGapPxXL?: number;
  /** Offset (px) for smooth-scroll to anchors. Default: 80. */
  readonly scrollOffsetPx?: number;
}

/* ───────────────────────────── Constants ───────────────────────────── */

const XL_MIN_WIDTH_PX = 1280 as const; // Tailwind 'xl'
const DEFAULT_DOCK_WIDTH_PX = 384 as const; // Tailwind w-96
const DEFAULT_DOCK_MIN_GAP_PX = 16 as const; // breathing room between content and dock
const DEFAULT_SCROLL_OFFSET_PX = 80 as const;
const NAV_ROLE_LABEL = 'Navigation' as const;

/* ───────────────────────────── Utilities ───────────────────────────── */

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

function getIsXLNow(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(`(min-width: ${XL_MIN_WIDTH_PX}px)`).matches;
}

/** Match-media hook with immediate initial value (no flicker). */
function useIsXL(): boolean {
  const [isXL, setIsXL] = React.useState<boolean>(getIsXLNow);

  React.useEffect(() => {
    const mql: MediaQueryList = window.matchMedia(`(min-width: ${XL_MIN_WIDTH_PX}px)`);
    const handler = (e: MediaQueryListEvent): void => setIsXL(e.matches);
    if (mql.matches !== isXL) setIsXL(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isXL;
}

/** Build a flat list of anchor targets from sections. */
function computeTargets(sections: ReadonlyArray<NavigationSection>): ReadonlyArray<{ readonly id: string }> {
  const targets: Array<{ readonly id: string }> = [];
  for (const s of sections) {
    if (s.hasContent === false) continue;
    targets.push({ id: s.id });
    if (s.subsections) {
      for (const sub of s.subsections) targets.push({ id: sub.id });
    }
  }
  return targets;
}

/* ───────────────────────────── Component ───────────────────────────── */

export default function FloatingNavigation(props: FloatingNavigationProps): JSX.Element | null {
  const {
    sections,
    title = NAV_ROLE_LABEL,
    dockWidthPxXL = DEFAULT_DOCK_WIDTH_PX,
    dockMinGapPxXL = DEFAULT_DOCK_MIN_GAP_PX,
    scrollOffsetPx = DEFAULT_SCROLL_OFFSET_PX,
  } = props;

  // Only render when there’s something to show.
  const visibleSections: ReadonlyArray<NavigationSection> = React.useMemo(() => sections.filter((s) => s.hasContent !== false), [sections]);
  if (visibleSections.length === 0) return null;

  const isXL: boolean = useIsXL();

  /** Root ref (to traverse up to the container when measuring). */
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  /**
   * Determine whether we can dock the panel on the right without overlapping
   * the centered content (inside element with `max-w-7xl`).
   */
  const [canDock, setCanDock] = React.useState<boolean>(false);

  const measureCanDock = React.useCallback((): void => {
    if (typeof window === 'undefined') return;

    // 1) Find the nearest ancestor with .max-w-7xl (from our root), else fall back to any on the page.
    const findContainer = (): HTMLElement | null => {
      let node: HTMLElement | null = rootRef.current?.parentElement ?? null;
      while (node) {
        if (node.classList.contains('max-w-7xl')) return node;
        node = node.parentElement;
      }
      return (document.querySelector('.max-w-7xl') as HTMLElement | null) ?? null;
    };

    const containerEl: HTMLElement | null = findContainer();
    if (!containerEl) {
      // Be conservative: if we can't find the container, assume cannot dock (avoid surprise overlap).
      setCanDock(false);
      return;
    }

    const rect: DOMRect = containerEl.getBoundingClientRect();
    const viewportWidth: number = window.innerWidth;

    // Available space to the right of the container.
    const availableRightPx: number = Math.max(0, viewportWidth - Math.ceil(rect.right));

    // Docking is safe when there's enough right-side space for the panel plus a small gap.
    const canDockNow: boolean = availableRightPx >= dockWidthPxXL + dockMinGapPxXL;
    setCanDock(canDockNow);
  }, [dockWidthPxXL, dockMinGapPxXL]);

  // Recompute on mount and whenever viewport/container size changes.
  React.useEffect(() => {
    measureCanDock();

    // Listen to window resizes.
    const onResize = (): void => measureCanDock();
    window.addEventListener('resize', onResize);

    // Observe the container element for layout changes (padding, width changes from breakpoints).
    let ro: ResizeObserver | null = null;
    const container: Element | null = ((): Element | null => {
      // Use the same lookup as measureCanDock to attach observer.
      let node: HTMLElement | null = rootRef.current?.parentElement ?? null;
      while (node) {
        if (node.classList.contains('max-w-7xl')) return node;
        node = node.parentElement;
      }
      return document.querySelector('.max-w-7xl');
    })();

    if (container && 'ResizeObserver' in window) {
      ro = new ResizeObserver(() => measureCanDock());
      ro.observe(container);
    }

    return () => {
      window.removeEventListener('resize', onResize);
      if (ro && container) ro.unobserve(container);
    };
  }, [measureCanDock]);

  // Open state: open by default only if (isXL && canDock). Respect user toggles afterward.
  const [isOpen, setIsOpen] = React.useState<boolean>(() => getIsXLNow() && false); // initial false; will auto-open below if allowed
  const userToggledRef = React.useRef<boolean>(false);

  React.useEffect(() => {
    if (isXL && canDock && !userToggledRef.current) {
      setIsOpen(true);
    }
    if ((!isXL || !canDock) && !userToggledRef.current) {
      setIsOpen(false);
    }
  }, [isXL, canDock]);

  const open = React.useCallback((): void => {
    userToggledRef.current = true;
    setIsOpen(true);
  }, []);
  const close = React.useCallback((): void => {
    userToggledRef.current = true;
    setIsOpen(false);
  }, []);

  // Active section indicator via IntersectionObserver (no scroll polling).
  const [activeId, setActiveId] = React.useState<string>('');
  const targets = React.useMemo(() => computeTargets(visibleSections), [visibleSections]);

  React.useEffect(() => {
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries: ReadonlyArray<IntersectionObserverEntry>) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = (visible[0].target as HTMLElement).id;
          if (id && id !== activeId) setActiveId(id);
        }
      },
      {
        root: null,
        rootMargin: `-${scrollOffsetPx}px 0px -60% 0px`,
        threshold: [0, 0.1, 0.5, 1],
      }
    );

    const observed: HTMLElement[] = [];
    for (const t of targets) {
      const el = document.getElementById(t.id);
      if (el) {
        observer.observe(el);
        observed.push(el);
      }
    }

    return () => {
      for (const el of observed) observer.unobserve(el);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targets, scrollOffsetPx]);

  // Smooth anchor scroll (closes overlay on small/undocked screens)
  const scrollToId = React.useCallback(
    (id: string): void => {
      const el: HTMLElement | null = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.pageYOffset - scrollOffsetPx;
      window.scrollTo({ top, behavior: 'smooth' });

      // Close only when not in docked mode.
      if (!(isXL && canDock)) close();
    },
    [close, isXL, canDock, scrollOffsetPx]
  );

  /* ───────────────────────────── Render ───────────────────────────── */

  const isDocked: boolean = isXL && canDock;

  // XL handle (compact) shows when docked-but-closed OR undocked (overlap) and closed.
  const handleButton: JSX.Element | null =
    isXL && !isOpen ? (
      <button
        type="button"
        aria-label="Open navigation"
        onClick={open}
        className="fixed top-24 right-4 z-40 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-full shadow-md transition-all duration-200 flex items-center gap-2"
      >
        <Bars3Icon className="h-5 w-5" />
        <span className="text-sm font-medium">{title}</span>
      </button>
    ) : null;

  // FAB for smaller screens (or any non-XL viewport).
  const fabMobile: JSX.Element | null = !isXL ? (
    <button
      type="button"
      aria-label="Open navigation"
      onClick={open}
      className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2"
    >
      <Bars3Icon className="h-6 w-6" />
      <span className="font-medium">{title}</span>
    </button>
  ) : null;

  // Backdrop only for overlay mode (non-docked) when open.
  const backdrop: JSX.Element | null =
    !isDocked && isOpen ? <button type="button" aria-label="Close navigation backdrop" className="fixed inset-0 z-40 bg-black/50" onClick={close} /> : null;

  // Panel: docked (no content push) if isDocked; otherwise overlay slide-in.
  const panelRole: 'dialog' | 'complementary' = isDocked ? 'complementary' : 'dialog';
  const panelAriaModal: boolean = !isDocked && isOpen;

  const panel: JSX.Element = (
    <div
      ref={rootRef}
      role={panelRole}
      aria-label={title}
      aria-modal={panelAriaModal}
      className={cx(
        'z-50 bg-gray-900 text-white border-l border-gray-700 shadow-xl',
        'w-96 max-w-md', // keep in sync with dockWidthPxXL
        isDocked
          ? // Docked right, visible only when open
            'fixed top-24 right-0 bottom-6'
          : // Overlay slide-in
            'fixed inset-y-0 right-0 transform transition-transform duration-300 ease-in-out',
        isDocked ? (isOpen ? '' : 'pointer-events-none invisible') : isOpen ? 'translate-x-0' : 'translate-x-full'
      )}
      style={{ width: dockWidthPxXL }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button type="button" aria-label="Close navigation" onClick={close} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Items */}
      <nav className="h-full overflow-y-auto p-4" aria-label={`${title} sections`}>
        <ul className="space-y-2">
          {visibleSections.map((s: NavigationSection) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={(): void => scrollToId(s.id)}
                className={cx(
                  'w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 flex items-center justify-between group',
                  activeId === s.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 text-gray-300 hover:text-white'
                )}
                aria-current={activeId === s.id ? 'true' : undefined}
              >
                <span className="font-medium">{s.title}</span>
                <ChevronRightIcon className="h-4 w-4 opacity-60 group-hover:opacity-100" />
              </button>

              {Array.isArray(s.subsections) && s.subsections.length > 0 && (
                <ul className="ml-4 mt-2 space-y-1">
                  {s.subsections.map((sub: NavigationSubsection) => (
                    <li key={sub.id}>
                      <button
                        type="button"
                        onClick={(): void => scrollToId(sub.id)}
                        className={cx(
                          'w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors duration-200 flex items-center justify-between group',
                          activeId === sub.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-800 text-gray-400 hover:text-gray-200'
                        )}
                        aria-current={activeId === sub.id ? 'true' : undefined}
                      >
                        <span>{sub.title}</span>
                        <ChevronRightIcon className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer hint */}
      <div className="p-4 border-t border-gray-700">
        <p className="text-sm text-gray-400 text-center">Click a section to jump</p>
      </div>
    </div>
  );

  return (
    <>
      {handleButton}
      {fabMobile}
      {backdrop}
      {panel}
    </>
  );
}
