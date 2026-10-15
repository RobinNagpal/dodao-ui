'use client';

import { useEffect, useRef, useState } from 'react';

export type HeroClip = {
  src: string;
  poster: string;
  label: string;
  caption: string;
};

const CLIP_SECONDS = 7;

/**
 * Full-bleed background that cross-fades between robot clips, with a tab per
 * clip along the bottom showing progress. Viewers can pick a clip; with
 * reduced motion it stays on the first clip's still frame.
 */
export default function HeroClips({ clips }: { clips: HeroClip[] }) {
  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(query.matches);
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  // Play only the active clip; advance on a timer unless motion is reduced.
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === active && !reducedMotion) {
        video.currentTime = 0;
        video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    });
    if (reducedMotion) return;
    const timer = window.setTimeout(() => setActive((i) => (i + 1) % clips.length), CLIP_SECONDS * 1000);
    return () => window.clearTimeout(timer);
  }, [active, reducedMotion, clips.length]);

  return (
    <>
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        {clips.map((clip, index) => (
          <video
            key={clip.src}
            ref={(el) => {
              videoRefs.current[index] = el;
            }}
            muted
            loop
            playsInline
            preload={index === 0 ? 'auto' : 'metadata'}
            poster={clip.poster}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${index === active ? 'opacity-100' : 'opacity-0'}`}
          >
            <source src={clip.src} type="video/mp4" />
          </video>
        ))}
      </div>

      <div role="tablist" aria-label="Robot footage" className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
        {clips.map((clip, index) => {
          const selected = index === active;
          return (
            <button
              key={clip.src}
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(index)}
              className="group text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              <span className="relative block h-0.5 overflow-hidden rounded-full bg-on-viewport/20">
                {selected && (
                  <span
                    key={`${active}-${reducedMotion}`}
                    className={`absolute inset-0 bg-accent ${reducedMotion ? '' : 'dodao-progress'}`}
                    style={reducedMotion ? undefined : { animationDuration: `${CLIP_SECONDS}s` }}
                  />
                )}
              </span>
              <span className={`mt-3 block text-sm font-semibold ${selected ? 'text-on-viewport' : 'text-on-viewport-muted group-hover:text-on-viewport'}`}>
                {clip.label}
              </span>
              <span className="mt-0.5 hidden text-xs text-on-viewport-muted sm:block">{clip.caption}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
