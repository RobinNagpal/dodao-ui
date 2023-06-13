import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import styled from 'styled-components';
export interface EllipsisDropdownItem {
  label: string;
  key: string;
  active?: boolean;
}

export interface EllipsisDropdownProps {
  items: EllipsisDropdownItem[];
  className?: string;
  onSelect: (item: string) => void;
}

const MenuButton = styled(Menu.Button)`
  background-color: var(--bg-color);
  color: var(--text-color);
  &:hover {
    color: var(--primary-color);
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--primary-color), 0 0 0 4px var(--bg-color);
  }
`;

const DropdownItem = styled.a<{ active?: boolean }>`
  color: ${({ active }) => (active ? 'var(--text-color)' : 'var(--link-color)')};
  background-color: ${({ active }) => (active ? 'var(--block-bg)' : 'transparent')};
  &:hover {
    background-color: var(--block-bg);
    color: var(--text-color);
  }
`;

const MenuItems = styled(Menu.Items)`
  border: 1px solid var(--border-color);
  background-color: var(--bg-color);
`;

export default function EllipsisDropdown(props: EllipsisDropdownProps) {
  return (
    <Menu as="div" className={`relative inline-block text-left ${props.className || ''}`}>
      <div>
        <MenuButton className="flex items-center rounded-full focus:ring-offset-2">
          <span className="sr-only">Open options</span>
          <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
        </MenuButton>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {props.items.map((item, index) => (
              <Menu.Item key={index}>
                <DropdownItem href="#" className="block px-4 py-2 text-sm" active={item.active} onClick={() => props.onSelect(item.key)}>
                  {item.label}
                </DropdownItem>
              </Menu.Item>
            ))}
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  );
}
