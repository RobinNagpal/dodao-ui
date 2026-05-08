import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

export interface TariffCrossLink {
  href: string;
  title: string;
  description: string;
  icon?: ReactNode;
}

interface TariffCrossLinksProps {
  heading?: string;
  description?: string;
  links: TariffCrossLink[];
}

export default function TariffCrossLinks({ heading = 'Related Tariff Tools & Reports', description, links }: TariffCrossLinksProps) {
  if (links.length === 0) return null;

  return (
    <section aria-labelledby="tariff-cross-links-heading" className="mb-10 rounded-2xl border border-color background-color p-5 sm:p-6">
      <div className="mb-4">
        <h2 id="tariff-cross-links-heading" className="text-lg font-semibold text-white sm:text-xl">
          {heading}
        </h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <ul className={`grid grid-cols-1 gap-3 ${links.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group flex h-full items-start gap-3 rounded-xl border border-color block-bg-color p-4 transition-colors hover:border-indigo-400 hover:bg-block-bg-color"
            >
              {link.icon && (
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 ring-1 ring-inset ring-indigo-500/20 group-hover:bg-indigo-500/20">
                  {link.icon}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-white group-hover:text-indigo-300">{link.title}</p>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-indigo-300" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{link.description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
