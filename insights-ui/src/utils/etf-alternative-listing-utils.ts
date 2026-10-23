import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import type { EtfAlternativeListing, EtfAlternativeListings } from '@/types/prismaTypes';
import { Prisma } from '@prisma/client';
import { permanentRedirect } from 'next/navigation';

/**
 * A listing of the same share class (same ISIN) on another exchange or in another currency is
 * an entry in an ETF's `alternativeListings` rather than its own row (e.g. LSE:CSPX lists
 * { XETRA, SXR8 }). Listings that already had a report keep their own row (LSE:CSP1).
 * These helpers map an alternative exchange/symbol back to the ETF that owns it.
 */

export interface EtfListingIdentity {
  id: string;
  exchange: string;
  symbol: string;
}

/** Where-clause matching the ETF that lists `exchange:symbol` as an alternative listing (GIN-indexed `@>`). */
export function etfAlternativeListingWhere(spaceId: string, exchange: string, symbol: string): Prisma.EtfWhereInput {
  return { spaceId, alternativeListings: { array_contains: [{ exchange: exchange.trim().toUpperCase(), symbol: symbol.trim().toUpperCase() }] } };
}

/** Where-clause matching an ETF by its own exchange/symbol or by one of its alternative listings. */
export function etfOwnOrAlternativeListingWhere(spaceId: string, exchange: string, symbol: string): Prisma.EtfWhereInput {
  const ex = exchange.trim().toUpperCase();
  const sym = symbol.trim().toUpperCase();
  return { spaceId, OR: [{ exchange: ex, symbol: sym }, { alternativeListings: { array_contains: [{ exchange: ex, symbol: sym }] } }] };
}

/** The ETF that lists `exchange:symbol` as an alternative listing, or null. */
export async function findEtfByAlternativeListing(spaceId: string, exchange: string, symbol: string): Promise<EtfListingIdentity | null> {
  return prisma.etf.findFirst({ where: etfAlternativeListingWhere(spaceId, exchange, symbol), select: { id: true, exchange: true, symbol: true } });
}

/**
 * For `/etfs/[exchange]/[etf]` pages, called where the page would otherwise 404: if the URL names an
 * alternative listing, permanently redirects (308) to the same sub-page of the ETF that owns it, so
 * old links and indexed URLs keep working and pass their ranking on. Returns when it is not one.
 */
export async function redirectAlternativeEtfListing(exchange: string, symbol: string, subPath: string = ''): Promise<void> {
  let owner: EtfListingIdentity | null = null;
  try {
    owner = await findEtfByAlternativeListing(KoalaGainsSpaceId, exchange, symbol);
  } catch (error) {
    console.warn(`Alternative-listing lookup failed for ${exchange}:${symbol}`, error);
  }
  // `permanentRedirect` throws NEXT_REDIRECT, so it must stay outside the try/catch.
  if (owner) permanentRedirect(`/etfs/${encodeURIComponent(owner.exchange)}/${encodeURIComponent(owner.symbol)}${subPath ? `/${subPath}` : ''}`);
}

/** Alternative listings from a Prisma row, tolerating a missing/legacy value. */
export function toEtfAlternativeListings(value: unknown): EtfAlternativeListings {
  if (!Array.isArray(value)) return [];
  return value.filter((l): l is EtfAlternativeListing => !!l && typeof l.exchange === 'string' && typeof l.symbol === 'string');
}
