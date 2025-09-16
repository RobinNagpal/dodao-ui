import React, { useState, useEffect } from 'react';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';
import { TickerV1Industry, TickerV1SubIndustry } from '@prisma/client';
import { TickerV1 } from '@/types/public-equity/analysis-factors-types';
import { ExchangeId, exchangeItems, isExchangeId, toExchangeId } from '@/utils/exchangeUtils';

/** ---------- Types ---------- */

interface EditableTickerEntry {
  id: string;
  name: string;
  symbol: string;
  websiteUrl: string;
  exchange: ExchangeId;
}

interface UpdateTickerRequest {
  id: string;
  name: string;
  symbol: string;
  exchange: ExchangeId;
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
  updatedTickers: TickerV1[];
}

interface EditTickersFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  tickers: TickerV1[];
  selectedIndustry: string;
  selectedSubIndustry: string;
  industries: TickerV1Industry[];
  subIndustries: TickerV1SubIndustry[];
}

/** ---------- Component ---------- */

export default function EditTickersForm({
  onSuccess,
  onCancel,
  tickers,
  selectedIndustry,
  selectedSubIndustry,
  industries,
  subIndustries,
}: EditTickersFormProps): JSX.Element {
  const [tickerEntries, setTickerEntries] = useState<EditableTickerEntry[]>([]);

  // Put hook for updating tickers
  const { putData: putTickers, loading: updateTickersLoading } = usePutData<UpdateTickersResponse, UpdateTickersRequest>({
    successMessage: 'Tickers updated successfully!',
    errorMessage: 'Failed to update tickers.',
  });

  // Initialize ticker entries from props
  useEffect(() => {
    const editableEntries: EditableTickerEntry[] = tickers.map((ticker) => ({
      id: ticker.id,
      name: ticker.name,
      symbol: ticker.symbol,
      websiteUrl: ticker.websiteUrl || '',
      exchange: toExchangeId(ticker.exchange),
    }));
    setTickerEntries(editableEntries);
  }, [tickers]);

  // Helper functions to get display names
  const getIndustryDisplayName = (industryKey: string): string => {
    const industry = industries.find((ind) => ind.industryKey === industryKey);
    return industry?.name || industryKey;
  };

  const getSubIndustryDisplayName = (subIndustryKey: string): string => {
    const subIndustry = subIndustries.find((sub) => sub.subIndustryKey === subIndustryKey);
    return subIndustry?.name || subIndustryKey;
  };

  /** ---------- Submit ---------- */

  const handleUpdateTickers = async (e?: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e?.preventDefault();

    // Validate rows: exchange required per row (and name/symbol for non-empty rows)
    for (let i = 0; i < tickerEntries.length; i++) {
      const t = tickerEntries[i];

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
      tickers: tickerEntries.map(
        (entry): UpdateTickerRequest => ({
          id: entry.id,
          name: entry.name,
          symbol: entry.symbol.toUpperCase(),
          exchange: entry.exchange,
          industryKey: selectedIndustry,
          subIndustryKey: selectedSubIndustry,
          websiteUrl: entry.websiteUrl,
        })
      ),
    };

    const result = await putTickers(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1`, updateRequest);

    if (result) {
      onSuccess();
    }
  };

  /** ---------- Row Mutators ---------- */

  const updateTickerTextField = (index: number, field: 'name' | 'symbol' | 'websiteUrl', value: string): void => {
    setTickerEntries((prev) => {
      const updatedEntries = [...prev];
      updatedEntries[index] = {
        ...updatedEntries[index],
        [field]: field === 'symbol' ? value.toUpperCase() : value,
      };
      return updatedEntries;
    });
  };

  const updateTickerExchange = (index: number, exchange: ExchangeId): void => {
    setTickerEntries((prev) => {
      const updatedEntries = [...prev];
      updatedEntries[index] = { ...updatedEntries[index], exchange };
      return updatedEntries;
    });
  };

  /** ---------- Render ---------- */

  return (
    <Block className="text-color">
      <h3 className="text-lg font-semibold mt-6">Industry Information</h3>
      <div className="my-4 flex flex-col gap-2">
        <div>
          Industry: {selectedIndustry} - {getIndustryDisplayName(selectedIndustry)}
        </div>
        <div>
          Sub-Industry: {selectedSubIndustry} - {getSubIndustryDisplayName(selectedSubIndustry)}
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold">Edit Tickers</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Update ticker information for all tickers in this sub-industry</p>
        </div>
      </div>

      {/* Ticker Entries */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Ticker Information ({tickerEntries.length} tickers)</h3>

        {tickerEntries.map((entry, index) => (
          <div key={entry.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            {/* Exchange FIRST in the row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Exchange</label>
                <StyledSelect
                  label=""
                  selectedItemId={entry.exchange}
                  items={exchangeItems}
                  setSelectedItemId={(id?: string | null) => updateTickerExchange(index, toExchangeId(id))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Company Name</label>
                <input
                  type="text"
                  value={entry.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTickerTextField(index, 'name', e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="e.g. Apple Inc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Symbol</label>
                <input
                  type="text"
                  value={entry.symbol}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTickerTextField(index, 'symbol', e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="e.g. AAPL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Website URL</label>
                <input
                  type="url"
                  value={entry.websiteUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTickerTextField(index, 'websiteUrl', e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="e.g. https://www.apple.com"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex space-x-4 mt-6">
        <Button
          type="submit"
          variant="contained"
          primary
          loading={updateTickersLoading}
          disabled={updateTickersLoading || tickerEntries.length === 0}
          onClick={handleUpdateTickers}
        >
          {updateTickersLoading ? 'Updating...' : `Update ${tickerEntries.length} Tickers`}
        </Button>

        <Button type="button" variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Block>
  );
}
