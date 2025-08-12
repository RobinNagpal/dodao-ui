'use client';

import BookmarksList from '@/components/bookmarks-list';
import { useNewsData } from '@/providers/NewsDataProvider';

export default function BookmarksPage() {
  const { bookmarks, toggleBookmark } = useNewsData();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <BookmarksList bookmarks={bookmarks} onToggleBookmark={toggleBookmark} />
      </div>
    </div>
  );
}
