import { DesktopNavLink } from '@/components/main/TopNav/DesktopNavLink';
import { DesktopProfileMenu } from '@/components/main/TopNav/DesktopProfileMenu';
import { MobileNavLink } from '@/components/main/TopNav/MobileNavLink';
import { MobileProfileMenu } from '@/components/main/TopNav/MobileProfileMenu';
import { Disclosure } from '@headlessui/react';
import { PlusIcon } from '@heroicons/react/20/solid';
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';

export default function TopNav() {
  const { data: session } = useSession();
  console.log('TopNav session', session);
  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="-ml-2 mr-2 flex items-center md:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                    <span className="sr-only">Open main menu</span>
                    {open ? <XMarkIcon className="block h-6 w-6" aria-hidden="true" /> : <Bars3Icon className="block h-6 w-6" aria-hidden="true" />}
                  </Disclosure.Button>
                </div>
                <div className="flex flex-shrink-0 items-center">
                  <img className="block h-8 w-auto lg:hidden" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" alt="Your Company" />
                  <img className="hidden h-8 w-auto lg:block" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" alt="Your Company" />
                </div>
                <div className="hidden md:ml-6 md:flex md:space-x-8">
                  <DesktopNavLink label="Guides" isActive />
                  <DesktopNavLink label="Bytes" />
                  <DesktopNavLink label="Courses" />
                  <DesktopNavLink label="Simulations" />
                  <DesktopNavLink label="Timelines" />
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <button
                    type="button"
                    className="relative inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                    New Job
                  </button>
                </div>
                <div className="hidden md:ml-4 md:flex md:flex-shrink-0 md:items-center">
                  <button
                    type="button"
                    className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>

                  {/* Profile dropdown */}
                  <DesktopProfileMenu />
                </div>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 pb-3 pt-2">
              <MobileNavLink label="Guides" isActive />
              <MobileNavLink label="Bytes" />
              <MobileNavLink label="Courses" />
              <MobileNavLink label="Simulations" />
              <MobileNavLink label="Timelines" />
            </div>
            <MobileProfileMenu />
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
