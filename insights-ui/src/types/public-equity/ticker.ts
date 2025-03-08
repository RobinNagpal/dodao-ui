export interface TickerUpsertRequest {
  tickerKey: string;
  sectorId: number;
  industryGroupId: number;
  reportUrl?: string;
}

export interface TickerCreateRequest {
  tickerKey: string;
  sectorId: number;
  industryGroupId: number;
  reportUrl?: string;
}
