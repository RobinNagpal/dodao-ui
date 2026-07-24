import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

export interface TariffCrossLink {
  href: string;
  title: string;
  /** Shown as native tooltip on hover when provided (replaces visible subtitle copy). */
  description?: string;
  icon?: ReactNode;
}

interface TariffCrossLinksProps {
  links: TariffCrossLink[];
}

export default function TariffCrossLinks({ links }: TariffCrossLinksProps) {
  if (links.length === 0) return null;

  return (
    <nav aria-label="Related tariff tools" className="mb-6">
      <ul className="flex flex-wrap gap-2">
        {links.map((link) => (
          <li key={link.href} className="min-w-0">
            <Link
              href={link.href}
              title={link.description}
              className="group inline-flex max-w-full items-center gap-2 rounded-lg border border-color block-bg-color px-3 py-2 text-sm font-medium text-heading transition-colors hover:border-primary hover:bg-block-bg-color"
            >
              {/* `badge-tone-accent` darkens the indigo-300 icon in light mode (page-theme-light.scss). */}
              {link.icon && (
                <span className="badge-tone-accent flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-300 ring-1 ring-inset ring-indigo-500/20 group-hover:bg-indigo-500/20 [&_svg]:!size-4">
                  {link.icon}
                </span>
              )}
              <span className="min-w-0 truncate">{link.title}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-px group-hover:text-primary" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
