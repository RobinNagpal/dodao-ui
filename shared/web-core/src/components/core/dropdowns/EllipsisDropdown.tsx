import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import React from 'react';
import styles from './EllipsisDropdown.module.scss';

export interface EllipsisDropdownItem {
  label: string;
  key: string;
  active?: boolean;
}

export interface EllipsisDropdownProps {
  items: EllipsisDropdownItem[];
  className?: string;
  onSelect: (item: string, e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export default function EllipsisDropdown(props: EllipsisDropdownProps) {
  return (
    <Menu as="div" className={`relative inline-block text-left ${props.className || ''}`}>
      <div>
        <MenuButton className={`flex items-center rounded-full focus:ring-offset-2 z-0 ${styles.menuButton}`}>
          <span className="sr-only">Open options</span>
          <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
        </MenuButton>
      </div>

      <MenuItems
        className={`z-10 mt-2 w-40 origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${styles.menuItems}`}
        portal={true}
        anchor={{
          to: 'bottom end',
        }}
      >
        <div className="py-1">
          {props.items.map((item, index) => (
            <MenuItem key={index}>
              <a
                className={`block px-4 py-2 text-sm cursor-pointer ${styles.dropdownItem} ${item.active ? 'active' : ''}`}
                onClick={(e) => props.onSelect(item.key, e)}
              >
                {item.label}
              </a>
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Menu>
  );
}
