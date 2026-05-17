/**
 * Shared types for ETF listing responses, used by both the listings API routes
 * and the UI components that render them. Kept out of `src/utils` so it's
 * obviously a types-only file (no Prisma, no runtime code).
 */
export interface EtfGroupingPreviewItem {
  id: string;
  symbol: string;
  exchange: string;
  name: string;
  finalScore: number | null;
  hasDetailedReport: boolean;
}

export interface EtfGroupingPreview {
  values: Record<string, EtfGroupingPreviewItem[]>;
  counts: Record<string, number>;
}

export interface EtfUncategorizedPreview {
  items: EtfGroupingPreviewItem[];
  count: number;
}

export interface EtfProvidersPreview {
  providers: string[];
  values: Record<string, EtfGroupingPreviewItem[]>;
  counts: Record<string, number>;
}
