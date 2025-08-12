'use client';

import FolderManager from '@/components/folder-manager';
import { NewsTopicFolderType, NewsTopicType } from '@/lib/news-reader-types';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

export default function FoldersPage(): React.ReactNode {
  const baseUrl: string = getBaseUrl();

  // Use useFetchData hook to fetch folders from the server
  const {
    data: folders,
    loading: isLoading,
    error: fetchError,
    reFetchData: fetchFolders,
  } = useFetchData<NewsTopicFolderType[]>(`${baseUrl}/api/news-topic-folders`, {}, 'Failed to load folders. Please try again later.');

  // Use useFetchData hook to fetch topics from the server
  const { data: topics, loading: isTopicsLoading } = useFetchData<NewsTopicType[]>(
    `${baseUrl}/api/news-topics`,
    {},
    'Failed to load topics. Please try again later.'
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {(isLoading || isTopicsLoading) && (
          <div className="flex justify-center items-center h-40">
            <FullPageLoader />
          </div>
        )}

        {/* Error state */}
        {fetchError && (
          <div className="flex justify-center items-center h-40">
            <div className="text-red-500">{fetchError}</div>
          </div>
        )}

        {(!isLoading && !isTopicsLoading && !fetchError && folders && topics && (
          <FolderManager folders={folders} topics={topics} fetchFolders={fetchFolders} />
        )) ||
          null}
      </div>
    </div>
  );
}
