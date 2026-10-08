import Link from 'next/link';
import type { ReactNode } from 'react';

export interface ToolPillLink {
  href: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  tone?: 'indigo' | 'emerald' | 'amber';
}

const TONE_CLASSES: Record<NonNullable<ToolPillLink['tone']>, string> = {
  indigo: 'bg-indigo-500/10 text-indigo-300 ring-indigo-500/30 hover:bg-indigo-500/20 hover:text-link',
  emerald: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30 hover:bg-emerald-500/20 hover:text-emerald-200',
  amber: 'bg-amber-500/10 text-amber-300 ring-amber-500/30 hover:bg-amber-500/20 hover:text-amber-200',
};

interface ToolPillsProps {
  links: ToolPillLink[];
  className?: string;
}

export default function ToolPills({ links, className }: ToolPillsProps): JSX.Element | null {
  if (links.length === 0) return null;
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ''}`}>
      {links.map((link) => {
        const tone = link.tone ?? 'indigo';
        return (
          <Link
            key={link.href}
            href={link.href}
            title={link.description}
            className={`tool-pill tone-${tone} inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-colors sm:text-sm ${TONE_CLASSES[tone]}`}
          >
            {link.icon && <span className="flex h-4 w-4 shrink-0 items-center justify-center">{link.icon}</span>}
            <span>{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
