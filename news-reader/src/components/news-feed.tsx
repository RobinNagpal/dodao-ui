'use client';

import { NewsArticleType, NewsTopicFolderType, NewsTopicType } from '@/lib/news-reader-types';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, ExternalLink, Search, Filter } from 'lucide-react';
import EnhancedArticleCard from '@/components/enhanced-article-card';
import { sampleNews } from '@/lib/sample-data';

interface NewsFeedProps {
  topics: NewsTopicType[];
  folders: NewsTopicFolderType[];
  bookmarks: string[];
  onToggleBookmark: (articleId: string) => void;
  getFolderPath: (folderId: string | null, folders: NewsTopicFolderType[], path?: string[]) => string[];
}

export default function NewsFeed({ topics, folders, bookmarks, onToggleBookmark, getFolderPath }: NewsFeedProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');

  // Get all unique filters from topics
  const allFilters = useMemo<string[]>(() => {
    const filters = new Set<string>();
    topics.forEach((topic) => {
      topic.filters.forEach((filter) => filters.add(filter));
    });
    return Array.from(filters);
  }, [topics]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  // Filter news based on configured topics and their filters
  const filteredNews = useMemo<NewsArticleType[]>(() => {
    return sampleNews.filter((article) => {
      // Check if topic is configured
      const topicConfig = topics.find((t) => t.topic.toLowerCase() === article.keyword.toLowerCase());
      if (!topicConfig) return false;

      // Check if article matches any of the topic's filters
      const hasMatchingFilter = article.filters.some((filter) => topicConfig.filters.includes(filter));
      if (!hasMatchingFilter) return false;

      // Apply search filter
      if (
        searchTerm &&
        !article.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !article.description.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Apply topic filter
      if (selectedTopic !== 'all' && article.keyword !== selectedTopic) {
        return false;
      }

      // Apply filter type filter
      if (selectedFilter !== 'all' && !article.filters.includes(selectedFilter)) {
        return false;
      }

      // Apply folder filter
      if (selectedFolder !== 'all') {
        const folderId = selectedFolder;
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

        const allowedFolderIds = getFolderAndChildren(folders, folderId);
        const topicInFolder = topics.find((t) => t.topic.toLowerCase() === article.keyword.toLowerCase() && allowedFolderIds.includes(t.folderId || ''));
        if (!topicInFolder) return false;
      }

      return true;
    });
  }, [topics, searchTerm, selectedTopic, selectedFilter, selectedFolder, folders]);

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
              <label className="text-sm font-medium">Filter Type</label>
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Filters</SelectItem>
                  {allFilters.map((filter) => (
                    <SelectItem key={filter} value={filter}>
                      {filter}
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
              const topic = topics.find((t) => t.topic.toLowerCase() === article.keyword.toLowerCase());
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
