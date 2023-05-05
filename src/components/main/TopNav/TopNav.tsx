import ButtonLarge from '@/components/core/buttons/Button';
import { DesktopNavLink } from '@/components/main/TopNav/DesktopNavLink';
import { DesktopProfileMenu } from '@/components/main/TopNav/DesktopProfileMenu';
import { MobileNavLink } from '@/components/main/TopNav/MobileNavLink';
import { MobileProfileMenu } from '@/components/main/TopNav/MobileProfileMenu';
import { useLoginModalContext } from '@/context/LoginModalContext';
import { Session } from '@/types/Session';
import { Disclosure } from '@headlessui/react';
import PlusIcon from '@heroicons/react/20/solid/PlusIcon';
import Bars3Icon from '@heroicons/react/24/outline/Bars3Icon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import { useSession } from 'next-auth/react';
import styled from 'styled-components';

const StyledDiv = styled.div`
  background-color: var(--bg-color);
  color: var(--text-color);
`;

export default function TopNav() {
  const { data: session } = useSession();
  const { setShowModal } = useLoginModalContext();

  console.log('TopNav session', session);
  return (
    <StyledDiv>
      <Disclosure
        as="nav"
        className="bg-white shadow"
        style={{
          backgroundColor: 'var(--bg-color)',
          color: 'var(--text-color)',
          borderBottom: '0.5px solid var(--border-color)',
          // boxShadow: '0px 50px 50px 0px red',
        }}
      >
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
                    {session ? (
                      <ButtonLarge type="button" variant="contained" primary>
                        <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                        Create
                      </ButtonLarge>
                    ) : (
                      <ButtonLarge variant="contained" primary onClick={() => setShowModal(true)}>
                        Login
                      </ButtonLarge>
                    )}
                  </div>

                  {session && (
                    <div className="hidden md:ml-4 md:flex md:flex-shrink-0 md:items-center">
                      <DesktopProfileMenu session={session as Session} />
                    </div>
                  )}
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
              {session && <MobileProfileMenu session={session as Session} />}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </StyledDiv>
  );
}
