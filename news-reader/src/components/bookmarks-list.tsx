'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NewsArticleType } from '@/lib/news-reader-types';
import { Bookmark, BookmarkCheck, ExternalLink, Clock } from 'lucide-react';
import EnhancedArticleCard from '@/components/enhanced-article-card';
import { sampleNews } from '@/lib/sample-data';

interface BookmarksListProps {
  bookmarks: string[];
  onToggleBookmark: (articleId: string) => void;
}

export default function BookmarksList({ bookmarks, onToggleBookmark }: BookmarksListProps) {
  const bookmarkedArticles: NewsArticleType[] = sampleNews.filter((article) => bookmarks.includes(article.id));

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Bookmarked Articles</h3>
        <p className="text-muted-foreground mb-4">Bookmark articles from the news feed to save them for later reading</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Bookmarked Articles</h2>
        <Badge variant="outline">
          {bookmarks.length} article{bookmarks.length !== 1 ? 's' : ''} bookmarked
        </Badge>
      </div>

      <div className="grid gap-4">
        {bookmarkedArticles.map((article) => (
          <EnhancedArticleCard key={article.id} article={article} isBookmarked={true} onToggleBookmark={onToggleBookmark} folderPath={null} />
        ))}
      </div>
    </div>
  );
}
