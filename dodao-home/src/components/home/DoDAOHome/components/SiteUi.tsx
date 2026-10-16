import { ReactNode } from 'react';

/**
 * Small shared pieces for dodao.io pages. Colors come from theme tokens, so
 * the same classes work on the navy base and inside `dodao-light` sections.
 */

type ActionLinkProps = {
  href: string;
  children: ReactNode;
  /** `inverse` (solid white) and `onColor` (outline) are for use on primary-blue panels and over footage. */
  variant?: 'primary' | 'secondary' | 'inverse' | 'onColor';
  size?: 'md' | 'lg';
  external?: boolean;
  className?: string;
};

const actionVariants = {
  primary: 'bg-primary text-primary-text shadow-[0_8px_24px_-8px_rgb(var(--primary-rgb)/0.7)] hover:bg-primary/90',
  inverse: 'bg-primary-text text-primary hover:bg-primary-text/90',
  onColor: 'bg-primary-text/10 text-primary-text ring-1 ring-inset ring-primary-text/40 backdrop-blur hover:bg-primary-text/20',
  secondary: 'bg-heading/5 text-heading ring-1 ring-inset ring-heading/20 backdrop-blur hover:bg-heading/10 hover:ring-heading/40',
};

const actionSizes = {
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
};

export function ActionLink({ href, children, variant = 'primary', size = 'md', external, className = '' }: ActionLinkProps) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${actionVariants[variant]} ${actionSizes[size]} ${className}`}
    >
      {children}
    </a>
  );
}

type SectionIntroProps = {
  title: ReactNode;
  lead?: ReactNode;
  /** Short label naming the section's topic, shown above the title. */
  kicker?: string;
  align?: 'left' | 'center';
  children?: ReactNode;
};

export function SectionIntro({ title, lead, kicker, align = 'left', children }: SectionIntroProps) {
  const centered = align === 'center';
  return (
    <div className={centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      {kicker && (
        <p className={`flex items-center gap-3 text-sm font-medium text-accent ${centered ? 'justify-center' : ''}`}>
          <span className="h-px w-8 bg-accent" aria-hidden="true" />
          {kicker}
        </p>
      )}
      <h2 className={`font-display text-3xl font-semibold leading-[1.08] text-heading sm:text-4xl lg:text-5xl ${kicker ? 'mt-4' : ''}`}>{title}</h2>
      {lead && <p className="mt-5 text-lg leading-8 text-body">{lead}</p>}
      {children}
    </div>
  );
}
