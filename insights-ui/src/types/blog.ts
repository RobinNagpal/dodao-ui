export interface BlogInterface {
  title: string;
  abstract: string;
  date: string;
  datetime: string;
  category: { title: string; slug: string };
  seoKeywords: string[];
  seoImage?: string;
  bannerImage?: string;
  author?: string;
  /** YYYY-MM-DD of the last content revision; used as the modified date (meta, JSON-LD, sitemap lastmod). */
  updated?: string;
}

export interface BlogInterfaceWithId extends BlogInterface {
  id: string;
}
