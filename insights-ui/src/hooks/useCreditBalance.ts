import { CreditBalanceSummaryResponse } from '@/types/credits';
import { callCreditApi } from '@/utils/credits/credit-api-client';
import { CREDITS_CHANGED_EVENT } from '@/utils/credits/credit-return-path';
import { useEffect, useState, useSyncExternalStore } from 'react';

/**
 * The signed-in user's spendable credits, or `null` when Stripe (which holds the
 * balance) couldn't be reached — shown as "—" rather than a misleading 0.
 */
export type CreditBalance = number | null;

/**
 * One balance per page, shared by everything that shows it.
 *
 * On a report page the regenerate control already loads the report status,
 * which carries the balance; it registers as a provider and publishes that
 * number here, so the navbar doesn't ask the server (and Stripe) a second time.
 * Anywhere else the navbar loads the balance itself.
 */
interface BalanceStore {
  balance: CreditBalance | undefined;
  providers: number;
}

let store: BalanceStore = { balance: undefined, providers: 0 };
const listeners = new Set<() => void>();

function setStore(next: Partial<BalanceStore>): void {
  store = { ...store, ...next };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = (): BalanceStore => store;
const SERVER_SNAPSHOT: BalanceStore = { balance: undefined, providers: 0 };
const getServerSnapshot = (): BalanceStore => SERVER_SNAPSHOT;

/** Called by whoever just read the balance from the server. */
export function publishCreditBalance(credits: number, stripeUnavailable: boolean | undefined): void {
  const balance: CreditBalance = stripeUnavailable ? null : credits;
  if (balance !== store.balance) setStore({ balance });
}

/**
 * Marks the caller as the page's balance source while `active`, so
 * `useCreditBalance` stops fetching on its own. The caller must keep the balance
 * fresh with `publishCreditBalance`, including after `notifyCreditsChanged()`.
 */
export function useCreditBalanceProvider(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    setStore({ providers: store.providers + 1 });
    return () => setStore({ providers: store.providers - 1 });
  }, [active]);
}

async function fetchBalance(): Promise<void> {
  const result = await callCreditApi<CreditBalanceSummaryResponse>('users/credits/balance');
  // Silent on failure: the pill simply stays hidden, as before.
  if (result.ok) publishCreditBalance(result.data.credits, result.data.stripeUnavailable);
}

/**
 * The balance for display, `undefined` until it has loaded (or when `enabled`
 * is false). Fetched once per page load unless a provider supplies it, then
 * re-read only when this tab reports a change via `notifyCreditsChanged()`, so
 * client-side navigation between report pages does not refetch it.
 */
export function useCreditBalance(enabled: boolean): CreditBalance | undefined {
  const { balance, providers } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Wait one tick after mount before deciding to fetch: a provider on the same
  // page registers in the same commit, but possibly after this component's effects.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const selfFetch = enabled && settled && providers === 0;

  useEffect(() => {
    if (!selfFetch) return;
    if (store.balance === undefined) void fetchBalance();
    const refresh = () => void fetchBalance();
    window.addEventListener(CREDITS_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(CREDITS_CHANGED_EVENT, refresh);
  }, [selfFetch]);

  return enabled ? balance : undefined;
}
