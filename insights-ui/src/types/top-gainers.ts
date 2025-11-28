import { DailyTopGainer, TickerV1 } from '@prisma/client';

export interface TopGainerWithTicker extends DailyTopGainer {
  ticker: TickerV1;
}
