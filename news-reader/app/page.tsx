"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Settings, BookOpen, Filter, LayoutTemplateIcon as Template, FolderOpen, Bookmark } from 'lucide-react'
import AddTopicForm from "@/components/add-topic-form"
import TopicList from "@/components/topic-list"
import NewsFeed from "@/components/news-feed"
import TemplateManager from "@/components/template-manager"
import FolderManager from "@/components/folder-manager"
import BookmarksList from "@/components/bookmarks-list"

// Predefined templates
const defaultTemplates = [
  {
    id: 1,
    name: "Technology Company",
    description: "Track major technology companies",
    filters: ["Financial Changes", "Product Launches", "Core Management Changes", "Partnership Announcements"],
    isDefault: true
  },
  {
    id: 2,
    name: "Startup Tracking",
    description: "Monitor startup companies and funding",
    filters: ["Financial Changes", "Partnership Announcements", "Product Launches", "Market Expansion"],
    isDefault: true
  },
  {
    id: 3,
    name: "Public Company",
    description: "Track publicly traded companies",
    filters: ["Financial Changes", "Regulatory Updates", "Core Management Changes", "Acquisition News"],
    isDefault: true
  },
  {
    id: 4,
    name: "Healthcare & Pharma",
    description: "Monitor healthcare and pharmaceutical companies",
    filters: ["Regulatory Updates", "Product Launches", "Financial Changes", "Legal Issues"],
    isDefault: true
  },
  {
    id: 5,
    name: "Cryptocurrency",
    description: "Track cryptocurrency and blockchain projects",
    filters: ["Regulatory Updates", "Technology Breakthroughs", "Partnership Announcements", "Market Expansion"],
    isDefault: true
  }
]

// Default folders structure
const defaultFolders = [
  {
    id: 1,
    name: "Technology",
    parentId: null,
    children: [
      { id: 2, name: "AI Companies", parentId: 1, children: [] },
      { id: 3, name: "Hardware", parentId: 1, children: [] }
    ]
  },
  {
    id: 4,
    name: "Finance",
    parentId: null,
    children: [
      { id: 5, name: "Fintech", parentId: 4, children: [] },
      { id: 6, name: "Traditional Banks", parentId: 4, children: [] }
    ]
  }
]

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("feed")
  const [folders, setFolders] = useState(defaultFolders)
  const [topics, setTopics] = useState([
    {
      id: 1,
      topic: "Tesla",
      description: "Electric vehicle company news and updates",
      filters: ["Financial Changes", "Core Management Changes"],
      templateUsed: "Technology Company",
      folderId: 3, // Hardware folder
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      topic: "OpenAI",
      description: "AI research and product developments",
      filters: ["Product Launches", "Financial Changes"],
      templateUsed: "Startup Tracking",
      folderId: 2, // AI Companies folder
      createdAt: "2024-01-10"
    },
    {
      id: 3,
      topic: "Apple",
      description: "Consumer technology and hardware updates",
      filters: ["Product Launches", "Core Management Changes"],
      templateUsed: "Technology Company",
      folderId: 3, // Hardware folder
      createdAt: "2024-01-08"
    }
  ])

  const [templates, setTemplates] = useState(defaultTemplates)
  const [bookmarks, setBookmarks] = useState([])

  const addTopic = (newTopic) => {
    const topic = {
      ...newTopic,
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    }
    setTopics([...topics, topic])
  }

  const deleteTopic = (id) => {
    setTopics(topics.filter(t => t.id !== id))
  }

  const addTemplate = (newTemplate) => {
    const template = {
      ...newTemplate,
      id: Date.now(),
      isDefault: false
    }
    setTemplates([...templates, template])
  }

  const deleteTemplate = (id) => {
    setTemplates(templates.filter(t => t.id !== id || t.isDefault))
  }

  const addFolder = (newFolder) => {
    const folder = {
      ...newFolder,
      id: Date.now(),
      children: []
    }
    
    if (newFolder.parentId) {
      // Add to parent folder
      const updateFolders = (folders) => {
        return folders.map(f => {
          if (f.id === newFolder.parentId) {
            return { ...f, children: [...f.children, folder] }
          }
          if (f.children.length > 0) {
            return { ...f, children: updateFolders(f.children) }
          }
          return f
        })
      }
      setFolders(updateFolders(folders))
    } else {
      // Add as root folder
      setFolders([...folders, folder])
    }
  }

  const deleteFolder = (id) => {
    // Move topics from deleted folder to root
    setTopics(topics.map(t => t.folderId === id ? { ...t, folderId: null } : t))
    
    // Remove folder
    const removeFolderRecursive = (folders) => {
      return folders.filter(f => f.id !== id).map(f => ({
        ...f,
        children: removeFolderRecursive(f.children)
      }))
    }
    setFolders(removeFolderRecursive(folders))
  }

  const toggleBookmark = (articleId) => {
    if (bookmarks.includes(articleId)) {
      setBookmarks(bookmarks.filter(id => id !== articleId))
    } else {
      setBookmarks([...bookmarks, articleId])
    }
  }

  // Get folder path for display
  const getFolderPath = (folderId, folders, path = []) => {
    if (!folderId) return path
    
    const findFolder = (folders) => {
      for (const folder of folders) {
        if (folder.id === folderId) {
          return folder
        }
        const found = findFolder(folder.children)
        if (found) return found
      }
      return null
    }
    
    const folder = findFolder(folders)
    if (folder) {
      const newPath = [folder.name, ...path]
      return folder.parentId ? getFolderPath(folder.parentId, folders, newPath) : newPath
    }
    return path
  }

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
          <TabsList className="grid w-full grid-cols-6">
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
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Template className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Bookmarks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-6">
            <NewsFeed 
              topics={topics} 
              folders={folders} 
              bookmarks={bookmarks}
              onToggleBookmark={toggleBookmark}
              getFolderPath={getFolderPath}
            />
          </TabsContent>

          <TabsContent value="add" className="mt-6">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Add New News Topic</CardTitle>
                  <CardDescription>
                    Configure a new topic to track news articles. You can use a template or create your own configuration.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AddTopicForm 
                    onAdd={addTopic} 
                    templates={templates} 
                    onAddTemplate={addTemplate}
                    folders={folders}
                    getFolderPath={getFolderPath}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="manage" className="mt-6">
            <TopicList 
              topics={topics} 
              onDelete={deleteTopic} 
              folders={folders}
              getFolderPath={getFolderPath}
            />
          </TabsContent>

          <TabsContent value="folders" className="mt-6">
            <FolderManager 
              folders={folders} 
              onAdd={addFolder} 
              onDelete={deleteFolder}
              topics={topics}
            />
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <TemplateManager templates={templates} onAdd={addTemplate} onDelete={deleteTemplate} />
          </TabsContent>

          <TabsContent value="bookmarks" className="mt-6">
            <BookmarksList 
              bookmarks={bookmarks}
              onToggleBookmark={toggleBookmark}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
