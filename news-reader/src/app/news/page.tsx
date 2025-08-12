'use client';

import NewsFeed from '@/components/news-feed';
import { useNewsData } from '@/providers/NewsDataProvider';

export default function NewsPage() {
  const { topics, folders, bookmarks, toggleBookmark, getFolderPath } = useNewsData();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <NewsFeed topics={topics} folders={folders} bookmarks={bookmarks} onToggleBookmark={toggleBookmark} getFolderPath={getFolderPath} />
      </div>
    </div>
  );
}
