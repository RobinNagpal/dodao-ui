import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';

export type EtfRouteParams = { spaceId: string; exchange: string; etf: string };

export function normalizeUpperTrim(value: string | null | undefined): string {
  return (value ?? '').toUpperCase().trim();
}

export function getEtfWhereClause(params: { spaceId: string; exchange: string; etf: string }): {
  spaceId: string;
  symbol: string;
  exchange: string;
} {
  return {
    spaceId: params.spaceId || KoalaGainsSpaceId,
    symbol: normalizeUpperTrim(params.etf),
    exchange: normalizeUpperTrim(params.exchange),
  };
}

// Helper function to convert BigInt values to strings for JSON serialization
export function serializeBigIntFields(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    return obj.toString();
  }

  // Preserve Date objects
  if (obj instanceof Date) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeBigIntFields);
  }

  if (typeof obj === 'object') {
    const serialized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeBigIntFields(value);
    }
    return serialized;
  }

  return obj;
}
