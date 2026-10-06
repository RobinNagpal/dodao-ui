import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import React from 'react';

const creditsNavLink = cva('font-semibold text-heading', {
  variants: {
    /**
     * `pill`: the desktop navbar pill. `menu`: a full-width row in the mobile
     * nav drawer, matching the drawer's other links.
     */
    variant: {
      pill: 'whitespace-nowrap rounded-full border border-border px-3 py-1 text-sm/6 transition-colors hover:border-primary hover:text-link',
      menu: 'block w-full rounded-lg px-3 py-2 text-left text-base/7 hover:bg-surface dark:hover:bg-white/5',
    },
  },
  defaultVariants: { variant: 'pill' },
});

export type CreditsNavLinkProps = VariantProps<typeof creditsNavLink> & {
  /**
   * The signed-in user's balance; `null` when it couldn't be read (shown as
   * "—"). Omit for a signed-out visitor to render the buy prompt instead.
   */
  credits?: number | null;
  /** Signed-out click handler — the caller opens the login prompt. Required for the signed-out form. */
  onBuyCreditsClick?: () => void;
  className?: string;
};

/**
 * Navbar pill for report credits. Signed in it shows the balance and links to
 * the credits page; signed out it invites the visitor to buy and hands the click
 * back to the caller, which has to get them logged in first.
 */
export default function CreditsNavLink({ credits, onBuyCreditsClick, variant, className }: CreditsNavLinkProps): React.JSX.Element {
  if (credits === undefined) {
    return (
      <button type="button" onClick={onBuyCreditsClick} className={cn(creditsNavLink({ variant }), 'cursor-pointer', className)}>
        Buy Credits
      </button>
    );
  }

  return (
    <Link href="/credits" className={cn(creditsNavLink({ variant }), className)}>
      Credits: {credits === null ? '—' : credits}
    </Link>
  );
}
