'use client';

import PrivateWrapper from '@/components/auth/PrivateWrapper';
import React from 'react';

interface AdminOnlyUpdatedAtProps {
  updatedAt: Date | string | null | undefined;
  className?: string;
  prefix?: string;
  withSeparator?: boolean;
}

export default function AdminOnlyUpdatedAt({ updatedAt, className, prefix = 'Updated', withSeparator = false }: AdminOnlyUpdatedAtProps): JSX.Element | null {
  if (!updatedAt) return null;

  const date = new Date(updatedAt);
  const formatted = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <PrivateWrapper>
      <span className={className ?? 'text-xs text-muted-foreground'}>
        {withSeparator && <span className="mr-2">•</span>}
        {prefix}{' '}
        <time dateTime={date.toISOString()} itemProp="dateModified">
          {formatted}
        </time>
      </span>
    </PrivateWrapper>
  );
}
