'use client';

import { NewsTopicFolderType, NewsTopicTemplateType, NewsTopicType } from '@/lib/news-reader-types';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import TopicManager from '@/components/topic-manager';

export default function NewsTopicsPage() {
  const baseUrl: string = getBaseUrl();

  // Use useFetchData hook to fetch topics from the server
  const {
    data: topics,
    loading: isTopicsLoading,
    error: topicsError,
    reFetchData: fetchTopics,
  } = useFetchData<NewsTopicType[]>(`${baseUrl}/api/news-topics`, {}, 'Failed to load topics. Please try again later.');

  // Use useFetchData hook to fetch templates from the server
  const {
    data: templates,
    loading: isTemplatesLoading,
    error: templatesError,
  } = useFetchData<NewsTopicTemplateType[]>(`${baseUrl}/api/news-topic-templates`, {}, 'Failed to load templates. Please try again later.');

  // Use useFetchData hook to fetch folders from the server
  const {
    data: folders,
    loading: isFoldersLoading,
    error: foldersError,
  } = useFetchData<NewsTopicFolderType[]>(`${baseUrl}/api/news-topic-folders`, {}, 'Failed to load folders. Please try again later.');

  // Helper function to get folder path
  const getFolderPath = (folderId: string | null, folders: NewsTopicFolderType[], path: string[] = []): string[] => {
    if (!folderId) return path;

    for (const folder of folders) {
      if (folder.id === folderId) {
        return [...path, folder.name];
      }

      if (folder.children.length > 0) {
        const childPath = getFolderPath(folderId, folder.children, [...path, folder.name]);
        if (childPath.length > path.length) {
          return childPath;
        }
      }
    }

    return path;
  };

  const isLoading: boolean = isTopicsLoading || isTemplatesLoading || isFoldersLoading;
  const error: string | null | undefined = topicsError || templatesError || foldersError;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {isLoading && (
          <div className="flex justify-center items-center h-40">
            <FullPageLoader />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex justify-center items-center h-40">
            <div className="text-red-500">{error}</div>
          </div>
        )}

        {(!isLoading && !error && topics && templates && folders && (
          <TopicManager topics={topics} templates={templates} folders={folders} getFolderPath={getFolderPath} fetchTopics={fetchTopics} />
        )) ||
          null}
      </div>
    </div>
  );
}
