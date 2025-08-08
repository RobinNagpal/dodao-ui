"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, ExternalLink, Search, Filter } from 'lucide-react'
import EnhancedArticleCard from "@/components/enhanced-article-card"

// Sample news data
const sampleNews = [
  {
    id: 1,
    title: "Tesla Reports Record Q4 Earnings, Stock Surges 12%",
    description: "Tesla announced record quarterly earnings with revenue exceeding expectations, leading to significant stock price movement.",
    keyword: "Tesla",
    filters: ["Financial Changes"],
    source: "TechCrunch",
    publishedAt: "2024-01-20T10:30:00Z",
    url: "#"
  },
  {
    id: 2,
    title: "OpenAI Launches GPT-5 with Enhanced Reasoning Capabilities",
    description: "The latest iteration of OpenAI's language model shows significant improvements in logical reasoning and problem-solving.",
    keyword: "OpenAI",
    filters: ["Product Launches"],
    source: "The Verge",
    publishedAt: "2024-01-19T14:15:00Z",
    url: "#"
  },
  {
    id: 3,
    title: "Apple CEO Tim Cook Announces Succession Planning Initiative",
    description: "Apple begins formal succession planning process as Tim Cook discusses long-term leadership transition strategy.",
    keyword: "Apple",
    filters: ["Core Management Changes"],
    source: "Bloomberg",
    publishedAt: "2024-01-18T09:45:00Z",
    url: "#"
  },
  {
    id: 4,
    title: "Tesla Expands Supercharger Network to 50,000 Stations Globally",
    description: "Tesla reaches major milestone in charging infrastructure expansion across North America and Europe.",
    keyword: "Tesla",
    filters: ["Market Expansion"],
    source: "Reuters",
    publishedAt: "2024-01-17T16:20:00Z",
    url: "#"
  },
  {
    id: 5,
    title: "OpenAI Secures $10B Funding Round Led by Microsoft",
    description: "Major funding round values OpenAI at $80 billion, with Microsoft increasing its stake in the AI company.",
    keyword: "OpenAI",
    filters: ["Financial Changes"],
    source: "Wall Street Journal",
    publishedAt: "2024-01-16T11:30:00Z",
    url: "#"
  },
  {
    id: 6,
    title: "Apple Unveils Revolutionary AR Glasses at Developer Conference",
    description: "Apple's long-awaited augmented reality glasses feature advanced display technology and seamless iOS integration.",
    keyword: "Apple",
    filters: ["Product Launches"],
    source: "MacRumors",
    publishedAt: "2024-01-15T13:00:00Z",
    url: "#"
  }
]

export default function NewsFeed({ topics, folders, bookmarks, onToggleBookmark, getFolderPath }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("all")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedFolder, setSelectedFolder] = useState("all")

  // Get all unique filters from topics
  const allFilters = useMemo(() => {
    const filters = new Set()
    topics.forEach(topic => {
      topic.filters.forEach(filter => filters.add(filter))
    })
    return Array.from(filters)
  }, [topics])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Flatten folders for selection
  const flattenFolders = (folders, level = 0) => {
    let result = []
    folders.forEach(folder => {
      result.push({ ...folder, level })
      if (folder.children.length > 0) {
        result = result.concat(flattenFolders(folder.children, level + 1))
      }
    })
    return result
  }

  const flatFolders = flattenFolders(folders)

  // Filter news based on configured topics and their filters
  const filteredNews = useMemo(() => {
    return sampleNews.filter(article => {
      // Check if topic is configured
      const topicConfig = topics.find(t => t.topic.toLowerCase() === article.keyword.toLowerCase())
      if (!topicConfig) return false

      // Check if article matches any of the topic's filters
      const hasMatchingFilter = article.filters.some(filter => 
        topicConfig.filters.includes(filter)
      )
      if (!hasMatchingFilter) return false

      // Apply search filter
      if (searchTerm && !article.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !article.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Apply topic filter
      if (selectedTopic !== "all" && article.keyword !== selectedTopic) {
        return false
      }

      // Apply filter type filter
      if (selectedFilter !== "all" && !article.filters.includes(selectedFilter)) {
        return false
      }

      // Apply folder filter
      if (selectedFolder !== "all") {
        const folderId = parseInt(selectedFolder)
        // Get all folder IDs including children
        const getFolderAndChildren = (folders, targetId) => {
          let result = []
          folders.forEach(folder => {
            if (folder.id === targetId) {
              result.push(folder.id)
              const getChildIds = (children) => {
                children.forEach(child => {
                  result.push(child.id)
                  if (child.children.length > 0) {
                    getChildIds(child.children)
                  }
                })
              }
              getChildIds(folder.children)
            } else if (folder.children.length > 0) {
              result = result.concat(getFolderAndChildren(folder.children, targetId))
            }
          })
          return result
        }
        
        const allowedFolderIds = getFolderAndChildren(folders, folderId)
        const topicInFolder = topics.find(t => t.topic.toLowerCase() === article.keyword.toLowerCase() && allowedFolderIds.includes(t.folderId))
        if (!topicInFolder) return false
      }

      return true
    })
  }, [topics, searchTerm, selectedTopic, selectedFilter, selectedFolder, folders])

  if (topics.length === 0) {
    return (
      <div className="text-center py-12">
        <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Topics Configured</h3>
        <p className="text-muted-foreground mb-4">
          Add topics to start seeing filtered news articles
        </p>
      </div>
    )
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
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
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
                  {topics.map(topic => (
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
                  {allFilters.map(filter => (
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
              <p className="text-muted-foreground">
                Try adjusting your filters or add more topics to see relevant news
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredNews.map((article) => {
              const topic = topics.find(t => t.topic.toLowerCase() === article.keyword.toLowerCase())
              const folderPath = topic?.folderId ? getFolderPath(topic.folderId, folders) : null
              
              return (
                <EnhancedArticleCard
                  key={article.id}
                  article={article}
                  isBookmarked={bookmarks.includes(article.id)}
                  onToggleBookmark={onToggleBookmark}
                  folderPath={folderPath}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
