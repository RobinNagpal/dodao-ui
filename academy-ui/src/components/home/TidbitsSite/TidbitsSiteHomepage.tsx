import ByteCollectionCategoryGrid from '@/components/byteCollectionCategory/View/ByteCollectionCategoryGrid';
import { GetStartedButton } from '@dodao/web-core/components/home/common/GetStartedButton';
import { CategoryWithByteCollection, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { Session } from '@dodao/web-core/types/auth/Session';
import React from 'react';
import styles from './TidbitsHomepage.module.scss';

interface TidbitsSiteHomepageProps {
  space: SpaceWithIntegrationsFragment;
  categoriesArray: CategoryWithByteCollection[];
  session: Session;
}

export default function TidbitsSiteHomepage({ space, categoriesArray, session }: TidbitsSiteHomepageProps) {
  return (
    <div className="flex flex-col">
      <div className={`${styles.backgroundColor} flex-1`}>
        <div className="relative px-6 lg:px-8 flex flex-col justify-center">
          <div className="inset-x-0 absolute -top-40 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true"></div>
          <div className="mx-auto max-w-2xl py-8 sm:py-16 lg:pt-12">
            <div className="text-center">
              <h1 className={`text-3xl font-bold tracking-tight lg:text-5xl ${styles.headingColor}`}>
                {space.tidbitsHomepage?.heading || 'Learn with Tidbits'}
              </h1>
              <p className={`mt-6 text-lg leading-8 text-gray-600 ${styles.textColor}`}>
                {space.tidbitsHomepage?.shortDescription ||
                  'Dive into the joy of learning with Tidbits! Our bite-sized lessons make acquiring knowledge fun and effortless, sparking your curiosity with fascinating insights across a wide range of topics.'}
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <GetStartedButton href={`/tidbit-collection-categories/view/${categoriesArray[0].id}/tidbit-collections`}>
                  Get started <span aria-hidden="true">→</span>
                </GetStartedButton>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`${styles.backgroundColor}`}>
        <ByteCollectionCategoryGrid space={space} categoriesArray={categoriesArray} session={session} />
      </div>
    </div>
  );
}
