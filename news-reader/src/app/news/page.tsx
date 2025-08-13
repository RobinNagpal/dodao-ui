'use client';

import NewsFeed from '@/components/news-feed';
import { NewsArticleType, NewsTopicFolderType, NewsTopicType } from '@/lib/news-reader-types';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState, useEffect } from 'react';

export default function NewsPage(): React.ReactNode {
  const baseUrl: string = getBaseUrl();
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Use useFetchData hook to fetch topics from the server
  const {
    data: topics,
    loading: isTopicsLoading,
    error: topicsError,
  } = useFetchData<NewsTopicType[]>(`${baseUrl}/api/news-topics`, {}, 'Failed to load topics. Please try again later.');

  // Use useFetchData hook to fetch folders from the server
  const {
    data: folders,
    loading: isFoldersLoading,
    error: foldersError,
  } = useFetchData<NewsTopicFolderType[]>(`${baseUrl}/api/news-topic-folders`, {}, 'Failed to load folders. Please try again later.');

  // Build query parameters for news articles
  const buildQueryParams = (): Record<string, string> => {
    const params: Record<string, string> = {};

    if (selectedTopic !== 'all') {
      // Find the topic ID by name
      const topic = topics?.find((t) => t.topic === selectedTopic);
      if (topic) {
        params.topicId = topic.id;
      }
    }

    if (searchTerm) {
      params.keyword = searchTerm;
    }

    return params;
  };

  // Use useFetchData hook to fetch news articles from the server
  const {
    data: articles,
    loading: isArticlesLoading,
    error: articlesError,
    reFetchData: fetchArticles,
  } = useFetchData<NewsArticleType[]>(`${baseUrl}/api/news-articles`, buildQueryParams(), 'Failed to load news articles. Please try again later.');

  // Refetch articles when filters change
  useEffect(() => {
    if (topics && folders) {
      fetchArticles();
    }
  }, [selectedTopic, searchTerm, topics, folders, fetchArticles]);

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

  // Toggle bookmark function
  const toggleBookmark = (articleId: string): void => {
    setBookmarks((prev) => (prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId]));
  };

  const isLoading: boolean = isTopicsLoading || isFoldersLoading || isArticlesLoading;
  const error: string | null = topicsError || foldersError || articlesError;

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

        {(!isLoading && !error && topics && folders && articles && (
          <NewsFeed
            topics={topics}
            folders={folders}
            articles={articles}
            bookmarks={bookmarks}
            onToggleBookmark={toggleBookmark}
            getFolderPath={getFolderPath}
            selectedTopic={selectedTopic}
            setSelectedTopic={setSelectedTopic}
            selectedFolder={selectedFolder}
            setSelectedFolder={setSelectedFolder}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        )) ||
          null}
      </div>
    </div>
  );
}
