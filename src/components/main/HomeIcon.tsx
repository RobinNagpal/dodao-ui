import { getLinkToFeaturePage } from '@/components/main/getLinkToFeaturePage';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { FeatureItem, FeatureName } from '@/types/spaceFeatures';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface HomeIconProps {
  space: SpaceWithIntegrationsFragment;
  feature: FeatureItem;
}

function Card({ space, heading, details, featureName }: { space: SpaceWithIntegrationsFragment; heading: string; details: string; featureName: FeatureName }) {
  const { $t } = useI18();
  return (
    <div className="flex flex-col sm:flex-row">
      <Image
        src={$t(`academy.${space.id}.${featureName.toLowerCase()}Thumbnail`)}
        className="academy-image w-full md:w-52 md:h-38 object-cover"
        alt={featureName}
        width={250}
        height={150}
      />
      <div className="w-full">
        <h2 className="text-xl text-center sm:text-left font-semibold px-4 py-2">{heading}</h2>
        <p className="text-sm text-center sm:text-left break-words px-4 pb-4">{details}</p>
      </div>
    </div>
  );
}
function HomeIcon({ space, feature }: HomeIconProps) {
  const { $t } = useI18();

  return (
    <Link
      href={getLinkToFeaturePage(feature.featureName)}
      className="border border-gray-200 rounded-xl shadow-md transform hover:scale-105 transition duration-300 ease-in-out max-w-md overflow-hidden"
    >
      {feature.featureName === FeatureName.Courses && (
        <Card space={space} heading={'Courses'} details={'Detailed courses that help develop a strong foundation'} featureName={feature.featureName} />
      )}
      {feature.featureName === FeatureName.Guides && (
        <Card
          space={space}
          heading={'Guides'}
          details={'If you want to know about some specific topic in 5 minutes or less'}
          featureName={feature.featureName}
        />
      )}
      {feature.featureName === FeatureName.Bytes && (
        <Card
          space={space}
          heading={'Tidbits'}
          details={'If you want to know about some specific topics within 30 seconds'}
          featureName={feature.featureName}
        />
      )}
      {feature.featureName === FeatureName.Simulations && (
        <Card space={space} heading={'Simulations'} details={'Simulations that help you understand the protocol better'} featureName={feature.featureName} />
      )}
      {feature.featureName === FeatureName.Timelines && (
        <Card space={space} heading={'Timelines'} details={'All the updates captured at one place'} featureName={feature.featureName} />
      )}
    </Link>
  );
}

export default HomeIcon;
