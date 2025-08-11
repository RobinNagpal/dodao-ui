'use client';

import { NewsTopicFolderType, NewsTopicTemplateType, NewsTopicType } from '@/lib/news-reader-types';
import { DODAO_ACCESS_TOKEN_KEY } from '@dodao/web-core/types/deprecated/models/enums';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Plus, Settings, BookOpen, Filter, LayoutTemplateIcon as Template, FolderOpen, Bookmark } from 'lucide-react';
import AddTopicForm from '@/components/add-topic-form';
import TopicList from '@/components/topic-list';
import NewsFeed from '@/components/news-feed';
import TemplateManager from '@/components/template-manager';
import FolderManager from '@/components/folder-manager';
import BookmarksList from '@/components/bookmarks-list';
import { ThemeToggle } from '@/components/theme-toggle';
import { defaultTemplates, defaultFolders, defaultTopics } from '@/lib/sample-data';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ClientSideHomePageProps {
  token: string;
}

export default function ClientSideHomePage({ token }: ClientSideHomePageProps) {
  // Save token to localStorage as the first thing
  useEffect(() => {
    if (token) {
      localStorage.setItem(DODAO_ACCESS_TOKEN_KEY, token);
    }
  }, [token]);

  // Use the pathname to determine which tab content to show
  const pathname = usePathname();

  // Map pathname to tab value
  const getActiveTab = () => {
    if (pathname === '/' || pathname === '/news') return 'feed';
    if (pathname === '/topics/add') return 'add';
    if (pathname === '/topics/manage') return 'manage';
    if (pathname === '/folders') return 'folders';
    if (pathname === '/news-templates') return 'templates';
    if (pathname === '/bookmarks') return 'bookmarks';
    return 'feed'; // Default to feed
  };
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
      <div className="container mx-auto px-4 py-6">
        <Tabs value={getActiveTab()} className="w-full">
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

          <TabsContent value="templates" className="mt-6">
            <TemplateManager templates={templates} fetchTemplates={() => {}} />
          </TabsContent>

          <TabsContent value="bookmarks" className="mt-6">
            <BookmarksList bookmarks={bookmarks} onToggleBookmark={toggleBookmark} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
