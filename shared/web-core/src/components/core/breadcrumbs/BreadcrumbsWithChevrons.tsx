import Link from 'next/link';
import ChevronRightIcon from '@heroicons/react/20/solid/ChevronRightIcon';
import HomeIcon from '@heroicons/react/24/solid/HomeIcon';

export interface BreadcrumbsOjbect {
  name: string;
  href: string;
  current: boolean;
}

interface BreadcrumbsWithChevronsProps {
  breadcrumbs: BreadcrumbsOjbect[];
}

export default function BreadcrumbsWithChevrons({ breadcrumbs }: BreadcrumbsWithChevronsProps) {
  return breadcrumbs.length === 0 ? null : (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-4">
        <li>
          <Link className="cursor-pointer" href={'/'}>
            <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {breadcrumbs.map((breadcrumb) => (
          <li key={breadcrumb.name}>
            <div className="flex items-center">
              <ChevronRightIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <Link
                href={breadcrumb.href}
                className={`ml-4 text-sm font-medium ${breadcrumb.current ? 'cursor-default' : 'cursor-pointer link-color'}`}
                aria-current={breadcrumb.current ? 'page' : undefined}
              >
                {breadcrumb.name}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
