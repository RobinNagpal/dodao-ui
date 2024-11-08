import { WebCoreSpace } from '@dodao/web-core/types/space';
import { Session } from '@dodao/web-core/types/auth/Session';
import { isSuperAdmin } from '@dodao/web-core/utils/auth/superAdmins';
import { isAdmin } from '@dodao/web-core/utils/auth/isAdmin';
import { Disclosure } from '@headlessui/react';
import Image from 'next/image';
import Link from 'next/link';

interface ProfileMenuProps {
  session: Session;
  space: WebCoreSpace;
}

function ProfileActionButton({ label, href }: { label: string; href?: string }) {
  return (
    <Link href={href || '#'}>
      <Disclosure.Button as="a" className="block px-4 py-2 font-medium hover:bg-gray-100 hover:text-gray-800 sm:px-6">
        {label}
      </Disclosure.Button>
    </Link>
  );
}

export function MobileProfileMenu({ session, space }: ProfileMenuProps) {
  return (
    <div className="border-t border-gray-200 pb-3 pt-4">
      <div className="flex items-center px-4 sm:px-6">
        <div className="flex-shrink-0">
          <span className="inline-block h-10 w-10 overflow-hidden rounded-full bg-gray-100">
            <svg fill="currentColor" viewBox="0 0 24 24" className="h-full w-full text-gray-300">
              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </span>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {isSuperAdmin(session) && <ProfileActionButton label="Your Profile" />}
        {isSuperAdmin(session) && <ProfileActionButton label="Manage Space" href={'/space/manage'} />}
        {isSuperAdmin(session) && <ProfileActionButton label="Edit User Space" href={'/space/edit'} />}
        {isAdmin(session, space) && <ProfileActionButton label="Edit Space" href={'/spaces/finish-space-setup'} />}
        {isAdmin(session, space) && <ProfileActionButton label="Edit Profile" href={'/profile-info/edit'} />}
        <ProfileActionButton label="Sign out" />
      </div>
    </div>
  );
}
