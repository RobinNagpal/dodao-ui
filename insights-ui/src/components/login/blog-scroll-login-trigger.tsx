import { ScrollEndLoginTrigger } from '@/components/login/scroll-end-login-trigger';

/**
 * Blog-article variant of the scroll-end login trigger. Rendered just before the server-rendered
 * "Related Articles" section so it fires when a logged-out reader reaches the bottom of an article.
 *
 * Keeps its own once-per-session key (`blogScrollLoginShown`) but SHARES the global dismissal
 * cooldown key (`loginPopupDismissedAt`) with the nav-count auto-prompt and the tariff trigger, so
 * a dismissal on any surface silences all of them for the cooldown window — and vice versa.
 */
export function BlogScrollLoginTrigger(): JSX.Element {
  return <ScrollEndLoginTrigger shownKey="blogScrollLoginShown" dismissedAtKey="loginPopupDismissedAt" />;
}
