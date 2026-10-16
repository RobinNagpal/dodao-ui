import { roboticsAreas } from '@/components/robotics-page/areas/roboticsAreas';
import { SITE_URL } from '@/utils/siteConfig';
import fs from 'fs';
import type { MetadataRoute } from 'next';
import path from 'path';

export const dynamic = 'force-static';

const APP_DIR = path.join(process.cwd(), 'src', 'app');

/**
 * Concrete paths for each dynamic route segment (`[param]` folder). Keep in sync with that
 * route's `generateStaticParams` — a dynamic route missing here fails the build below.
 */
const DYNAMIC_ROUTES: Record<string, string[]> = {
  '/robotics/[area]': roboticsAreas.map((area) => `/robotics/${area.slug}`),
};

function expandDynamicRoute(route: string): string[] {
  if (!route.includes('[')) return [route];
  const expanded = DYNAMIC_ROUTES[route];
  if (!expanded) throw new Error(`sitemap: no concrete paths registered for dynamic route ${route}`);
  return expanded;
}

/**
 * Every page route in the static export, found by walking `src/app` for `page.tsx` files at
 * build time — so a new page is in the sitemap automatically. Runs only during `next build`.
 */
function findPageRoutes(dir: string, segments: string[] = []): string[] {
  const routes: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      routes.push(...findPageRoutes(path.join(dir, entry.name), [...segments, entry.name]));
    } else if (/^page\.(tsx|ts|jsx|js|mdx)$/.test(entry.name)) {
      routes.push('/' + segments.join('/'));
    }
  }
  return routes;
}

function priorityFor(route: string): number {
  if (route === '/') return 1.0;
  if (route === '/robotics' || route.startsWith('/robotics/') || route.startsWith('/home-section/dodao-io/products')) return 0.8;
  return 0.7;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return findPageRoutes(APP_DIR)
    .flatMap(expandDynamicRoute)
    .sort()
    .map((route) => ({
      url: route === '/' ? `${SITE_URL}/` : `${SITE_URL}${route}`,
      changeFrequency: route === '/' ? 'daily' : 'monthly',
      priority: priorityFor(route),
    }));
}
