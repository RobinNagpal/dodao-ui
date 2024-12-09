import TweetCollectionsGrid from '@/components/tweetCollection/View/TweetCollectionsGrid';
import { TweetCollectionSummary } from '@/types/tweetCollections/tweetCollection';
import CollectionPageLoading from '@dodao/web-core/components/core/loaders/CollectionPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import React, { Suspense } from 'react';

interface HomepageProps {
  tweetCollections: TweetCollectionSummary[];
}

export default function Homepage({ tweetCollections }: HomepageProps) {
  return (
    <PageWrapper>
      <div className="text-center">
        <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-2xl primary-color">X News</h1>
        <p className="mt-2 mb-6 text-lg leading-8">Latest Tweets</p>
      </div>
      <Suspense fallback={<CollectionPageLoading />}>
        <TweetCollectionsGrid tweetCollections={tweetCollections} />
      </Suspense>
    </PageWrapper>
  );
}
