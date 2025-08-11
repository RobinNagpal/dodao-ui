'use client';

import { NewsTopicFolderType, NewsTopicTemplateType, NewsTopicType } from '@/lib/news-reader-types';
import { DODAO_ACCESS_TOKEN_KEY } from '@dodao/web-core/types/deprecated/models/enums';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { defaultTemplates, defaultFolders, defaultTopics } from '@/lib/sample-data';

interface NewsDataContextType {
  folders: NewsTopicFolderType[];
  topics: NewsTopicType[];
  templates: NewsTopicTemplateType[];
  bookmarks: string[];
  addTopic: (newTopic: Partial<NewsTopicType>) => void;
  deleteTopic: (id: string) => void;
  addTemplate: (newTemplate: Partial<NewsTopicTemplateType>) => void;
  deleteTemplate: (id: string) => void;
  addFolder: (newFolder: Partial<NewsTopicFolderType>) => void;
  deleteFolder: (id: string) => void;
  toggleBookmark: (articleId: string) => void;
  getFolderPath: (folderId: string | null, folders: NewsTopicFolderType[], path?: string[]) => string[];
}

const NewsDataContext = createContext<NewsDataContextType | undefined>(undefined);

export function useNewsData() {
  const context = useContext(NewsDataContext);
  if (context === undefined) {
    throw new Error('useNewsData must be used within a NewsDataProvider');
  }
  return context;
}

interface NewsDataProviderProps {
  children: ReactNode;
  token?: string;
}

export function NewsDataProvider({ children, token }: NewsDataProviderProps) {
  // Save token to localStorage if provided
  useEffect(() => {
    if (token) {
      localStorage.setItem(DODAO_ACCESS_TOKEN_KEY, token);
    }
  }, [token]);

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

  const value = {
    folders,
    topics,
    templates,
    bookmarks,
    addTopic,
    deleteTopic,
    addTemplate,
    deleteTemplate,
    addFolder,
    deleteFolder,
    toggleBookmark,
    getFolderPath,
  };

  return <NewsDataContext.Provider value={value}>{children}</NewsDataContext.Provider>;
}
