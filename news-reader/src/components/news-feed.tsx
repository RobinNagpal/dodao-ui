'use client';

import { NewsArticleType, NewsTopicFolderType, NewsTopicType } from '@/lib/news-reader-types';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, ExternalLink, Search, Filter } from 'lucide-react';
import EnhancedArticleCard from '@/components/enhanced-article-card';

interface NewsFeedProps {
  topics: NewsTopicType[];
  folders: NewsTopicFolderType[];
  articles: NewsArticleType[];
  bookmarks: string[];
  onToggleBookmark: (articleId: string) => void;
  getFolderPath: (folderId: string | null, folders: NewsTopicFolderType[], path?: string[]) => string[];
  selectedTopic: string;
  setSelectedTopic: (topic: string) => void;
  selectedFolder: string;
  setSelectedFolder: (folder: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function NewsFeed({
  topics,
  folders,
  articles,
  bookmarks,
  onToggleBookmark,
  getFolderPath,
  selectedTopic,
  setSelectedTopic,
  selectedFolder,
  setSelectedFolder,
  searchTerm,
  setSearchTerm,
}: NewsFeedProps) {
  // Flatten folders for selection
  const flattenFolders = (folders: NewsTopicFolderType[], level = 0): (NewsTopicFolderType & { level: number })[] => {
    let result: (NewsTopicFolderType & { level: number })[] = [];
    folders.forEach((folder) => {
      result.push({ ...folder, level });
      if (folder.children.length > 0) {
        result = result.concat(flattenFolders(folder.children, level + 1));
      }
    });
    return result;
  };

  const flatFolders = flattenFolders(folders);

  // Filter news based on folder and topic selection
  const filteredNews = useMemo<NewsArticleType[]>(() => {
    // Start with all articles
    let filtered = [...articles];

    // Apply topic filter if a specific topic is selected
    if (selectedTopic !== 'all') {
      const topic = topics.find((t) => t.topic === selectedTopic);
      if (topic) {
        filtered = filtered.filter((article) => article.topicId === topic.id);
      }
    }

    // Apply folder filter if a specific folder is selected
    if (selectedFolder !== 'all') {
      // Get all folder IDs including children
      const getFolderAndChildren = (folders: NewsTopicFolderType[], targetId: string): string[] => {
        let result: string[] = [];
        folders.forEach((folder) => {
          if (folder.id === targetId) {
            result.push(folder.id);
            const getChildIds = (children: NewsTopicFolderType[]): void => {
              children.forEach((child) => {
                result.push(child.id);
                if (child.children.length > 0) {
                  getChildIds(child.children);
                }
              });
            };
            getChildIds(folder.children);
          } else if (folder.children.length > 0) {
            result = result.concat(getFolderAndChildren(folder.children, targetId));
          }
        });
        return result;
      };

      // Get all topic IDs in the selected folder and its children
      const allowedFolderIds = getFolderAndChildren(folders, selectedFolder);
      const topicIdsInFolder = topics.filter((topic) => topic.folderId && allowedFolderIds.includes(topic.folderId)).map((topic) => topic.id);

      // Filter articles by topic IDs
      filtered = filtered.filter((article) => article.topicId && topicIdsInFolder.includes(article.topicId));
    }

    return filtered;
  }, [articles, selectedTopic, selectedFolder, folders, topics]);

  if (topics.length === 0) {
    return (
      <div className="text-center py-12">
        <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Topics Configured</h3>
        <p className="text-muted-foreground mb-4">Add topics to start seeing filtered news articles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Filter News</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search articles..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Topic</label>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.topic}>
                      {topic.topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Folder</label>
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Folders</SelectItem>
                  {flatFolders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span style={{ marginLeft: `${folder.level * 12}px` }}>
                          {'  '.repeat(folder.level)}
                          {folder.level > 0 && '└ '}
                          {folder.name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News Articles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">News Feed</h2>
          <Badge variant="outline">
            {filteredNews.length} article{filteredNews.length !== 1 ? 's' : ''} found
          </Badge>
        </div>

        {filteredNews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Articles Found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or add more topics to see relevant news</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredNews.map((article) => {
              const topic = topics.find((t) => t.id === article.topicId);
              const folderPath = topic?.folderId ? getFolderPath(topic.folderId, folders) : null;

              return (
                <EnhancedArticleCard
                  key={article.id}
                  article={article}
                  isBookmarked={bookmarks.includes(article.id)}
                  onToggleBookmark={onToggleBookmark}
                  folderPath={folderPath}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
