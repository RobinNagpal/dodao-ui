import Link from 'next/link';
import ChevronLeftIcon from '@heroicons/react/20/solid/ChevronLeftIcon';
import ChevronRightIcon from '@heroicons/react/20/solid/ChevronRightIcon';
import HomeIcon from '@heroicons/react/24/solid/HomeIcon';
import { ReactNode } from 'react';

export interface BreadcrumbsOjbect {
  name: string;
  href: string;
  current: boolean;
}

interface BreadcrumbsWithChevronsProps {
  breadcrumbs: BreadcrumbsOjbect[];
  rightButton?: ReactNode;
  hideHomeIcon?: boolean;
  /**
   * On mobile, collapse the chain to a single truncated "← {parent}" back
   * link inline with `rightButton`. The full chain still renders at `sm` and
   * above. Opt-in so existing pages keep their behavior — pages with long
   * crumb names should enable it. No effect at `sm` and above.
   */
  mobileBackOnly?: boolean;
}

function FullBreadcrumbChain({ breadcrumbs, hideHomeIcon }: { breadcrumbs: BreadcrumbsOjbect[]; hideHomeIcon: boolean }) {
  return (
    <ol role="list" className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {/* Home icon - hidden only on mobile */}
      <li className={hideHomeIcon ? 'hidden sm:block' : ''}>
        <Link className="cursor-pointer" href={'/'}>
          <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <span className="sr-only">Home</span>
        </Link>
      </li>
      {breadcrumbs.map((breadcrumb, index) => {
        const isFirstBreadcrumb = index === 0;
        return (
          <li key={breadcrumb.name} className="min-w-0">
            <div className="flex items-center min-w-0">
              {/* Show chevron on desktop always, on mobile only if not first breadcrumb when home is hidden */}
              <ChevronRightIcon className={`h-5 w-5 flex-shrink-0 ${hideHomeIcon && isFirstBreadcrumb ? 'hidden sm:block' : ''}`} aria-hidden="true" />
              <Link
                href={breadcrumb.href}
                className={`${hideHomeIcon && isFirstBreadcrumb ? 'sm:ml-4' : 'ml-4'} text-sm font-medium break-words ${
                  breadcrumb.current ? 'cursor-default' : 'cursor-pointer link-color'
                }`}
                aria-current={breadcrumb.current ? 'page' : undefined}
              >
                {breadcrumb.name}
              </Link>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function BreadcrumbsWithChevrons({ breadcrumbs, rightButton, hideHomeIcon = false, mobileBackOnly = false }: BreadcrumbsWithChevronsProps) {
  if (breadcrumbs.length === 0) return null;

  // Opt-in mobile layout: back link inline with rightButton on one row.
  // `sm:contents` flattens the wrapper at `sm+` so the full-chain nav and
  // rightButton become direct children of the outer flex-row again — that
  // way rightButton is rendered exactly once and the desktop spacing
  // (`justify-between`) is preserved.
  if (mobileBackOnly) {
    const parentCrumb: BreadcrumbsOjbect | null = breadcrumbs.length >= 2 ? breadcrumbs[breadcrumbs.length - 2] : null;

    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
        <div className="flex sm:contents items-center justify-between min-w-0 w-full gap-2">
          {parentCrumb && (
            <Link href={parentCrumb.href} className="flex sm:hidden items-center text-sm font-medium link-color min-w-0 flex-1">
              <ChevronLeftIcon className="h-5 w-5 flex-shrink-0 mr-1" aria-hidden="true" />
              <span className="truncate">{parentCrumb.name}</span>
            </Link>
          )}
          <nav className="hidden sm:flex min-w-0" aria-label="Breadcrumb">
            <FullBreadcrumbChain breadcrumbs={breadcrumbs} hideHomeIcon={hideHomeIcon} />
          </nav>
          {rightButton && <div className="flex-shrink-0">{rightButton}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
      <nav className="flex min-w-0" aria-label="Breadcrumb">
        <FullBreadcrumbChain breadcrumbs={breadcrumbs} hideHomeIcon={hideHomeIcon} />
      </nav>
      {rightButton && <div className="flex-shrink-0 w-full sm:w-auto">{rightButton}</div>}
    </div>
  );
}
