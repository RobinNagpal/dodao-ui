'use client';

import { PredefinedSpaces } from '@/chatbot/utils/app/constants';
import ButtonLarge from '@/components/core/buttons/Button';
import FullPageModal from '@/components/core/modals/FullPageModal';
import CreateContentModalContents from '@/components/main/TopNav/CreateContentModalContents';
import { DesktopNavLink } from '@/components/main/TopNav/DesktopNavLink';
import { DesktopProfileMenu } from '@/components/main/TopNav/DesktopProfileMenu';
import { MobileNavLink } from '@/components/main/TopNav/MobileNavLink';
import { MobileProfileMenu } from '@/components/main/TopNav/MobileProfileMenu';
import { useLoginModalContext } from '@/contexts/LoginModalContext';
import { Space, SpaceTypes, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { Session } from '@/types/auth/Session';
import { FeatureItem, FeatureName } from '@/types/features/spaceFeatures';
import { isAdmin } from '@/utils/auth/isAdmin';
import { isSuperAdmin } from '@/utils/auth/superAdmins';
import { getSortedFeaturesArray } from '@/utils/features';
import { getCDNImageUrl } from '@/utils/images/getCDNImageUrl';
import { Disclosure } from '@headlessui/react';
import PlusIcon from '@heroicons/react/20/solid/PlusIcon';
import Bars3Icon from '@heroicons/react/24/outline/Bars3Icon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';

const StyledDiv = styled.div`
  background-color: var(--bg-color);
  color: var(--text-color);
`;

function DesktopNavLinks({ space }: { space: Space }) {
  const sortedSpaceFeatures: FeatureItem[] = getSortedFeaturesArray(space);

  return (
    <div className="hidden md:ml-6 md:flex md:space-x-8">
      {sortedSpaceFeatures.map((feature) => {
        if (feature.featureName === FeatureName.Courses) {
          return <DesktopNavLink key="courses" href="/courses" label="Courses" />;
        }
        if (feature.featureName === FeatureName.Guides) {
          return <DesktopNavLink key="guides" href="/guides" label="Guides" />;
        }

        if (feature.featureName === FeatureName.Bytes) {
          return <DesktopNavLink key="tidbits" href="/tidbits" label="Tidbits" />;
        }

        if (feature.featureName === FeatureName.ByteCollections) {
          return <DesktopNavLink key="tidbitCollections" href="/tidbit-collections" label="Tidbits" />;
        }
        if (feature.featureName === FeatureName.Simulations) {
          return <DesktopNavLink key="simulations" href="/simulations" label="Simulations" />;
        }
        if (feature.featureName === FeatureName.Timelines) {
          return <DesktopNavLink key="timelines" href="/timelines" label="Timelines" />;
        }
        if (feature.featureName === FeatureName.Chatbot) {
          return <DesktopNavLink key="ai_chatbot" href="/nema" label="Chatbot" />;
        }
        if (feature.featureName === FeatureName.Shorts) {
          return <DesktopNavLink key="shorts" href="/shorts" label="Short Videos" />;
        }
      })}
    </div>
  );
}

function MobileNavLinks({ space }: { space: Space }) {
  const sortedSpaceFeatures: FeatureItem[] = getSortedFeaturesArray(space);

  return (
    <div className="space-y-1 pb-3 pt-2">
      {sortedSpaceFeatures.map((feature) => {
        if (feature.featureName === FeatureName.Courses) {
          return <MobileNavLink key="courses" href="/courses" label="Courses" />;
        }
        if (feature.featureName === FeatureName.Guides) {
          return <MobileNavLink key="guides" href="/guides" label="Guides" />;
        }

        if (feature.featureName === FeatureName.Bytes) {
          return <MobileNavLink key="tidbits" href="/tidbits" label="Tidbits" />;
        }

        if (feature.featureName === FeatureName.ByteCollections) {
          return <MobileNavLink key="tidbitCollections" href="/tidbit-collections" label="Tidbits" />;
        }
        if (feature.featureName === FeatureName.Simulations) {
          return <MobileNavLink key="simulations" href="/simulations" label="Simulations" />;
        }
        if (feature.featureName === FeatureName.Timelines) {
          return <MobileNavLink key="timelines" href="/timelines" label="Timelines" />;
        }
        if (feature.featureName === FeatureName.Chatbot) {
          return <MobileNavLink key="ai_chatbot" href="/nema" label="Chatbot" />;
        }
        if (feature.featureName === FeatureName.Shorts) {
          return <MobileNavLink key="shorts" href="/shorts" label="Short Videos" />;
        }
      })}
    </div>
  );
}

function CreateOrLoginButton(props: {
  session?: Session | undefined | null;
  space: Space | null | undefined;
  onClickCreate: () => void;
  onClickLogin: () => void;
}) {
  if (props.session && props.space && isAdmin(props.session, props.space)) {
    return (
      <ButtonLarge type="button" variant="contained" primary onClick={props.onClickCreate}>
        <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
        Create
      </ButtonLarge>
    );
  }

  if (props.session && props.space) {
    return null;
  }

  return (
    <ButtonLarge variant="contained" primary onClick={props.onClickLogin}>
      Login
    </ButtonLarge>
  );
}

export default function TopNav(props: { space?: SpaceWithIntegrationsFragment | null }) {
  const { data: session } = useSession();
  const { setShowLoginModal } = useLoginModalContext();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { space } = props;
  const router = useRouter();

  return (
    <StyledDiv>
      <FullPageModal open={showCreateModal} onClose={() => setShowCreateModal(false)} title={'Create'} showCloseButton={false}>
        <CreateContentModalContents space={props.space} hideModal={() => setShowCreateModal(false)} />
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
                        src={space?.avatar ? getCDNImageUrl(space.avatar) : 'https://tailwindui.com/img/logos/mark.svg'}
                        alt="Your Company"
                        width={50}
                        height={50}
                      />
                    </Link>
                    <Link href="/">
                      <Image
                        className="hidden h-8 w-auto lg:block"
                        src={space?.avatar ? getCDNImageUrl(space.avatar) : 'https://tailwindui.com/img/logos/mark.svg'}
                        alt="Your Company"
                        width={50}
                        height={50}
                      />
                    </Link>
                  </div>
                  {space && space.type !== SpaceTypes.TidbitsSite && <DesktopNavLinks space={space} />}
                </div>
                <div className="flex items-center">
                  {PredefinedSpaces.TIDBITS_HUB === space?.id && (
                    <div className="mr-2">
                      <ButtonLarge
                        type="button"
                        variant="contained"
                        primary
                        onClick={() => {
                          if (!session) {
                            setShowLoginModal(true);
                          } else {
                            router.push('/new-tidbit-site/user-details');
                          }
                        }}
                      >
                        <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                        Create Tidbit Site
                      </ButtonLarge>
                    </div>
                  )}

                  <div className="flex-shrink-0">
                    <CreateOrLoginButton
                      session={session as Session}
                      space={space}
                      onClickCreate={() => setShowCreateModal(true)}
                      onClickLogin={() => setShowLoginModal(true)}
                    />
                  </div>

                  {session && space && (
                    <div className="hidden md:ml-4 md:flex md:flex-shrink-0 md:items-center">
                      <DesktopProfileMenu session={session as Session} space={space} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Disclosure.Panel className="md:hidden">
              {space && space.type !== SpaceTypes.TidbitsSite && <MobileNavLinks space={space} />}
              {session && space && <MobileProfileMenu session={session as Session} space={space} />}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </StyledDiv>
  );
}
