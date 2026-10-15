'use client';

import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

export type HeroClip = {
  src: string;
  poster: string;
  label: string;
  caption: string;
  /** Shown in the hero badge while this clip plays: what we do in that kind of work. */
  tag: string;
};

const CLIP_SECONDS = 7;

type HeroClipsState = {
  clips: HeroClip[];
  active: number;
  setActive: (index: number) => void;
  reducedMotion: boolean;
};

const HeroClipsContext = createContext<HeroClipsState | null>(null);

function useHeroClips() {
  const state = useContext(HeroClipsContext);
  if (!state) throw new Error('HeroClipTag and HeroClipTabs must be rendered inside HeroClips');
  return state;
}

/**
 * Full-bleed background that cross-fades between robot clips. The badge
 * (`HeroClipTag`) and the tab row (`HeroClipTabs`) rendered inside it follow
 * the active clip. With reduced motion it stays on the first clip's still frame.
 */
export default function HeroClips({ clips, children }: { clips: HeroClip[]; children: ReactNode }) {
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
    <HeroClipsContext.Provider value={{ clips, active, setActive, reducedMotion }}>
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
      {children}
    </HeroClipsContext.Provider>
  );
}

/** The badge above the headline; its text changes with the active clip. */
export function HeroClipTag() {
  const { clips, active } = useHeroClips();
  return (
    <p className="inline-flex items-center gap-2 rounded-full bg-on-viewport/10 px-3 py-1 text-sm text-on-viewport ring-1 ring-inset ring-on-viewport/20 backdrop-blur">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
      <span key={active} className="dodao-fade-in">
        {clips[active].tag}
      </span>
    </p>
  );
}

/** One tab per clip along the bottom of the hero, with a progress bar on the active one. */
export function HeroClipTabs() {
  const { clips, active, setActive, reducedMotion } = useHeroClips();
  return (
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
  );
}
