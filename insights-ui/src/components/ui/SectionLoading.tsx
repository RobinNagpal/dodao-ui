import { cn } from '@/lib/utils';
import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';
import React from 'react';

export interface SectionLoadingProps {
  className?: string;
}

/**
 * The app's standard loader (same icon as `FullPageLoader`), centered inside a
 * single section instead of covering the whole screen.
 */
export default function SectionLoading({ className }: SectionLoadingProps): React.JSX.Element {
  return (
    <div role="status" className={cn('flex justify-center py-12', className)}>
      <ArrowPathRoundedSquareIcon className="h-12 w-12 animate-spin primary-color" aria-hidden="true" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
