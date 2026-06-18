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
   * On mobile, collapse the chain to a single "← {parent}" back link instead
   * of wrapping the full trail. Opt-in so existing pages keep their behavior;
   * pages with long crumb names (e.g. the stock detail page) should enable it.
   */
  mobileBackOnly?: boolean;
}

export default function BreadcrumbsWithChevrons({ breadcrumbs, rightButton, hideHomeIcon = false, mobileBackOnly = false }: BreadcrumbsWithChevronsProps) {
  if (breadcrumbs.length === 0) return null;

  // Second-to-last crumb. When there's only one crumb there's no parent to
  // navigate back to, so the mobile row simply omits the back link.
  const parentCrumb: BreadcrumbsOjbect | null = mobileBackOnly && breadcrumbs.length >= 2 ? breadcrumbs[breadcrumbs.length - 2] : null;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
      {parentCrumb && (
        <nav className="flex sm:hidden min-w-0 w-full" aria-label="Back">
          <Link href={parentCrumb.href} className="flex items-center text-sm font-medium link-color min-w-0">
            <ChevronLeftIcon className="h-5 w-5 flex-shrink-0 mr-1" aria-hidden="true" />
            <span className="truncate">{parentCrumb.name}</span>
          </Link>
        </nav>
      )}

      <nav className={`${mobileBackOnly ? 'hidden sm:flex' : 'flex'} min-w-0`} aria-label="Breadcrumb">
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
      </nav>
      {rightButton && <div className="flex-shrink-0 w-full sm:w-auto">{rightButton}</div>}
    </div>
  );
}
