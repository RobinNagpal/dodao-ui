import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

export interface CreditsNavLinkProps {
  credits: number;
  className?: string;
}

/** Navbar pill showing the user's balance; links to the credits page. */
export default function CreditsNavLink({ credits, className }: CreditsNavLinkProps): React.JSX.Element {
  return (
    <Link
      href="/credits"
      className={cn(
        'whitespace-nowrap rounded-full border border-border px-3 py-1 text-sm/6 font-semibold text-heading transition-colors hover:border-primary hover:text-link',
        className
      )}
    >
      Credits: {credits}
    </Link>
  );
}
