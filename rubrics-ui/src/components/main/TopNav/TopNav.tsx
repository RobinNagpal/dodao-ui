'use client';

import ButtonLarge from '@dodao/web-core/components/core/buttons/Button';
import { DesktopNavLink } from '@dodao/web-core/components/main/TopNav/DesktopNavLink';
import { DesktopProfileMenu } from '@dodao/web-core/components/main/TopNav/DesktopProfileMenu';
import { MobileNavLink } from '@dodao/web-core/components/main/TopNav/MobileNavLink';
import { MobileProfileMenu } from '@dodao/web-core/components/main/TopNav/MobileProfileMenu';
import { Session } from '@dodao/web-core/types/auth/Session';
import { WebCoreSpace } from '@dodao/web-core/types/space';
import { useLoginModalContext } from '@dodao/web-core/ui/contexts/LoginModalContext';
import { isSuperAdmin } from '@dodao/web-core/utils/auth/superAdmins';
import { getCDNImageUrl } from '@dodao/web-core/utils/images/getCDNImageUrl';
import { Disclosure } from '@headlessui/react';
import Bars3Icon from '@heroicons/react/24/outline/Bars3Icon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { useState } from 'react';
import styles from './TopNav.module.scss';

function DesktopNavLinks({ space }: { space: WebCoreSpace }) {
  return (
    <div className="hidden md:ml-6 md:flex md:space-x-8">
      <DesktopNavLink key="programs" href="/programs" label="Programs" />
      <DesktopNavLink key="rubrics" href="/rubrics" label="Rubrics" />
    </div>
  );
}

function MobileNavLinks({ space }: { space: WebCoreSpace }) {
  return (
    <div className="space-y-1 pb-3 pt-2">
      <MobileNavLink key="programs" href="/programs" label="Programs" />
      <MobileNavLink key="rubrics" href="/rubrics" label="Rubrics" />
    </div>
  );
}

function CreateOrLoginButton(props: {
  session?: Session | undefined | null;
  space: WebCoreSpace | null | undefined;
  onClickCreate: () => void;
  onClickLogin: () => void;
}) {
  if (props.session && props.space) {
    return null;
  }

  return (
    <ButtonLarge variant="contained" primary onClick={props.onClickLogin}>
      Login
    </ButtonLarge>
  );
}

function TopNavContents(props: {
  open: boolean;
  space: WebCoreSpace | null | undefined;
  session: Session | null | undefined;
  onClickCreate: () => void;
  onClickLogin: () => void;
}) {
  if (props.space?.id === 'my-rubrics-home') {
    return (
      <>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="-ml-2 mr-2 flex items-center md:hidden">
              {/* Mobile menu button */}
              <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                <span className="sr-only">Open main menu</span>
                {props.open ? <XMarkIcon className="block h-6 w-6" aria-hidden="true" /> : <Bars3Icon className="block h-6 w-6" aria-hidden="true" />}
              </Disclosure.Button>
            </div>
            <div className="flex flex-shrink-0 items-center">
              <Link href="/">
                <img
                  className="block h-8 w-auto lg:hidden"
                  src={props.space?.avatar ? getCDNImageUrl(props.space.avatar) : 'https://tailwindui.com/img/logos/mark.svg'}
                  alt="Your Company"
                  height={50}
                />
              </Link>
              <Link href="/">
                <img
                  className="hidden h-8 w-auto lg:block"
                  src={props.space?.avatar ? getCDNImageUrl(props.space.avatar) : 'https://tailwindui.com/img/logos/mark.svg'}
                  alt="Your Company"
                  height={50}
                />
              </Link>
            </div>
            {props.space && <DesktopNavLinks space={props.space} />}
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CreateOrLoginButton session={props.session} space={props.space} onClickCreate={props.onClickCreate} onClickLogin={props.onClickLogin} />
            </div>

            {props.session && props.space && (
              <div className="hidden md:ml-4 md:flex md:flex-shrink-0 md:items-center">
                <DesktopProfileMenu session={props.session} space={props.space} />
              </div>
            )}
          </div>
        </div>
      </div>

      <Disclosure.Panel className="md:hidden">
        {props.space && <MobileNavLinks space={props.space} />}
        {props.session && props.space && <MobileProfileMenu session={props.session as Session} space={props.space} />}
      </Disclosure.Panel>
    </>
  );
}

export default function TopNav(props: { space?: WebCoreSpace | null }) {
  const { data: session } = useSession();
  const { setShowLoginModal } = useLoginModalContext();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { space } = props;

  const superAdmin = !!(session && isSuperAdmin(session as Session));

  return (
    <div className={styles.main}>
      <Disclosure
        as="nav"
        className="shadow"
        style={{
          backgroundColor: 'var(--bg-color)',
          color: 'var(--text-color)',
          borderBottom: '0.5px solid var(--border-color)',
          // boxShadow: '0px 50px 50px 0px red',
        }}
      >
        {({ open }) => (
          <TopNavContents
            open={open}
            space={space}
            session={session as Session | null}
            onClickCreate={() => setShowCreateModal(true)}
            onClickLogin={() => setShowLoginModal(true)}
          />
        )}
      </Disclosure>
    </div>
  );
}
