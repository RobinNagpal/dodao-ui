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
  /** Extra click handler, e.g. to close the mobile drawer before navigating. */
  onClick?: () => void;
  className?: string;
};

/**
 * Navbar pill for report credits, linking to the credits page. Signed in it
 * shows the balance; signed out it invites the visitor to buy (the credits page
 * shows the packs and asks them to log in only when they click Buy).
 */
export default function CreditsNavLink({ credits, onClick, variant, className }: CreditsNavLinkProps): React.JSX.Element {
  return (
    <Link href="/credits" onClick={onClick} className={cn(creditsNavLink({ variant }), className)}>
      {credits === undefined ? 'Buy Credits' : `Credits: ${credits === null ? '—' : credits}`}
    </Link>
  );
}
