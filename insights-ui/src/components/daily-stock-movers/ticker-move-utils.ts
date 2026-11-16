import { DailyMoverType } from '@/types/daily-mover-constants';
import { DailyMoverHistoryItem } from '@/types/daily-stock-movers';

/** Details page URL of a move in the history. */
export const getMoveDetailsPath = (move: DailyMoverHistoryItem): string =>
  `/daily-top-movers/${move.type === DailyMoverType.GAINER ? 'top-gainers' : 'top-losers'}/details/${move.id}`;

/** "rose 12.4%" / "fell 6.8%" (same rounding as the headlines, so "12%" not "12.0%"). */
export const getMoveChangeText = (move: DailyMoverHistoryItem): string =>
  `${move.type === DailyMoverType.GAINER ? 'rose' : 'fell'} ${Number(Math.abs(move.percentageChange).toFixed(1))}%`;
