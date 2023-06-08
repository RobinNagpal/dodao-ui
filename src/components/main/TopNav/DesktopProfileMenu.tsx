import { useAuth } from '@/hooks/useAuth';
import { Session } from '@/types/auth/Session';
import classNames from '@/utils/classNames';
import { Menu, Transition } from '@headlessui/react';
import Link from 'next/link';
import { Fragment } from 'react';
import Image from 'next/image';
import styled from 'styled-components';

interface ProfileMenuProps {
  session: Session;
}

const StyledMenuItems = styled(Menu.Items)`
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
`;

function ProfileMenuItem({ label, href, onClick }: { label: string; href?: string; onClick?: () => void }) {
  return (
    <Menu.Item>
      {({ active }) => (
        <Link href={href || '#'} onClick={onClick} className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-300')}>
          {label}
        </Link>
      )}
    </Menu.Item>
  );
}

export function DesktopProfileMenu({ session }: ProfileMenuProps) {
  const { logout } = useAuth();
  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="flex rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          <span className="sr-only">Open user menu</span>
          <Image className="h-10 w-10 rounded-full" src={`https://api.multiavatar.com/${session?.username || 'unknown'}.svg`} alt="" width={50} height={50} />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <StyledMenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <ProfileMenuItem label="Your Profile" />
          <ProfileMenuItem label="Manage Space" href={'/space/manage'} />
          <ProfileMenuItem label="Sign out" onClick={() => logout()} />
        </StyledMenuItems>
      </Transition>
    </Menu>
  );
}
