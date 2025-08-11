'use client';

import { Badge } from '@/components/ui/badge';
import { BookOpen, FolderOpen, Filter, LayoutTemplateIcon as Template, Bookmark } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';

interface TopNavProps {
  foldersCount?: number;
  templatesCount?: number;
  topicsCount?: number;
  bookmarksCount?: number;
}

export default function TopNav({ foldersCount = 0, templatesCount = 0, topicsCount = 0, bookmarksCount = 0 }: TopNavProps) {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">NewsReader</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <FolderOpen className="h-3 w-3" />
              {foldersCount} Folders
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Template className="h-3 w-3" />
              {templatesCount} Templates
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Filter className="h-3 w-3" />
              {topicsCount} Topics Active
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Bookmark className="h-3 w-3" />
              {bookmarksCount} Bookmarked
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
