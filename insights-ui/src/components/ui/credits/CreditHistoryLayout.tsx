import React from 'react';

export interface CreditHistoryLayoutProps {
  /** Full table, shown from tablet width up. */
  table: React.ReactNode;
  /** One `CreditHistoryCard` per row, shown on phones where five columns don't fit. */
  cards: React.ReactNode;
  className?: string;
}

/** Switches the credit history between a table (wide screens) and stacked cards (phones). */
export default function CreditHistoryLayout({ table, cards, className }: CreditHistoryLayoutProps): React.JSX.Element {
  return (
    <div className={className}>
      <div className="hidden md:block">{table}</div>
      <div className="flex flex-col gap-2 md:hidden">{cards}</div>
    </div>
  );
}
