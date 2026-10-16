'use client';

import { useEffect, useRef, useState } from 'react';

interface LoopingVideoProps {
  src: string;
  label: string;
  poster?: string;
  className?: string;
}

/**
 * Muted, looping clip for robot footage. Plays automatically unless the
 * viewer prefers reduced motion — then it stays paused with controls shown.
 */
export default function LoopingVideo({ src, label, poster, className = 'block h-auto w-full' }: LoopingVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      setReducedMotion(query.matches);
      if (query.matches) ref.current?.pause();
      else ref.current?.play().catch(() => undefined);
    };
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  return (
    <video ref={ref} autoPlay loop muted playsInline preload="metadata" poster={poster} controls={reducedMotion} aria-label={label} className={className}>
      <source src={src} type="video/mp4" />
    </video>
  );
}
