import { ScrollEndLoginTrigger } from '@/components/login/scroll-end-login-trigger';

/**
 * Blog-article variant of the scroll-end login trigger. Rendered just before the server-rendered
 * "Related Articles" section so it fires when a logged-out reader reaches the bottom of an article.
 *
 * Uses blog-scoped storage keys so the blog surface keeps its own once-per-session / cooldown
 * budget, independent of the rest of the site.
 */
export function BlogScrollLoginTrigger(): JSX.Element {
  return <ScrollEndLoginTrigger shownKey="blogScrollLoginShown" dismissedAtKey="blogScrollLoginDismissedAt" />;
}
