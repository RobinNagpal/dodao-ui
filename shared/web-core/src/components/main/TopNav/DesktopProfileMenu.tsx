'use client';

import { WebCoreSpace } from '@dodao/web-core/types/space';
import { useAuth } from '@dodao/web-core/ui/auth/useAuth';
import { Session } from '@dodao/web-core/types/auth/Session';
import { isSuperAdmin } from '@dodao/web-core/utils/auth/superAdmins';
import { isAdmin } from '@dodao/web-core/utils/auth/isAdmin';
import classNames from '@dodao/web-core/utils/classNames';
import { Menu, Transition } from '@headlessui/react';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment } from 'react';
import styles from './DesktopProfileMenu.module.scss';

interface ProfileMenuProps {
  session: Session;
  space: WebCoreSpace;
}

function ProfileMenuItem({ label, href, onClick }: { label: string; href?: string; onClick?: () => void }) {
  return (
    <Menu.Item>
      {({ active }) => (
        <Link
          href={href || '#'}
          onClick={onClick}
          style={{ backgroundColor: active ? 'var(--block-bg)' : '' }}
          className={classNames('block px-4 py-2 text-sm')}
        >
          {label}
        </Link>
      )}
    </Menu.Item>
  );
}

export function DesktopProfileMenu({ session, space }: ProfileMenuProps) {
  const { logout } = useAuth(space.id);
  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="flex rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          <span className="sr-only">Open user menu</span>
          <Image
            className="h-10 w-10 rounded-full"
            src={`https://api.multiavatar.com/${session?.username || 'unknown'}.svg`}
            alt=""
            width={50}
            height={50}
            priority={true}
          />
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
        <Menu.Items
          className={`${styles.menuItems} absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
        >
          {isSuperAdmin(session) && <ProfileMenuItem label="Your Profile" />}
          {isSuperAdmin(session) && <ProfileMenuItem label="Manage Space" href={'/space/manage'} />}
          {isAdmin(session, space) && <ProfileMenuItem label="Edit Space" href={'/space-settings/edit'} />}
          {isAdmin(session, space) && <ProfileMenuItem label="Edit Profile" href={'/profile-info/edit'} />}
          <ProfileMenuItem label="Sign out" onClick={() => logout()} />
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
