import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

/**
 * Numbered one-column index for a long catalogue (e.g. the tariff reports by HTS chapter), in the
 * shape of the HTS code browser: groups with a heading, then one bordered list per group, one row
 * per entry. A row shows its number, a title linked to the entry (the link covers the whole row),
 * a right-aligned meta (e.g. the updated date), an optional summary and rows of small links to
 * the entry's sub-pages, optionally in named groups. The small links sit above the row-wide link so they keep their own targets.
 */

export function IndexListGroup({
  label,
  title,
  subtitle,
  children,
}: {
  label?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <section className="flex flex-col gap-4">
      <div className="border-b border-border pb-2">
        <h2 className="text-xl font-semibold text-primary">
          {label && <span className="mr-3 font-mono tabular-nums">{label}</span>}
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export function IndexList({ children, className }: { children: React.ReactNode; className?: string }): React.JSX.Element {
  return <ul className={cn('divide-y divide-border overflow-hidden rounded-lg border border-border bg-bg', className)}>{children}</ul>;
}

const SUB_LINK_CLASSES =
  'inline-flex min-h-8 items-center rounded-md border border-border px-2 text-xs font-medium text-muted transition-colors hover:border-primary hover:text-primary';

export interface IndexListLink {
  href: string;
  label: string;
}

/** A row of sub-page links, optionally named (e.g. "U.S. imports" / "U.S. exports" when an entry has two halves). */
export interface IndexListLinkGroup {
  label?: string;
  links: IndexListLink[];
}

export interface IndexListRowProps {
  /** Short code at the start of the row, e.g. "01". */
  number: string;
  title: React.ReactNode;
  href: string;
  /** Right of the title from `sm` up, under it on phones, e.g. "Updated Oct 9, 2026". */
  meta?: React.ReactNode;
  /** One or two lines about the entry; clamped to two lines. */
  summary?: React.ReactNode;
  linkGroups?: IndexListLinkGroup[];
  /** Accessible name for the row's links, e.g. "Chapter 01 report pages". */
  linksLabel?: string;
}

export function IndexListRow({ number, title, href, meta, summary, linkGroups, linksLabel }: IndexListRowProps): React.JSX.Element {
  const groups = (linkGroups ?? []).filter((group) => group.links.length > 0);
  return (
    <li className="group relative grid grid-cols-[2rem_1fr] gap-x-3 px-4 py-4 transition-colors hover:bg-surface-2/60 sm:grid-cols-[2.5rem_1fr]">
      <span className="pt-0.5 font-mono text-sm tabular-nums text-muted group-hover:text-primary">{number}</span>
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <h3 className="text-base font-semibold leading-snug text-heading">
            <Link
              href={href}
              className="transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-link focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-primary"
            >
              {title}
            </Link>
          </h3>
          {meta && <span className="shrink-0 whitespace-nowrap text-xs text-muted">{meta}</span>}
        </div>
        {summary && <p className="line-clamp-2 text-sm text-muted">{summary}</p>}
        {groups.length > 0 && (
          // Named groups line their labels up in a column from `sm`; on phones each label sits above its links.
          <nav aria-label={linksLabel} className="relative z-10 mt-1.5 flex flex-col gap-2">
            {groups.map((group, index) => (
              <div key={group.label ?? index} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                {group.label && <span className="text-xs font-semibold text-body sm:w-24 sm:shrink-0">{group.label}</span>}
                <ul className="flex flex-wrap gap-1.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} prefetch={false} className={SUB_LINK_CLASSES}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        )}
      </div>
    </li>
  );
}
