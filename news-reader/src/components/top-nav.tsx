'use client';

import { Badge } from '@/components/ui/badge';
import { BookOpen, FolderOpen, Filter, LayoutTemplateIcon as Template, Bookmark, Plus, Settings } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TopNavProps {
  foldersCount?: number;
  templatesCount?: number;
  topicsCount?: number;
  bookmarksCount?: number;
}

export default function TopNav({ foldersCount = 0, templatesCount = 0, topicsCount = 0, bookmarksCount = 0 }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Get the active tab value based on the current pathname
  const getActiveTab = () => {
    if (pathname === '/' || pathname === '/news') return 'news';
    if (pathname === '/topics/add') return 'add';
    if (pathname === '/topics/manage') return 'manage';
    if (pathname === '/folders') return 'folders';
    if (pathname === '/news-templates') return 'templates';
    if (pathname === '/bookmarks') return 'bookmarks';
    return 'news'; // Default to news
  };

  return (
    <header>
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
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
        </div>
      </div>
      <div className="container mx-auto px-4 pt-6">
        <div className="flex flex-col">
          <Tabs value={getActiveTab()} className="w-full">
            <TabsList className="h-10 w-full grid grid-cols-6 gap-1">
              <TabsTrigger
                value="news"
                onClick={() => router.push('/news')}
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <BookOpen className="h-4 w-4" />
                News Feed
              </TabsTrigger>
              <TabsTrigger
                value="add"
                onClick={() => router.push('/topics/add')}
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
                Add Topic
              </TabsTrigger>
              <TabsTrigger
                value="manage"
                onClick={() => router.push('/topics/manage')}
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Settings className="h-4 w-4" />
                Manage Topics
              </TabsTrigger>
              <TabsTrigger
                value="folders"
                onClick={() => router.push('/folders')}
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <FolderOpen className="h-4 w-4" />
                Folders
              </TabsTrigger>
              <TabsTrigger
                value="templates"
                onClick={() => router.push('/news-templates')}
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Template className="h-4 w-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger
                value="bookmarks"
                onClick={() => router.push('/bookmarks')}
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Bookmark className="h-4 w-4" />
                Bookmarks
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </header>
  );
}
