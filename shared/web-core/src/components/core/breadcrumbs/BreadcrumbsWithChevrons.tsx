'use client';

import Link from 'next/link';
import ChevronLeftIcon from '@heroicons/react/20/solid/ChevronLeftIcon';
import ChevronRightIcon from '@heroicons/react/20/solid/ChevronRightIcon';
import EllipsisHorizontalIcon from '@heroicons/react/20/solid/EllipsisHorizontalIcon';
import HomeIcon from '@heroicons/react/24/solid/HomeIcon';
import { ReactNode, useState } from 'react';

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
   * On mobile, collapse the chain to a single "← {parent}" back link plus a
   * `⋯` toggle that expands the full chain inline. Opt-in so existing pages
   * keep their behavior; pages with long crumb names (e.g. the stock detail
   * page) should enable it. No effect at `sm` and above.
   */
  mobileBackOnly?: boolean;
}

export default function BreadcrumbsWithChevrons({ breadcrumbs, rightButton, hideHomeIcon = false, mobileBackOnly = false }: BreadcrumbsWithChevronsProps) {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  if (breadcrumbs.length === 0) return null;

  // Second-to-last crumb. When there's only one crumb there's no parent to
  // navigate back to, so the mobile row simply omits the back link.
  const parentCrumb: BreadcrumbsOjbect | null = mobileBackOnly && breadcrumbs.length >= 2 ? breadcrumbs[breadcrumbs.length - 2] : null;
  // Only show the ⋯ toggle when there's actually more chain to reveal than the
  // single back link already shows (i.e. 3+ crumbs, or 2+ crumbs with the home
  // icon).
  const showMobileExpander: boolean = mobileBackOnly && (breadcrumbs.length >= 3 || (breadcrumbs.length >= 2 && !hideHomeIcon));

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
      {mobileBackOnly && (
        <div className="flex sm:hidden flex-col min-w-0 w-full gap-2">
          <div className="flex items-center justify-between min-w-0 w-full gap-2">
            {parentCrumb ? (
              <Link href={parentCrumb.href} className="flex items-center text-sm font-medium link-color min-w-0 flex-1">
                <ChevronLeftIcon className="h-5 w-5 flex-shrink-0 mr-1" aria-hidden="true" />
                <span className="truncate">{parentCrumb.name}</span>
              </Link>
            ) : (
              <span className="flex-1" />
            )}
            {showMobileExpander && (
              <button
                type="button"
                onClick={() => setMobileExpanded((v) => !v)}
                aria-expanded={mobileExpanded}
                aria-label={mobileExpanded ? 'Hide full breadcrumb' : 'Show full breadcrumb'}
                className="flex-shrink-0 inline-flex items-center justify-center rounded-md p-1 text-color hover:bg-white/5"
              >
                <EllipsisHorizontalIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
          {mobileExpanded && (
            <nav className="min-w-0 w-full" aria-label="Breadcrumb">
              <ol role="list" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                {!hideHomeIcon && (
                  <li>
                    <Link className="cursor-pointer inline-flex items-center" href={'/'}>
                      <HomeIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                      <span className="sr-only">Home</span>
                    </Link>
                  </li>
                )}
                {breadcrumbs.map((breadcrumb, index) => {
                  const isFirstBreadcrumb = index === 0;
                  return (
                    <li key={breadcrumb.name} className="min-w-0">
                      <div className="flex items-center min-w-0">
                        {(!hideHomeIcon || !isFirstBreadcrumb) && <ChevronRightIcon className="h-4 w-4 flex-shrink-0 mr-1" aria-hidden="true" />}
                        <Link
                          href={breadcrumb.href}
                          className={`text-xs font-medium break-words ${breadcrumb.current ? 'cursor-default' : 'cursor-pointer link-color'}`}
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
          )}
        </div>
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
