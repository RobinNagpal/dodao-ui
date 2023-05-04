import { DoDAOSession } from '@/types/DoDAOSession';
import { Disclosure } from '@headlessui/react';

interface ProfileMenuProps {
  session: DoDAOSession | null;
}

export function MobileProfileMenu({ session }: ProfileMenuProps) {
  return (
    <div className="border-t border-gray-200 pb-3 pt-4">
      <div className="flex items-center px-4 sm:px-6">
        <div className="flex-shrink-0">
          <img className="h-10 w-10 rounded-full" src={`https://api.multiavatar.com/${session?.username || 'unknown'}.svg`} alt="" />
        </div>
        <div className="ml-3">
          <div className="text-base font-medium text-gray-800">Tom Cook</div>
          <div className="text-sm font-medium text-gray-500">tom@example.com</div>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <Disclosure.Button as="a" href="#" className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:px-6">
          Your Profile
        </Disclosure.Button>
        <Disclosure.Button as="a" href="#" className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:px-6">
          Settings
        </Disclosure.Button>
        <Disclosure.Button as="a" href="#" className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:px-6">
          Sign out
        </Disclosure.Button>
      </div>
    </div>
  );
}
