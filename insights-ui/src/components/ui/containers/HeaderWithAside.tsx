import { cn } from '@/lib/utils';
import React from 'react';

export interface HeaderWithAsideProps {
  /** Title + description on the left. */
  children: React.ReactNode;
  /** Highlighted content pinned to the right (drops below on mobile). */
  aside?: React.ReactNode;
  /** Bottom border + padding under the header. Defaults to true. */
  bordered?: boolean;
  /** Vertical alignment of the two sides on wider screens. Defaults to center. */
  align?: 'center' | 'start';
  className?: string;
}

/** Page header with a prominent item (e.g. a balance) beside the title instead of on its own row. */
export default function HeaderWithAside({ children, aside, bordered = true, align = 'center', className }: HeaderWithAsideProps): React.JSX.Element {
  return (
    <header
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:justify-between sm:gap-8',
        align === 'start' ? 'sm:items-start' : 'sm:items-center',
        bordered && 'border-b border-border pb-6',
        className
      )}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {/* Capped at half the row beside the content, so a long aside (e.g. a multi-part rate) wraps instead of crowding it out. */}
      {aside && <div className="shrink-0 sm:max-w-[50%] sm:text-right">{aside}</div>}
    </header>
  );
}
