'use client';

import AddTweetCollection from '@/components/tweetCollection/TweetCollections/AddTweetCollection';
import TweetCollectionsCard from '@/components/tweetCollection/TweetCollections/TweetCollectionsCard/TweetCollectionsCard';
import NoTweetCollections from '@/components/tweetCollection/View/NoTweetCollections';
import { TweetCollectionSummary } from '@/types/tweetCollections/tweetCollection';
import { isAdmin } from '@/utils/auth/isAdmin';
import ToggleWithIcon from '@dodao/web-core/components/core/toggles/ToggleWithIcon';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function TweetCollectionsGrid({ tweetCollections }: { tweetCollections?: TweetCollectionSummary[] }) {
  const router = useRouter();
  const currentPath = usePathname();
  const searchParams = useSearchParams();
  const archived = searchParams.get('archive');
  const isArchived = archived === 'true';
  const isUserAdmin = isAdmin();

  const tweetCollectionsList = isArchived && isUserAdmin ? tweetCollections : tweetCollections?.filter((tweetCollection) => !tweetCollection.archive);

  const handleToggle = () => {
    const newRoute = `${currentPath}?archive=${!isArchived}`;
    router.push(newRoute);
  };

  return (
    <>
      {isUserAdmin && (
        <div className="flex justify-end mb-2 items-center gap-x-8">
          <ToggleWithIcon label={'See Archived'} enabled={isArchived} setEnabled={handleToggle} onClickOnLabel={true} />
        </div>
      )}
      {!tweetCollectionsList?.length && !isAdmin && <NoTweetCollections />}
      {!!tweetCollectionsList?.length && (
        <div className="my-5">
          {tweetCollectionsList?.map((tweetCollection, i) => (
            <TweetCollectionsCard key={i} tweetCollection={tweetCollection} isAdmin={isUserAdmin} showArchived={isArchived} />
          ))}
        </div>
      )}
      {isUserAdmin && <AddTweetCollection />}
    </>
  );
}
