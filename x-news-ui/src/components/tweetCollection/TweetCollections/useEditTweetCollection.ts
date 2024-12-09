import { TweetCollectionDto, TweetCollectionSummary } from '@/types/tweetCollections/tweetCollection';
import { CreateTweetCollectionRequest } from '@/types/request/TweetCollectionRequests';
import { useUpdateData } from '@dodao/web-core/ui/hooks/fetch/useUpdateData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useEffect, useState } from 'react';
import { getAdminKey } from '@/utils/auth/getAdminKey';

export type EditTweetCollection = Omit<TweetCollectionSummary, 'id'> & {
  id?: string;
};

interface HelperFunctions {
  updateTweetCollectionName: (name: string) => void;
  updateTweetCollectionDescription: (description: string) => void;
  updateTweetCollectionHandles: (handles: string[]) => void;
  upsertTweetCollection: () => void;
}

interface UseEditTweetCollectionType {
  isPrestine: boolean;
  loading: boolean;
  tweetCollection: EditTweetCollection;
  helperFunctions: HelperFunctions;
}

export interface UseEditTweetCollectionArgs {
  tweetCollection?: TweetCollectionSummary;
}

export function useEditTweetCollection({ tweetCollection: tweetCollectionProp }: UseEditTweetCollectionArgs): UseEditTweetCollectionType {
  const redirectPath = '/';
  const { updateData: putData } = useUpdateData<TweetCollectionDto, CreateTweetCollectionRequest>(
    {
      headers: {
        'admin-key': getAdminKey(),
      },
    },
    {
      successMessage: 'Tweet collection updated successfully',
      errorMessage: 'Failed to create updated collection',
      redirectPath: `${redirectPath}?updated=${Date.now()}`,
    },
    'PUT'
  );

  const { postData } = usePostData<TweetCollectionDto, CreateTweetCollectionRequest>(
    {
      redirectPath: `${redirectPath}?updated=${Date.now()}`,
      successMessage: 'Tweet collection created successfully',
      errorMessage: 'Failed to create tweet collection',
    },
    {
      headers: {
        'admin-key': getAdminKey(),
      },
    }
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [isPrestine, setIsPrestine] = useState<boolean>(true);

  const [tweetCollection, setTweetCollection] = useState<EditTweetCollection>({
    id: tweetCollectionProp?.id,
    name: tweetCollectionProp?.name || '',
    description: tweetCollectionProp?.description || '',
    handles: tweetCollectionProp?.handles || [],
    archive: tweetCollectionProp?.archive || false,
    tweets: tweetCollectionProp?.tweets || [],
  });

  useEffect(() => {
    setTweetCollection({
      id: tweetCollectionProp?.id,
      name: tweetCollectionProp?.name || '',
      description: tweetCollectionProp?.description || '',
      handles: tweetCollectionProp?.handles || [],
      archive: tweetCollectionProp?.archive || false,
      tweets: tweetCollectionProp?.tweets || [],
    });
  }, [tweetCollectionProp]);

  const updateTweetCollectionName = (name: string) => {
    setTweetCollection((prevTweet) => ({ ...prevTweet, name }));
  };

  const updateTweetCollectionDescription = (description: string) => {
    setTweetCollection((prevTweet) => ({ ...prevTweet, description }));
  };

  const updateTweetCollectionHandles = (handles: string[]) => {
    setTweetCollection((prevTweet) => ({ ...prevTweet, handles }));
  };

  const upsertTweetCollection = async () => {
    setIsPrestine(false);

    if (!tweetCollection.name.trim() || !tweetCollection.description.trim() || !tweetCollection.handles.length) {
      return;
    }
    try {
      setLoading(true);
      if (tweetCollectionProp?.id) {
        await putData(`${getBaseUrl()}/api/tweet-collections/${tweetCollectionProp.id}`, {
          name: tweetCollection.name,
          description: tweetCollection.description,
          handles: tweetCollection.handles,
          archive: tweetCollection.archive,
        });
      } else {
        await postData(`${getBaseUrl()}/api/tweet-collections`, {
          name: tweetCollection.name,
          description: tweetCollection.description,
          handles: tweetCollection.handles,
          archive: tweetCollection.archive,
        });
      }
      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  return {
    isPrestine,
    loading,
    tweetCollection,
    helperFunctions: {
      updateTweetCollectionName,
      updateTweetCollectionDescription,
      updateTweetCollectionHandles,
      upsertTweetCollection,
    },
  };
}
