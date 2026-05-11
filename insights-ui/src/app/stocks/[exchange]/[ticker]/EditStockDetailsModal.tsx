'use client';

import { UpdateStockAnalyzeUrlRequest } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { exchangeItems, toExchange } from '@/utils/countryExchangeUtils';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { TickerV1 } from '@prisma/client';
import { useEffect, useState } from 'react';

interface EditStockDetailsModalProps {
  open: boolean;
  onClose: () => void;
  symbol: string;
  exchange: string;
  initialMovedExchange: string | null;
  initialMovedSymbol: string | null;
  initialIsDeleted: boolean;
  onSaved: () => void;
}

export default function EditStockDetailsModal({
  open,
  onClose,
  symbol,
  exchange,
  initialMovedExchange,
  initialMovedSymbol,
  initialIsDeleted,
  onSaved,
}: EditStockDetailsModalProps): JSX.Element {
  const [movedExchange, setMovedExchange] = useState<string>('');
  const [movedSymbol, setMovedSymbol] = useState<string>('');
  const [isDeleted, setIsDeleted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const { putData, loading } = usePutData<TickerV1, UpdateStockAnalyzeUrlRequest>({
    successMessage: 'Stock details updated.',
    errorMessage: 'Failed to update stock details.',
  });

  useEffect(() => {
    if (open) {
      setMovedExchange(initialMovedExchange ?? '');
      setMovedSymbol(initialMovedSymbol ?? '');
      setIsDeleted(initialIsDeleted);
      setError('');
    }
  }, [open, initialMovedExchange, initialMovedSymbol, initialIsDeleted]);

  const movedSet = movedExchange.trim().length > 0 || movedSymbol.trim().length > 0;
  const conflict = isDeleted && movedSet;

  // Mirror enforceMovedRedirect's fallback: when only one of moved-exchange /
  // moved-symbol is set, the other defaults to the current value. A self-
  // redirect (destination identical to current URL) would be a no-op at
  // runtime but is almost always an admin mistake — block it here.
  const targetExchange = (movedExchange.trim() || exchange).toUpperCase();
  const targetSymbol = (movedSymbol.trim() || symbol).toUpperCase();
  const selfRedirect = movedSet && targetExchange === exchange.toUpperCase() && targetSymbol === symbol.toUpperCase();

  const handleSave = async (): Promise<void> => {
    if (conflict) {
      setError('A ticker cannot be both deleted and have a forwarding exchange/symbol. Clear one of these.');
      return;
    }
    if (selfRedirect) {
      setError('Moved exchange/symbol points back to this same ticker. Either clear both fields or set a different destination.');
      return;
    }
    setError('');

    const payload: UpdateStockAnalyzeUrlRequest = {
      movedExchange: movedExchange.trim() ? movedExchange.trim().toUpperCase() : null,
      movedSymbol: movedSymbol.trim() ? movedSymbol.trim().toUpperCase() : null,
      isDeleted,
    };

    const result = await putData(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/exchange/${exchange}/${symbol}`, payload);
    if (result) {
      onSaved();
      onClose();
    }
  };

  return (
    <FullPageModal open={open} onClose={onClose} title={`Edit Stock Details — ${symbol} (${exchange})`} className="w-full max-w-xl">
      <div className="px-6 py-4 space-y-5 text-left">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Moved Exchange</label>
          <StyledSelect
            label=""
            selectedItemId={movedExchange || null}
            items={[{ id: '', label: '— none —' }, ...exchangeItems]}
            setSelectedItemId={(id?: string | null): void => {
              const next = id ?? '';
              setMovedExchange(next ? toExchange(next) : '');
            }}
          />
          <p className="text-xs text-gray-400 mt-1">Set when this ticker has moved to a different exchange. Leave blank if unchanged.</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Moved Symbol</label>
          <input
            type="text"
            value={movedSymbol}
            onChange={(e) => setMovedSymbol(e.target.value.toUpperCase())}
            placeholder="e.g. NEWSYM"
            className="w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
          <p className="text-xs text-gray-400 mt-1">
            Set when this ticker has been renamed. If only one of exchange/symbol is set, the other is taken from the current URL.
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isDeleted} onChange={(e) => setIsDeleted(e.target.checked)} className="h-4 w-4" />
            <span className="text-sm font-medium dark:text-gray-300">Mark as deleted (delisted / removed)</span>
          </label>
          <p className="text-xs text-gray-400 mt-1 ml-6">Detail pages serve a 404 + noindex and the ticker is removed from listings + sitemap.</p>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {conflict && !error && <p className="text-sm text-yellow-400">Heads up: deleted + moved are mutually exclusive.</p>}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <Button onClick={onClose} disabled={loading} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || conflict || selfRedirect} loading={loading} variant="contained" primary>
            Save
          </Button>
        </div>
      </div>
    </FullPageModal>
  );
}
