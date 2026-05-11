import Link from 'next/link';
import type { ReactNode } from 'react';

export interface ChapterToolLink {
  href: string;
  label: string;
  description: string;
  icon: ReactNode;
  // Tailwind color stem (e.g. "indigo", "emerald"). Used for chip tinting so multiple tools
  // get a subtle visual distinction without going off-palette.
  tone?: 'indigo' | 'emerald';
}

interface ChapterToolsBarProps {
  links: ChapterToolLink[];
}

const TONE_CLASSES: Record<NonNullable<ChapterToolLink['tone']>, string> = {
  indigo: 'bg-indigo-500/10 text-indigo-300 ring-indigo-500/30 hover:bg-indigo-500/20 hover:text-indigo-200',
  emerald: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30 hover:bg-emerald-500/20 hover:text-emerald-200',
};

// Compact in-card "Tools for this chapter" bar. Renders as a horizontal pill row at the top of the
// chapter article card — lighter than the full TariffCrossLinks grid so it doesn't compete with
// the article body for attention while still giving quick access to the Tariff Calculator and the
// HTS chapter browser.
export default function ChapterToolsBar({ links }: ChapterToolsBarProps): JSX.Element | null {
  if (links.length === 0) return null;
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-lg border border-gray-700/60 bg-gray-800/40 px-3 py-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Tools for this chapter</span>
      <span aria-hidden className="text-gray-600">
        ·
      </span>
      {links.map((link) => {
        const tone = link.tone ?? 'indigo';
        return (
          <Link
            key={link.href}
            href={link.href}
            title={link.description}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-colors sm:text-sm ${TONE_CLASSES[tone]}`}
          >
            <span className="flex h-4 w-4 shrink-0 items-center justify-center">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
