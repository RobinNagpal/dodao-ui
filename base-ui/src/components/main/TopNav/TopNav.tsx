"use client";

import ButtonLarge from "@dodao/web-core/components/core/buttons/Button";
import FullPageModal from "@dodao/web-core/components/core/modals/FullPageModal";
import CreateContentModalContents from "@/components/main/TopNav/CreateContentModalContents";
import { DesktopNavLink } from "@/components/main/TopNav/DesktopNavLink";
import { DesktopProfileMenu } from "@/components/main/TopNav/DesktopProfileMenu";
import { MobileNavLink } from "@/components/main/TopNav/MobileNavLink";
import { MobileProfileMenu } from "@/components/main/TopNav/MobileProfileMenu";
import { useLoginModalContext } from "@dodao/web-core/ui/contexts/LoginModalContext";
import { SpaceWithIntegrationsFragment } from "@dodao/web-core/types/space";
import { Session } from "@dodao/web-core/types/auth/Session";
import {
  FeatureItem,
  FeatureName,
} from "@dodao/web-core/types/features/spaceFeatures";
import { isSuperAdmin } from "@dodao/web-core/utils/auth/superAdmins";
import { getCDNImageUrl } from "@dodao/web-core/utils/images/getCDNImageUrl";
import { Disclosure } from "@headlessui/react";
import Bars3Icon from "@heroicons/react/24/outline/Bars3Icon";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useState } from "react";
import styled from "styled-components";
import { useRouter } from "next/navigation";

const StyledDiv = styled.div`
  background-color: var(--bg-color);
  color: var(--text-color);
`;

const sortedSpaceFeatures: FeatureItem[] = [
  {
    featureName: FeatureName.Guides,
    enabled: true,
    details: {
      priority: 90,
    },
  },
  {
    featureName: FeatureName.Courses,
    enabled: true,
    details: {
      priority: 80,
    },
  },
  {
    featureName: FeatureName.Bytes,
    enabled: true,
    details: {
      priority: 70,
    },
  },
  {
    featureName: FeatureName.Timelines,
    enabled: true,
    details: {
      priority: 60,
    },
  },
];

function DesktopNavLinks({ space }: { space: SpaceWithIntegrationsFragment }) {
  return (
    <div className="hidden md:ml-6 md:flex md:space-x-8">
      {sortedSpaceFeatures.map((feature) => {
        if (feature.featureName === FeatureName.Courses) {
          return (
            <DesktopNavLink key="courses" href="/courses" label="Courses" />
          );
        }
        if (feature.featureName === FeatureName.Guides) {
          return <DesktopNavLink key="guides" href="/guides" label="Guides" />;
        }

        if (feature.featureName === FeatureName.Bytes) {
          return (
            <DesktopNavLink key="tidbits" href="/tidbits" label="Tidbits" />
          );
        }

        if (feature.featureName === FeatureName.ByteCollections) {
          return (
            <DesktopNavLink
              key="tidbitCollections"
              href="/tidbit-collections"
              label="Tidbits"
            />
          );
        }

        if (feature.featureName === FeatureName.ByteCollectionCategories) {
          return (
            <DesktopNavLink
              key="byteCollectionCategories"
              href="/tidbit-collection-categories"
              label="Tidbits"
            />
          );
        }

        if (feature.featureName === FeatureName.Simulations) {
          return (
            <DesktopNavLink
              key="simulations"
              href="/simulations"
              label="Simulations"
            />
          );
        }
        if (feature.featureName === FeatureName.ClickableDemos) {
          return (
            <DesktopNavLink
              key="clickableDemos"
              href="/clickable-demos"
              label="Clickable Demos"
            />
          );
        }
        if (feature.featureName === FeatureName.Timelines) {
          return (
            <DesktopNavLink
              key="timelines"
              href="/timelines"
              label="Timelines"
            />
          );
        }
        if (feature.featureName === FeatureName.Chatbot) {
          return (
            <DesktopNavLink key="ai_chatbot" href="/nema" label="Chatbot" />
          );
        }
        if (feature.featureName === FeatureName.Shorts) {
          return (
            <DesktopNavLink key="shorts" href="/shorts" label="Short Videos" />
          );
        }
      })}
    </div>
  );
}

