import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Typographic body wrapper (`prose prose-invert max-w-none`) for long-form
 * report content. Owns the prose chrome so report bodies don't hand-write it.
 */
export type ProseProps = { children: React.ReactNode; className?: string };

export default function Prose({ children, className }: ProseProps): React.JSX.Element {
  return <div className={cn('prose prose-invert max-w-none', className)}>{children}</div>;
}
