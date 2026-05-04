export function slugifyScenarioTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Best-effort reverse of `slugifyScenarioTitle` used when the actual scenario
// row is unavailable (failed fetch, stale "not found" cache) and we still
// want a readable title in the page chrome so admins can flush the cache.
// The original title is lost in slugification — punctuation and capitalization
// can't be perfectly recovered — so this is intentionally just a humanized
// approximation.
export function humanizeScenarioSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