function MobileNavLinks({ space }: { space: SpaceWithIntegrationsFragment }) {
  return (
    <div className="space-y-1 pb-3 pt-2">
      {sortedSpaceFeatures.map((feature) => {
        if (feature.featureName === FeatureName.Courses) {
          return (
            <MobileNavLink key="courses" href="/courses" label="Courses" />
          );
        }
        if (feature.featureName === FeatureName.Guides) {
          return <MobileNavLink key="guides" href="/guides" label="Guides" />;
        }

        if (feature.featureName === FeatureName.Bytes) {
          return (
            <MobileNavLink key="tidbits" href="/tidbits" label="Tidbits" />
          );
        }

        if (feature.featureName === FeatureName.ByteCollections) {
          return (
            <MobileNavLink
              key="tidbitCollections"
              href="/tidbit-collections"
              label="Tidbits"
            />
          );
        }

        if (feature.featureName === FeatureName.ByteCollectionCategories) {
          return (
            <MobileNavLink
              key="tidbitCollectionCategories"
              href="/tidbit-collection-categories"
              label="Tidbits"
            />
          );
        }

        if (feature.featureName === FeatureName.Simulations) {
          return (
            <MobileNavLink
              key="simulations"
              href="/simulations"
              label="Simulations"
            />
          );
        }
        if (feature.featureName === FeatureName.Timelines) {
          return (
            <MobileNavLink
              key="timelines"
              href="/timelines"
              label="Timelines"
            />
          );
        }
        if (feature.featureName === FeatureName.Chatbot) {
          return (
            <MobileNavLink key="ai_chatbot" href="/nema" label="Chatbot" />
          );
        }
        if (feature.featureName === FeatureName.Shorts) {
          return (
            <MobileNavLink key="shorts" href="/shorts" label="Short Videos" />
          );
        }
      })}
    </div>
  );
}

function CreateOrLoginButton(props: {
  session?: Session | undefined | null;
  space: SpaceWithIntegrationsFragment | null | undefined;
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

export default function TopNav(props: {
  space?: SpaceWithIntegrationsFragment | null;
}) {
  const { data: session } = useSession();
  const { setShowLoginModal } = useLoginModalContext();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { space } = props;
  const router = useRouter();

  const superAdmin = !!(session && isSuperAdmin(session as Session));

  return (
    <StyledDiv>
      <FullPageModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={"Create"}
        showCloseButton={false}
      >
        <CreateContentModalContents
          space={props.space}
          hideModal={() => setShowCreateModal(false)}
        />
      </FullPageModal>
      <Disclosure
        as="nav"
        className="shadow"
        style={{
          backgroundColor: "var(--bg-color)",
          color: "var(--text-color)",
          borderBottom: "0.5px solid var(--border-color)",
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
                      {open ? (
                        <XMarkIcon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      ) : (
                        <Bars3Icon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      )}
                    </Disclosure.Button>
                  </div>
                  <div className="flex flex-shrink-0 items-center">
                    <Link href="/">
                      <img
                        className="block h-8 w-auto lg:hidden"
                        src={
                          space?.avatar
                            ? getCDNImageUrl(space.avatar)
                            : "https://tailwindui.com/img/logos/mark.svg"
                        }
                        alt="Your Company"
                        height={50}
                      />
                    </Link>
                    <Link href="/">
                      <img
                        className="hidden h-8 w-auto lg:block"
                        src={
                          space?.avatar
                            ? getCDNImageUrl(space.avatar)
                            : "https://tailwindui.com/img/logos/mark.svg"
                        }
                        alt="Your Company"
                        height={50}
                      />
                    </Link>
                  </div>
                  {space && <DesktopNavLinks space={space} />}
                </div>
                <div className="flex items-center">
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
                      <DesktopProfileMenu
                        session={session as Session}
                        space={space}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Disclosure.Panel className="md:hidden">
              {space && <MobileNavLinks space={space} />}
              {session && space && (
                <MobileProfileMenu session={session as Session} space={space} />
              )}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </StyledDiv>
  );
}
