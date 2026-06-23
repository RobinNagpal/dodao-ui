import { ScrollEndLoginTrigger } from '@/components/login/scroll-end-login-trigger';

/**
 * Tariff-report variant of the scroll-end login trigger. Rendered as the very last node of the
 * long `tariff-updates` pages (both the legacy `/[industryId]` route and the chapter
 * `/chapters/[chapterSlug]` route) so it fires once a logged-out reader reaches the bottom of the
 * longest tariff page.
 *
 * Because the sentinel is the final DOM node, it passes a positive bottom `rootMargin` so it fires
 * ~200px before the absolute bottom (a negative bottom margin could never intersect here).
 *
 * Uses its own once-per-session key (`tariffScrollLoginShown`) but SHARES the global dismissal
 * cooldown key (`loginPopupDismissedAt`) with the nav-count auto-prompt and the blog trigger, so a
 * single dismissal on any surface silences all of them for the cooldown window — and vice versa.
 * Tariff-updates pages are excluded from the nav-count auto-prompt (see login-popup-auto-prompt),
 * so the two popups can never collide on the same page.
 */
export function TariffScrollLoginTrigger(): JSX.Element {
  return <ScrollEndLoginTrigger shownKey="tariffScrollLoginShown" dismissedAtKey="loginPopupDismissedAt" rootMargin="0px 0px 200px 0px" />;
}
