export interface BlogInterface {
  title: string;
  abstract: string;
  date: string;
  datetime: string;
  category: { title: string; slug: string };
  seoKeywords: string[];
  seoImage?: string;
  bannerImage?: string;
}

export interface BlogInterfaceWithId extends BlogInterface {
  id: string;
}
