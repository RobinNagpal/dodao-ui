"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkCheck, ExternalLink, Clock } from 'lucide-react'
import EnhancedArticleCard from "@/components/enhanced-article-card"

// Sample news data (same as in news-feed.tsx)
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

export default function BookmarksList({ bookmarks, onToggleBookmark }) {
  const bookmarkedArticles = sampleNews.filter(article => bookmarks.includes(article.id))

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Bookmarked Articles</h3>
        <p className="text-muted-foreground mb-4">
          Bookmark articles from the news feed to save them for later reading
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Bookmarked Articles</h2>
        <Badge variant="outline">
          {bookmarks.length} article{bookmarks.length !== 1 ? 's' : ''} bookmarked
        </Badge>
      </div>
      
      <div className="grid gap-4">
        {bookmarkedArticles.map((article) => (
          <EnhancedArticleCard
            key={article.id}
            article={article}
            isBookmarked={true}
            onToggleBookmark={onToggleBookmark}
            folderPath={null}
          />
        ))}
      </div>
    </div>
  )
}
