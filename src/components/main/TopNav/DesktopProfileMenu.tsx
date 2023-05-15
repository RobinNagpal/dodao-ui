import { useAuth } from '@/hooks/useAuth';
import { Session } from '@/types/Session';
import classNames from '@/utils/classNames';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Image from 'next/image';

interface ProfileMenuProps {
  session: Session;
}

function ProfileMenuItem({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <Menu.Item>
      {({ active }) => (
        <a href="#" onClick={onClick} className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}>
          {label}
        </a>
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
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <ProfileMenuItem label="Your Profile" />
          <ProfileMenuItem label="Settings" />
          <ProfileMenuItem label="Sign out" onClick={() => logout()} />
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
