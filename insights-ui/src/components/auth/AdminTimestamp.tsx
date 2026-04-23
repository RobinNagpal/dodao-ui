'use client';

import PrivateWrapper from '@/components/auth/PrivateWrapper';

interface AdminTimestampProps {
  date: Date | string | null | undefined;
  label?: string;
  className?: string;
}

export default function AdminTimestamp({ date, label = 'Updated', className }: AdminTimestampProps): JSX.Element | null {
  if (!date) return null;
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return null;

  return (
    <PrivateWrapper>
      <span className={className ?? 'text-xs text-gray-400'}>
        {label}: {d.toLocaleString('en-US')}
      </span>
    </PrivateWrapper>
  );
}
