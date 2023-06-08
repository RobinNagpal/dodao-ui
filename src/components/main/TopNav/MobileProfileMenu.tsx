import { Session } from '@/types/auth/Session';
import { Disclosure } from '@headlessui/react';
import Image from 'next/image';
import Link from 'next/link';

interface ProfileMenuProps {
  session: Session;
}

function ProfileActionButton({ label, href }: { label: string; href?: string }) {
  return (
    <Link href={href || '#'}>
      <Disclosure.Button as="a" className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:px-6">
        {label}
      </Disclosure.Button>
    </Link>
  );
}

export function MobileProfileMenu({ session }: ProfileMenuProps) {
  return (
    <div className="border-t border-gray-200 pb-3 pt-4">
      <div className="flex items-center px-4 sm:px-6">
        <div className="flex-shrink-0">
          <Image className="h-10 w-10 rounded-full" src={`https://api.multiavatar.com/${session?.username || 'unknown'}.svg`} alt="" width={50} height={50} />
        </div>
        <div className="ml-3">
          <div className="text-base font-medium text-gray-800">Tom Cook</div>
          <div className="text-sm font-medium text-gray-500">tom@example.com</div>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <ProfileActionButton label="Your Profile" />
        <ProfileActionButton label="Manage Space" href={'/space/manage'} />
        <ProfileActionButton label="Sign out" />
      </div>
    </div>
  );
}
