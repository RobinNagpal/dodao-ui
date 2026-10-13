'use client';

import { cn } from '@/lib/utils';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import React from 'react';

export interface LinkMenuItem {
  href: string;
  label: string;
}

export interface LinkMenuProps {
  /** Text on the button, e.g. "Tools". */
  label: string;
  items: LinkMenuItem[];
  className?: string;
}

/**
 * Small labelled button that opens a list of links, for a set of links that would take too much
 * room inline (e.g. the tariff chapter's "Tools" on phones). Items are real links, so they can be
 * opened in a new tab. The list is portaled to `<body>`, anchored under the button's right edge and kept 16px off the screen edges.
 * Callers that need the links crawlable keep an inline copy in the HTML (e.g. CSS-hidden on phones),
 * because the menu's items only render while it is open.
 */
export default function LinkMenu({ label, items, className }: LinkMenuProps): React.JSX.Element {
  return (
    <Menu as="div" className={cn('relative inline-block text-left', className)}>
      <MenuButton className="inline-flex min-h-9 items-center gap-1 rounded-md border border-border bg-surface-2 px-3 text-sm font-medium text-body hover:text-heading data-[open]:text-heading">
        {label}
        <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
      </MenuButton>
      <MenuItems
        portal={true}
        anchor={{ to: 'bottom end', gap: 6, padding: 16 }}
        className="z-30 w-60 rounded-lg border border-border bg-surface p-1 shadow-xl focus:outline-none"
      >
        {items.map((item) => (
          <MenuItem key={item.href}>
            <Link
              href={item.href}
              prefetch={false}
              className="block rounded-md px-3 py-2 text-sm text-body data-[focus]:bg-surface-2 data-[focus]:text-heading"
            >
              {item.label}
            </Link>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}
