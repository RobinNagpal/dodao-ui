'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNewsData } from '@/providers/NewsDataProvider';
import { DODAO_ACCESS_TOKEN_KEY } from '@dodao/web-core/types/deprecated/models/enums';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Bookmark, BookOpen, Filter, FolderOpen, LayoutTemplateIcon as Template, Plus, Settings } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TopNav() {
  const { folders, templates, topics, bookmarks } = useNewsData();
  const foldersCount = folders.length;
  const templatesCount = templates.length;
  const topicsCount = topics.length;
  const bookmarksCount = bookmarks.length;
  const pathname = usePathname();
  const router = useRouter();

  // Get the active tab value based on the current pathname
  const getActiveTab = () => {
    if (pathname === '/' || pathname === '/news') return 'news';
    if (pathname === '/news-topics') return 'topics';
    if (pathname === '/folders') return 'folders';
    if (pathname === '/news-templates' || pathname === '/news-topic-templates') return 'templates';
    if (pathname === '/bookmarks') return 'bookmarks';
    return 'news'; // Default to news
  };

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch(`${getBaseUrl()}/api/temp-token`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch token');
        }

        const data = await response.json();
        localStorage.setItem(DODAO_ACCESS_TOKEN_KEY, data.token);
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    };

    fetchToken();
  }, []);

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
            <TabsList className="h-10 w-full grid grid-cols-5 gap-1">
              <TabsTrigger
                value="news"
                onClick={() => router.push('/news')}
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <BookOpen className="h-4 w-4" />
                News Feed
              </TabsTrigger>
              <TabsTrigger
                value="topics"
                onClick={() => router.push('/news-topics')}
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Filter className="h-4 w-4" />
                News Topics
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
                onClick={() => router.push('/news-topic-templates')}
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
