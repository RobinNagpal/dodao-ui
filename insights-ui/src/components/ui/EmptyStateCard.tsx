import Link from 'next/link';
import React from 'react';

export type EmptyStateCardVariant = 'card' | 'inline';

interface EmptyStateCardProps {
  /** Heading shown above the description. */
  title?: string;
  /** Supporting text shown below the title. */
  description?: string;
  /** Optional icon component rendered above the title (card variant only). */
  icon?: React.ComponentType<{ className?: string }>;
  /** Optional call-to-action link target. */
  ctaHref?: string;
  /** Label for the call-to-action link. */
  ctaLabel?: string;
  /**
   * `card` renders a padded `bg-surface rounded-lg p-8 text-center` box with an optional
   * icon, title, description and CTA. `inline` renders lightweight centered text intended for
   * the simple grid "no results" messages.
   */
  variant?: EmptyStateCardVariant;
  className?: string;
}

/**
 * Reusable placeholder for "no data / empty" states across Insights-UI.
 */
export default function EmptyStateCard({
  title,
  description,
  icon: Icon,
  ctaHref,
  ctaLabel,
  variant = 'card',
  className = '',
}: EmptyStateCardProps): React.JSX.Element {
  if (variant === 'inline') {
    return (
      <div className={`text-center py-12${className ? ` ${className}` : ''}`}>
        {title && <p className="text-body text-lg">{title}</p>}
        {description && <p className="text-body text-sm mt-2">{description}</p>}
      </div>
    );
  }

  return (
    <div className={`bg-surface rounded-lg p-8 text-center${className ? ` ${className}` : ''}`}>
      {Icon && <Icon className="w-16 h-16 text-muted mx-auto mb-4" />}
      {title && <h3 className="text-xl font-semibold mb-2">{title}</h3>}
      {description && <p className="text-muted mb-4">{description}</p>}
      {ctaHref && ctaLabel && (
        <Link
          href={ctaHref}
          className="inline-flex items-center px-5 py-2.5 bg-primary hover:opacity-90 transition-colors rounded-lg text-primary-text text-sm font-semibold"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
