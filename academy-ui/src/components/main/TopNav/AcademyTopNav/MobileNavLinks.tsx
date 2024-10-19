import { Space } from '@/graphql/generated/generated-types';
import { getSortedFeaturesArray } from '@/utils/features';
import { MobileNavLink } from '@dodao/web-core/components/main/TopNav/MobileNavLink';
import { FeatureItem, FeatureName } from '@dodao/web-core/types/features/spaceFeatures';
import React from 'react';

export function MobileNavLinks({ space }: { space: Space }) {
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
