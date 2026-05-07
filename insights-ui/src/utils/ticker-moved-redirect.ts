import { permanentRedirect } from 'next/navigation';

export interface MoveableTicker {
  movedExchange?: string | null;
  movedSymbol?: string | null;
}

/**
 * If the ticker has been moved (movedExchange and/or movedSymbol set), throw a
 * 308 permanent redirect to the new canonical URL, preserving the current
 * sub-path. When only one of the two fields is set, the other is taken from
 * the current request — so a same-exchange symbol change or a same-symbol
 * exchange change both Just Work.
 *
 * Returns normally (no redirect) when neither field is set, or when the
 * computed destination matches the current URL (defensive against data-entry
 * loops).
 *
 * @param ticker         Fetched ticker carrying movedExchange/movedSymbol.
 * @param routeExchange  Exchange from the current URL (will be uppercased).
 * @param routeSymbol    Symbol from the current URL (will be uppercased).
 * @param subPath        Page sub-path to preserve, e.g. "/competition" or "".
 *                       No trailing slash; pass "" for the main ticker page.
 */
export function enforceMovedRedirect(ticker: MoveableTicker, routeExchange: string, routeSymbol: string, subPath: string = ''): void {
  if (!ticker.movedExchange && !ticker.movedSymbol) return;

  const currentExchange = routeExchange.toUpperCase();
  const currentSymbol = routeSymbol.toUpperCase();

  const newExchange = (ticker.movedExchange ?? currentExchange).toUpperCase();
  const newSymbol = (ticker.movedSymbol ?? currentSymbol).toUpperCase();

  if (newExchange === currentExchange && newSymbol === currentSymbol) return;

  permanentRedirect(`/stocks/${newExchange}/${newSymbol}${subPath}`);
}
