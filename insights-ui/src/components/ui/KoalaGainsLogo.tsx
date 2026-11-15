'use client';

import { usePageTheme } from '@/components/theme/page-theme-context';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';

/**
 * The full "KoalaGains by DoDAO" wordmark. The PNG bakes "KoalaGains" in white, so light mode
 * swaps in `koalagain_logo_light.png` — the same image with that text recolored dark.
 */
export default function KoalaGainsLogo({ className }: { className?: string }): React.JSX.Element {
  const isDark = usePageTheme() === 'dark';
  return (
    <Image
      alt="KoalaGains logo"
      src={isDark ? '/koalagain_logo.png' : '/koalagain_logo_light.png'}
      className={cn('h-8 w-auto', className)}
      width={160}
      height={32}
    />
  );
}
