import { getLinkToFeaturePage } from '@/components/main/getLinkToFeaturePage';
import { useI18 } from '@/hooks/useI18';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { FeatureItem, FeatureName } from '@dodao/web-core/types/features/spaceFeatures';
import Link from 'next/link';
import React from 'react';
import styles from './HomeIcon.module.scss';

interface HomeIconProps {
  space: SpaceWithIntegrationsDto;
  feature: FeatureItem;
}

function Card({ space, heading, details, featureName }: { space: SpaceWithIntegrationsDto; heading: string; details: string; featureName: FeatureName }) {
  const { $t } = useI18();
  return (
    <div className="flex flex-row">
      <div className={'flex justify-center align-middle ' + styles.iconWrapper}>
        <img src={$t(`academy.${space.id}.${featureName.toLowerCase()}Thumbnail`)} alt={featureName} className="object-cover w-full" />
      </div>
      <div className="ml-1">
        <h2 className="text-sm sm:text-xl text-left font-semibold px-4 py-2">{heading}</h2>
        <p className="text-xs sm:text-sm text-left break-words px-4 pb-4">{details}</p>
      </div>
    </div>
  );
}

function HomeIcon({ space, feature }: HomeIconProps) {
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
      {feature.featureName === FeatureName.ByteCollections && (
        <Card space={space} heading={'Tidbits'} details={'If you want to know the most important details within 2 minutes'} featureName={feature.featureName} />
      )}
      {feature.featureName === FeatureName.Simulations && (
        <Card space={space} heading={'Simulations'} details={'Simulations that help you understand the protocol better'} featureName={feature.featureName} />
      )}
      {feature.featureName === FeatureName.ClickableDemos && (
        <Card
          space={space}
          heading={'Clickable Demos'}
          details={'Clickable Demos that help you understand the protocol better'}
          featureName={feature.featureName}
        />
      )}
      {feature.featureName === FeatureName.Timelines && (
        <Card space={space} heading={'Timelines'} details={'All the updates captured at one place'} featureName={feature.featureName} />
      )}
      {feature.featureName === FeatureName.Chatbot && (
        <Card space={space} heading={'AI Chatbot'} details={'Ask anything you want'} featureName={feature.featureName} />
      )}
      {feature.featureName === FeatureName.Shorts && (
        <Card space={space} heading={'Shorts/Reels'} details={'1 min videos explaining once thing at a time'} featureName={feature.featureName} />
      )}
    </Link>
  );
}

export default HomeIcon;
