'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * Triggers when the attached element comes within `rootMargin` of the
 * viewport. The observer disconnects after the first hit, so once a heavy
 * component has mounted it stays mounted (no re-mounting on scroll).
 *
 * Pass the ref to a wrapper that reserves the eventual component's layout
 * (a skeleton with the same dimensions). When `inView` flips true, swap the
 * skeleton for the real component — that's when its `dynamic()` chunk
 * actually fetches and chart.js / framer-motion / etc. begin parsing.
 *
 * Default 200 px margin gives mobile networks a little lead time to fetch
 * the chunk before the user scrolls the element fully on screen.
 */
export function useInView<T extends Element = HTMLDivElement>(rootMargin: string = '200px'): { ref: RefObject<T>; inView: boolean } {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView) return;
    const el = ref.current;
    if (!el) return;

    // IntersectionObserver is supported everywhere we ship; the conditional
    // below is just a defensive fallback for ancient browsers and the
    // happens-to-be-server-side render path. Mounting immediately in those
    // cases preserves current behavior.
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, rootMargin]);

  return { ref, inView };
}
