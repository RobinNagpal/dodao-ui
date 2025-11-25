'use client';

import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { PortfolioTicker } from '@/types/portfolio';

interface TickerActionsProps {
  ticker: PortfolioTicker;
  isOwner: boolean;
  onEdit: (ticker: PortfolioTicker) => void;
  onDelete: (ticker: PortfolioTicker) => void;
}

export default function TickerActions({ ticker, isOwner, onEdit, onDelete }: TickerActionsProps) {
  if (!isOwner) {
    return null;
  }

  const actions: EllipsisDropdownItem[] = [
    { key: 'edit', label: 'Edit Holding' },
    { key: 'delete', label: 'Remove Holding' },
  ];

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <EllipsisDropdown
        items={actions}
        className="px-1 py-1"
        onSelect={(key) => {
          if (key === 'edit') {
            onEdit(ticker);
            return;
          }

          if (key === 'delete') {
            onDelete(ticker);
            return;
          }
        }}
      />
    </div>
  );
}
