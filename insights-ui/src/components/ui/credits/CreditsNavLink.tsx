import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

export interface CreditsNavLinkProps {
  /** The signed-in user's balance. Omit for a signed-out visitor to render the buy prompt instead. */
  credits?: number;
  /** Signed-out click handler — the caller opens the login prompt. Required for the signed-out form. */
  onBuyCreditsClick?: () => void;
  className?: string;
}

const pillClasses =
  'whitespace-nowrap rounded-full border border-border px-3 py-1 text-sm/6 font-semibold text-heading transition-colors hover:border-primary hover:text-link';

/**
 * Navbar pill for report credits. Signed in it shows the balance and links to
 * the credits page; signed out it invites the visitor to buy and hands the click
 * back to the caller, which has to get them logged in first.
 */
export default function CreditsNavLink({ credits, onBuyCreditsClick, className }: CreditsNavLinkProps): React.JSX.Element {
  if (credits === undefined) {
    return (
      <button type="button" onClick={onBuyCreditsClick} className={cn(pillClasses, 'cursor-pointer', className)}>
        Buy Credits
      </button>
    );
  }

  return (
    <Link href="/credits" className={cn(pillClasses, className)}>
      Credits: {credits}
    </Link>
  );
}
