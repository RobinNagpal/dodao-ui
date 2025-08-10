'use client';

import { NewsTopicFolderType, NewsTopicTemplateType, NewsTopicType } from '@/lib/news-reader-types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Settings, BookOpen, Filter, LayoutTemplateIcon as Template, FolderOpen, Bookmark } from 'lucide-react';
import AddTopicForm from '@/components/add-topic-form';
import TopicList from '@/components/topic-list';
import NewsFeed from '@/components/news-feed';
import TemplateManager from '@/components/template-manager';
import FolderManager from '@/components/folder-manager';
import BookmarksList from '@/components/bookmarks-list';
import { defaultTemplates, defaultFolders, defaultTopics } from '@/lib/sample-data';
import Link from 'next/link';

export default function HomePage(): React.ReactNode {
  const [activeTab, setActiveTab] = useState<string>('feed');
  const [folders, setFolders] = useState<NewsTopicFolderType[]>(defaultFolders);
  const [topics, setTopics] = useState<NewsTopicType[]>(defaultTopics);
  const [templates, setTemplates] = useState<NewsTopicTemplateType[]>(defaultTemplates);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // Add a new topic
  const addTopic = (newTopic: Partial<NewsTopicType>): void => {
    const topic: NewsTopicType = {
      ...(newTopic as NewsTopicType),
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user',
      updatedBy: 'user',
    };
    setTopics([...topics, topic]);
  };

  // Delete a topic by ID
  const deleteTopic = (id: string): void => {
    setTopics(topics.filter((t) => t.id !== id));
  };

  // Add a new template
  const addTemplate = (newTemplate: Partial<NewsTopicTemplateType>): void => {
    const template: NewsTopicTemplateType = {
      ...(newTemplate as NewsTopicTemplateType),
      id: Date.now().toString(),
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user',
      updatedBy: 'user',
    };
    setTemplates([...templates, template]);
  };

  // Delete a template by ID
  const deleteTemplate = (id: string): void => {
    setTemplates(templates.filter((t) => t.id !== id || t.isDefault));
  };

  // Add a new folder
  const addFolder = (newFolder: Partial<NewsTopicFolderType>): void => {
    const folder: NewsTopicFolderType = {
      ...(newFolder as NewsTopicFolderType),
      id: Date.now().toString(),
      children: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user',
      updatedBy: 'user',
    };

    if (newFolder.parentId) {
      // Add to parent folder
      const updateFolders = (folders: NewsTopicFolderType[]): NewsTopicFolderType[] => {
        return folders.map((f) => {
          if (f.id === newFolder.parentId) {
            return { ...f, children: [...f.children, folder] };
          }
          if (f.children.length > 0) {
            return { ...f, children: updateFolders(f.children) };
          }
          return f;
        });
      };
      setFolders(updateFolders(folders));
    } else {
      // Add as root folder
      setFolders([...folders, folder]);
    }
  };

  // Delete a folder by ID
  const deleteFolder = (id: string): void => {
    // Move topics from deleted folder to root
    setTopics(topics.map((t) => (t.folderId === id ? { ...t, folderId: null } : t)));

    // Remove folder
    const removeFolderRecursive = (folders: NewsTopicFolderType[]): NewsTopicFolderType[] => {
      return folders
        .filter((f) => f.id !== id)
        .map((f) => ({
          ...f,
          children: removeFolderRecursive(f.children),
        }));
    };
    setFolders(removeFolderRecursive(folders));
  };

  // Toggle bookmark status for an article
  const toggleBookmark = (articleId: string): void => {
    if (bookmarks.includes(articleId)) {
      setBookmarks(bookmarks.filter((id) => id !== articleId));
    } else {
      setBookmarks([...bookmarks, articleId]);
    }
  };

  // Get folder path for display
  const getFolderPath = (folderId: string | null, folders: NewsTopicFolderType[], path: string[] = []): string[] => {
    if (!folderId) return path;

    const findFolder = (folders: NewsTopicFolderType[]): NewsTopicFolderType | null => {
      for (const folder of folders) {
        if (folder.id === folderId) {
          return folder;
        }
        const found = findFolder(folder.children);
        if (found) return found;
      }
      return null;
    };

    const folder = findFolder(folders);
    if (folder) {
      const newPath = [folder.name, ...path];
      return folder.parentId ? getFolderPath(folder.parentId, folders, newPath) : newPath;
    }
    return path;
  };

  return (
    <div className="min-h-screen bg-background">
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
                {folders.length} Folders
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Template className="h-3 w-3" />
                {templates.length} Templates
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Filter className="h-3 w-3" />
                {topics.length} Topics Active
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Bookmark className="h-3 w-3" />
                {bookmarks.length} Bookmarked
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 border border-gray-400 pb-4 mb-6">
            <TabsTrigger value="feed" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              News Feed
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Topic
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Manage Topics
            </TabsTrigger>
            <TabsTrigger value="folders" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Folders
            </TabsTrigger>
            <Link
              href="/news-templates"
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <Template className="h-4 w-4" />
              Templates
            </Link>
            <TabsTrigger value="bookmarks" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Bookmarks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-6">
            <NewsFeed topics={topics} folders={folders} bookmarks={bookmarks} onToggleBookmark={toggleBookmark} getFolderPath={getFolderPath} />
          </TabsContent>

          <TabsContent value="add" className="mt-6">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Add New News Topic</CardTitle>
                  <CardDescription>Configure a new topic to track news articles. You can use a template or create your own configuration.</CardDescription>
                </CardHeader>
                <CardContent>
                  <AddTopicForm onAdd={addTopic} templates={templates} onAddTemplate={addTemplate} folders={folders} getFolderPath={getFolderPath} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="manage" className="mt-6">
            <TopicList topics={topics} onDelete={deleteTopic} folders={folders} getFolderPath={getFolderPath} />
          </TabsContent>

          <TabsContent value="folders" className="mt-6">
            <FolderManager folders={folders} onAdd={addFolder} onDelete={deleteFolder} topics={topics} />
          </TabsContent>

          <TabsContent value="bookmarks" className="mt-6">
            <BookmarksList bookmarks={bookmarks} onToggleBookmark={toggleBookmark} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
