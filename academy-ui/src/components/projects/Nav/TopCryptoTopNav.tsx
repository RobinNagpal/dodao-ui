'use client';

import FullPageModal from '@/components/core/modals/FullPageModal';
import CreateContentModalContents from '@/components/main/TopNav/CreateContentModalContents';
import { DesktopNavLink } from '@/components/main/TopNav/DesktopNavLink';
import { MobileNavLink } from '@/components/main/TopNav/MobileNavLink';
import { Project, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { ProjectTypes } from '@/types/deprecated/models/enums';
import { FeatureItem, FeatureName } from '@/types/features/spaceFeatures';
import { getCDNImageUrl } from '@/utils/images/getCDNImageUrl';
import { Disclosure } from '@headlessui/react';
import Bars3Icon from '@heroicons/react/24/outline/Bars3Icon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import styled from 'styled-components';

const StyledDiv = styled.div`
  background-color: var(--bg-color);
  color: var(--text-color);
`;

function DesktopNavLinks() {
  return (
    <div className="hidden md:ml-6 md:flex md:space-x-8">
      {Object.keys(ProjectTypes).map((type) => {
        return <DesktopNavLink key={type} href={`/projects/type/${type.toLocaleLowerCase()}`} label={type} />;
      })}
    </div>
  );
}

function MobileNavLinks() {
  return (
    <div className="space-y-1 pb-3 pt-2">
      {Object.keys(ProjectTypes).map((type) => {
        return <MobileNavLink key={type} href={`/projects/type/${type.toLocaleLowerCase()}`} label={type} />;
      })}
    </div>
  );
}

export default function TopCryptoTopNav({ space }: { space: SpaceWithIntegrationsFragment }) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <StyledDiv>
      <FullPageModal open={showCreateModal} onClose={() => setShowCreateModal(false)} title={'Create'} showCloseButton={false}>
        <CreateContentModalContents space={space} hideModal={() => setShowCreateModal(false)} />
      </FullPageModal>
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
                    <Link href="/">
                      <Image
                        className="block h-8 w-auto lg:hidden"
                        src={space.avatar ? getCDNImageUrl(space.avatar) : 'https://tailwindui.com/img/logos/mark.svg'}
                        alt="Your Company"
                        width={50}
                        height={50}
                      />
                    </Link>
                    <Link href="/">
                      <Image
                        className="hidden h-8 w-auto lg:block"
                        src={space.avatar ? getCDNImageUrl(space.avatar) : 'https://tailwindui.com/img/logos/mark.svg'}
                        alt="Your Company"
                        width={50}
                        height={50}
                      />
                    </Link>
                  </div>
                  <DesktopNavLinks />
                </div>
              </div>
            </div>

            <Disclosure.Panel className="md:hidden">
              <MobileNavLinks />
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </StyledDiv>
  );
}
