import { ScrollEndLoginTrigger } from '@/components/login/scroll-end-login-trigger';

/**
 * Tariff-report variant of the scroll-end login trigger. Rendered at the very end of the long
 * `tariff-updates` pages (both the legacy `/[industryId]` route and the chapter
 * `/chapters/[chapterSlug]` route) so it fires only once a logged-out reader reaches the bottom
 * of the longest tariff page.
 *
 * Shares the global login-popup budget keys (`loginPopupShown` / `loginPopupDismissedAt`) with
 * the nav-count auto-prompt. Tariff pages are NOT excluded from that auto-prompt, so reusing the
 * same keys guarantees a reader never gets two login popups on the same tariff page, and a single
 * dismissal silences both surfaces for the cooldown window.
 */
export function TariffScrollLoginTrigger(): JSX.Element {
  return <ScrollEndLoginTrigger shownKey="loginPopupShown" dismissedAtKey="loginPopupDismissedAt" />;
}
