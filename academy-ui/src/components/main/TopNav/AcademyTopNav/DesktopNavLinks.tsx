import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { getSortedFeaturesArray } from '@/utils/features';
import { DesktopNavLink } from '@dodao/web-core/components/main/TopNav/DesktopNavLink';
import { FeatureItem, FeatureName } from '@dodao/web-core/types/features/spaceFeatures';
import React from 'react';

export function DesktopNavLinks({ space }: { space: SpaceWithIntegrationsDto }) {
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
        if (feature.featureName === FeatureName.ClickableDemos) {
          return <DesktopNavLink key="clickableDemos" href="/clickable-demos" label="Clickable Demos" />;
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
