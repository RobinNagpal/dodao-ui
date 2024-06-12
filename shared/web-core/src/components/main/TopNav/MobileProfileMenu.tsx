import { SpaceWithIntegrationsFragment } from '@dodao/web-core/types/space';
import { Session } from '@dodao/web-core/types/auth/Session';
import { isSuperAdmin } from '@dodao/web-core/utils/auth/superAdmins';
import { Disclosure } from '@headlessui/react';
import Image from 'next/image';
import Link from 'next/link';

interface ProfileMenuProps {
  session: Session;
  space: SpaceWithIntegrationsFragment;
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
          <Image className="h-10 w-10 rounded-full" src={`https://api.multiavatar.com/${session?.username || 'unknown'}.svg`} alt="" width={50} height={50} />
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {isSuperAdmin(session) && <ProfileActionButton label="Your Profile" />}
        {isSuperAdmin(session) && <ProfileActionButton label="Manage Space" href={'/space/manage'} />}
        <ProfileActionButton label="Sign out" />
      </div>
    </div>
  );
}
