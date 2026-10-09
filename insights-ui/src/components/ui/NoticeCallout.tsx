import { badgeTone } from '@/components/ui/badges/badgeTone';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

/**
 * A short boxed notice in one of the badge tones — e.g. a "this data may be out
 * of date" warning above a calculator result. Color comes from `badgeTone`
 * (with its light-mode `badge-tone-*` hook); the box only adds shape and spacing.
 * Compose `Text` / `TextLink` inside it.
 */
const noticeCallout = cva('rounded-lg px-3 py-2 text-sm', {
  variants: {
    tone: {
      warning: badgeTone({ tone: 'warning' }),
      info: badgeTone({ tone: 'info' }),
      neutral: badgeTone({ tone: 'neutral' }),
    },
  },
  defaultVariants: { tone: 'info' },
});

export type NoticeCalloutProps = VariantProps<typeof noticeCallout> & {
  children: React.ReactNode;
  className?: string;
};

export default function NoticeCallout({ tone, children, className }: NoticeCalloutProps): React.JSX.Element {
  return (
    <div role={tone === 'warning' ? 'alert' : 'status'} className={cn(noticeCallout({ tone }), className)}>
      {children}
    </div>
  );
}
