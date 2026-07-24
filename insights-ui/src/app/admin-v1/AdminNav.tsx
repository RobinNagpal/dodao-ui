'use client';

import { Popover, PopoverButton, PopoverGroup, PopoverPanel } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';

interface AdminNavItem {
  name: string;
  href: string;
}

interface AdminNavSection {
  label: string;
  items: AdminNavItem[];
}

const stocksReportsSection: AdminNavSection = {
  label: 'Stocks Reports',
  items: [
    { name: 'Create Reports', href: '/admin-v1/create-reports' },
    { name: 'Generation Requests', href: '/admin-v1/generation-requests' },
    { name: 'Missing Reports', href: '/admin-v1/missing-reports' },
  ],
};

const stockIndustryMgmtSection: AdminNavSection = {
  label: 'Stock & Industry Mgmt',
  items: [
    { name: 'Industry Management', href: '/admin-v1/industry-management' },
    { name: 'Industry Analysis', href: '/admin-v1/industry-analysis-management' },
    { name: 'Ticker Management', href: '/admin-v1/ticker-management' },
    { name: 'Analysis Factors', href: '/admin-v1/analysis-factors' },
    { name: 'Stock Scenarios', href: '/admin-v1/stock-scenarios' },
  ],
};

const etfMgmtSection: AdminNavSection = {
  label: 'ETF Mgmt',
  items: [
    { name: 'ETF Reports', href: '/admin-v1/etf-reports' },
    { name: 'ETF Generation Requests', href: '/admin-v1/etf-generation-requests' },
    { name: 'ETF Scenarios', href: '/admin-v1/etf-scenarios' },
  ],
};

const analysisTemplatesSection: AdminNavSection = {
  label: 'Analysis Templates',
  items: [
    { name: 'Analysis Templates', href: '/admin-v1/analysis-templates' },
    { name: 'Analysis Template Reports', href: '/admin-v1/analysis-template-report' },
  ],
};

const tariffReportsSection: AdminNavSection = {
  label: 'Tariff Reports',
  items: [{ name: 'Tariff Chapter Reports', href: '/admin-v1/tariff-reports' }],
};

function AdminNavDropdown({ section }: { section: AdminNavSection }) {
  return (
    <Popover className="relative">
      {({ close }) => (
        <>
          <PopoverButton className="flex items-center gap-x-1 bg-primary text-primary-text font-medium py-2 px-4 rounded-md focus:outline-none">
            {section.label}
            <ChevronDownIcon aria-hidden="true" className="size-5 flex-none" />
          </PopoverButton>

          <PopoverPanel
            transition
            className="absolute left-0 z-10 mt-2 w-56 overflow-hidden rounded-lg shadow-lg ring-1 ring-border transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in bg-surface"
          >
            <div className="py-1">
              {section.items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-2 text-sm hover:bg-indigo-50 hover:text-primary text-body hover:bg-surface-2 dark:hover:text-white"
                  onClick={() => close()}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </PopoverPanel>
        </>
      )}
    </Popover>
  );
}

export default function AdminNav() {
  return (
    <div className="flex flex-col mb-6 gap-4 py-4 px-4 shadow-lg rounded-lg border bg-surface border-border">
      <PopoverGroup className="flex flex-wrap gap-4">
        <AdminNavDropdown section={stocksReportsSection} />
        <AdminNavDropdown section={stockIndustryMgmtSection} />
        <AdminNavDropdown section={etfMgmtSection} />
        <AdminNavDropdown section={analysisTemplatesSection} />
        <AdminNavDropdown section={tariffReportsSection} />
        <Link href="/admin-v1/users" className="bg-primary text-primary-text font-medium py-2 px-4 rounded-md">
          Users
        </Link>
        <Link href="/admin-v1/invalidate-cache" className="bg-primary text-primary-text font-medium py-2 px-4 rounded-md">
          Invalidate Cache
        </Link>
        <Link href="/admin-v1/app-settings" className="bg-primary text-primary-text font-medium py-2 px-4 rounded-md">
          App Settings
        </Link>
      </PopoverGroup>
    </div>
  );
}
