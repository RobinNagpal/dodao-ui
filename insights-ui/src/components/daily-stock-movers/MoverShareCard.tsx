import { DailyMoverType } from '@/types/daily-mover-constants';
import { themeColors } from '@/util/theme-colors';
import React from 'react';

/**
 * The 1200×630 share card for a daily mover page, rendered to PNG by `next/og` (Satori) in
 * `app/og/daily-movers/v1/[type]/[moverId]/route.tsx`. Satori supports only inline styles and
 * flexbox (every element with more than one child needs `display: flex`), so this component uses
 * `style` instead of Tailwind / the leaf components. Colors come from the dark site theme.
 */

// `themeColors` is typed as CSSProperties (it's spread into a style), so read the dark-theme values once here.
const theme = themeColors as Record<string, string>;
const COLORS = {
  background: theme['--bg-color'],
  heading: theme['--heading-color'],
  text: theme['--text-color'],
  muted: theme['--text-muted'],
};

const MOVE_COLORS: Record<DailyMoverType, string> = {
  [DailyMoverType.GAINER]: '#4ade80', // green-400, same as the % on the mover page
  [DailyMoverType.LOSER]: '#f87171', // red-400
};

// Keeps a long AI title to two lines and the "Company (TICKER)" line to one line on the card.
const MAX_HEADLINE_LENGTH = 110;
const MAX_COMPANY_LINE_LENGTH = 42;
// "Company (TICKER)" lines longer than this use the smaller font so they stay on one line.
const LONG_COMPANY_LINE_LENGTH = 28;

/** Shortens text to `max` characters, cutting at the last word boundary and adding "…". */
const truncate = (text: string, max: number): string => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
};

export interface MoverShareCardProps {
  type: DailyMoverType;
  /** Short company name, e.g. "Apple". */
  companyName: string;
  symbol: string;
  percentageChange: number;
  /** Move date as shown on the page, e.g. "Oct 5, 2026". */
  date: string;
  /** The page's AI title (it carries the reason for the move). */
  headline: string;
}

export default function MoverShareCard({ type, companyName, symbol, percentageChange, date, headline }: MoverShareCardProps) {
  const isGainer = type === DailyMoverType.GAINER;
  const moveColor = MOVE_COLORS[type];
  const pct = `${isGainer ? '+' : '-'}${Number(Math.abs(percentageChange).toFixed(1))}%`;
  const companyLine = `${truncate(companyName, MAX_COMPANY_LINE_LENGTH - symbol.length - 3)} (${symbol})`;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '56px 64px',
        backgroundColor: COLORS.background,
        color: COLORS.text,
        borderTop: `12px solid ${moveColor}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', fontSize: 40, color: COLORS.heading }}>KoalaGains</div>
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            padding: '8px 24px',
            borderRadius: 999,
            color: moveColor,
            border: `2px solid ${moveColor}`,
          }}
        >
          {isGainer ? 'Top Gainer' : 'Top Loser'}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', fontSize: companyLine.length > LONG_COMPANY_LINE_LENGTH ? 44 : 56, color: COLORS.heading }}>{companyLine}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 8 }}>
          <div style={{ display: 'flex', fontSize: 132, lineHeight: 1.1, color: moveColor }}>{pct}</div>
          <div style={{ display: 'flex', fontSize: 40, marginLeft: 32, color: COLORS.muted }}>{date}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', fontSize: 38, lineHeight: 1.3, color: COLORS.text }}>{truncate(headline, MAX_HEADLINE_LENGTH)}</div>
        <div style={{ display: 'flex', fontSize: 26, marginTop: 20, color: COLORS.muted }}>koalagains.com · Daily stock movers</div>
      </div>
    </div>
  );
}
