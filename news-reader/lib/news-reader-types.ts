export interface NewsTopicTemplate {
  id: number;
  name: string;
  description: string;
  filters: string[];
  isDefault: boolean;
}

export interface NewsTopicFolder {
  id: number;
  name: string;
  parentId: number | null;
  children: NewsTopicFolder[];
}

export interface NewsTopic {
  id: number;
  topic: string;
  description: string;
  filters: string[];
  templateUsed: string;
  folderId: number | null;
  createdAt: string;
}

export interface ArticleSource {
  title: string;
  url: string;
  source: string;
  percentage: number;
  publishedAt: string;
}

export interface NewsArticle {
  id: number;
  title: string;
  description: string;
  keyword: string;
  filters: string[];
  source: string;
  publishedAt: string;
  url: string;
  fullContent?: string;
  sources?: ArticleSource[];
}
