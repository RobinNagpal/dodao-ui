'use client';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid';
import { useRouter } from 'next/navigation';
import PageWrapper from '../page/PageWrapper';
import Link from 'next/link';

export interface BreadcrumbsOjbect {
  name: string;
  href: string;
  current: boolean;
}

interface BreadcrumbsWithChevronsProps {
  breadcrumbs: BreadcrumbsOjbect[];
}

export default function BreadcrumbsWithChevrons({ breadcrumbs }: BreadcrumbsWithChevronsProps) {
  const router = useRouter();

  return breadcrumbs.length === 0 ? null : (
    <PageWrapper>
      <nav className="flex -mt-4" aria-label="Breadcrumb">
        <ol role="list" className="flex items-center space-x-4">
          <li>
            <div className="cursor-pointer" onClick={() => router.push('/')}>
              <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span className="sr-only">Home</span>
            </div>
          </li>
          {breadcrumbs.map((breadcrumb) => (
            <li key={breadcrumb.name}>
              <div className="flex items-center">
                <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                <Link
                  href={breadcrumb.href}
                  className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                  aria-current={breadcrumb.current ? 'page' : undefined}
                >
                  {breadcrumb.name}
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </PageWrapper>
  );
}
