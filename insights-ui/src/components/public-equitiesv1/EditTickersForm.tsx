import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { BasicTickerInfo } from '@/types/ticker-typesv1';
import React, { useEffect, useState } from 'react';
import { ExchangeId, isExchangeId } from '@/utils/exchangeUtils';
import TickerFields from './TickerFields';
import type { EditableTickerEntry, TickerFieldsValue } from './types';

/** ---------- Types specific to update ---------- */

interface UpdateTickerRequest {
  id: string;
  name: string;
  symbol: string;
  exchange: BasicTickerInfo['exchange']; // still ExchangeId on server-side
  industryKey: string;
  subIndustryKey: string;
  websiteUrl?: string;
}

interface UpdateTickersRequest {
  tickers: UpdateTickerRequest[];
}

interface UpdateTickersResponse {
  success: boolean;
  updatedCount: number;
  updatedTickers: BasicTickerInfo[];
}

interface EditTickersFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  tickers: BasicTickerInfo[];
  selectedIndustryKey: string;
  selectedSubIndustryKey: string;
}

/** ---------- Component ---------- */

export default function EditTickersForm({ onSuccess, onCancel, tickers, selectedIndustryKey, selectedSubIndustryKey }: EditTickersFormProps): JSX.Element {
  const [entries, setEntries] = useState<EditableTickerEntry[]>([]);

  // Put hook for updating tickers
  const { putData: putTickers, loading: updateTickersLoading } = usePutData<UpdateTickersResponse, UpdateTickersRequest>({
    successMessage: 'Tickers updated successfully!',
    errorMessage: 'Failed to update tickers.',
  });

  // Initialize entries from props
  useEffect(() => {
    const editableEntries: EditableTickerEntry[] = tickers.map((t) => ({
      id: t.id,
      name: t.name,
      symbol: t.symbol.toUpperCase(),
      websiteUrl: t.websiteUrl || '',
      exchange: t.exchange as ExchangeId, // `exchange` is already compatible with ExchangeId union
    }));
    setEntries(editableEntries);
  }, [tickers]);

  /** ---------- Submit ---------- */

  const handleUpdateTickers = async (e?: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e?.preventDefault();

    // Validate rows: exchange required per row (and name/symbol for non-empty rows)
    for (let i = 0; i < entries.length; i++) {
      const t = entries[i];

      if (!t.exchange || !isExchangeId(t.exchange)) {
        // eslint-disable-next-line no-alert
        alert(`Row ${i + 1}: Please select a valid Exchange.`);
        return;
      }
      if (!t.name.trim() || !t.symbol.trim()) {
        // eslint-disable-next-line no-alert
        alert(`Row ${i + 1}: Please provide both Company Name and Symbol.`);
        return;
      }
    }

    // Prepare update request
    const updateRequest: UpdateTickersRequest = {
      tickers: entries.map((entry) => ({
        id: entry.id,
        name: entry.name,
        symbol: entry.symbol.toUpperCase(),
        exchange: entry.exchange,
        industryKey: selectedIndustryKey,
        subIndustryKey: selectedSubIndustryKey,
        websiteUrl: entry.websiteUrl,
      })),
    };

    const result = await putTickers(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1`, updateRequest);

    if (result) {
      onSuccess();
    }
  };

  /** ---------- Mutators ---------- */

  const patchRow = (index: number, patch: Partial<EditableTickerEntry>): void => {
    setEntries((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  /** ---------- Render ---------- */

  return (
    <Block className="text-color">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold">Edit Tickers</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Update ticker information for all tickers in this sub-industry</p>
        </div>
      </div>

      {/* Ticker Entries */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Ticker Information ({entries.length} tickers)</h3>

        {entries.map((entry) => {
          const coreValue: TickerFieldsValue = {
            exchange: entry.exchange,
            name: entry.name,
            symbol: entry.symbol,
            websiteUrl: entry.websiteUrl,
          };

          return (
            <TickerFields
              key={entry.id}
              value={coreValue}
              onPatch={(patch): void =>
                patchRow(
                  entries.findIndex((e) => e.id === entry.id),
                  patch
                )
              }
              mdColumns={4}
            />
          );
        })}
      </div>

      <div className="flex space-x-4 mt-6">
        <Button
          type="submit"
          variant="contained"
          primary
          loading={updateTickersLoading}
          disabled={updateTickersLoading || entries.length === 0}
          onClick={handleUpdateTickers}
        >
          {updateTickersLoading ? 'Updating...' : `Update ${entries.length} Tickers`}
        </Button>

        <Button type="button" variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Block>
  );
}
