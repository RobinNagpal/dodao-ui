import { ArticleSource, NewsArticle, NewsTopic, NewsTopicFolder, NewsTopicTemplate } from '@prisma/client';

export const ROOT_FOLDER = 'ROOT';

export interface NewsTopicTemplateType extends NewsTopicTemplate {
  id: string;
  name: string;
  description: string;
  filters: string[];
  availableFilters: string[];
  isDefault: boolean;
}

export interface NewsTopicFolderType extends NewsTopicFolder {
  id: string;
  name: string;
  parentId: string | null;
  children: NewsTopicFolderType[];
}

export interface NewsTopicType extends NewsTopic {
  id: string;
  topic: string;
  description: string;
  filters: string[];
  templateUsed: string;
  folderId: string | null;
}

export interface ArticleSourceType extends ArticleSource {
  title: string;
  url: string;
  source: string;
  percentage: number;
}

export interface NewsArticleType extends NewsArticle {
  id: string;
  title: string;
  description: string;
  keyword: string;
  filters: string[];
  source: string;
  url: string;
  sources?: ArticleSourceType[];
}
