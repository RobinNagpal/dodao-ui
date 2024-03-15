'use client';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid';
import { useRouter, usePathname } from 'next/navigation';
import PageWrapper from '../page/PageWrapper';

export default function BreadcrumbsWithChevrons() {
  const router = useRouter();
  const pathname = usePathname();
  const paths = pathname.split('/').filter((path) => path !== '');
  const pages = [];
  for (const path of paths) {
    pages.push({ name: path, href: '#', current: false });
  }

  return pages.length === 0 ? null : (
    <PageWrapper>
      <nav className="flex -mt-4" aria-label="Breadcrumb">
        <ol role="list" className="flex items-center space-x-4">
          <li>
            <div className="cursor-pointer" onClick={() => router.push('/')}>
              <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span className="sr-only">Home</span>
            </div>
          </li>
          {pages.map((page) => (
            <li key={page.name}>
              <div className="flex items-center">
                <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                <a href={page.href} className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700" aria-current={page.current ? 'page' : undefined}>
                  {page.name}
                </a>
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </PageWrapper>
  );
}
