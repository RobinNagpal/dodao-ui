import React, { useState } from 'react';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';
import { TickerV1Industry, TickerV1SubIndustry } from '@prisma/client';

interface NewTickerResponse {
  success: boolean;
  ticker: any;
}

interface TickerEntry {
  name: string;
  symbol: string;
  websiteUrl: string;
}

interface NewTickerForm {
  tickerEntries: TickerEntry[];
  exchange: string;
  industryKey: string;
  subIndustryKey: string;
}

interface AddTickersFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialIndustry?: string;
  initialSubIndustry?: string;
  industries: TickerV1Industry[];
  subIndustries: TickerV1SubIndustry[];
}

export default function AddTickersForm({
  onSuccess,
  onCancel,
  initialIndustry,
  initialSubIndustry,
  industries,
  subIndustries,
}: AddTickersFormProps): JSX.Element {
  const [newTickerForm, setNewTickerForm] = useState<NewTickerForm>({
    tickerEntries: [{ name: '', symbol: '', websiteUrl: '' }],
    exchange: 'NASDAQ',
    industryKey: initialIndustry || '',
    subIndustryKey: initialSubIndustry || '',
  });

  // Filter sub-industries based on selected industry
  const filteredSubIndustries = subIndustries.filter((sub) => sub.industryKey === newTickerForm.industryKey);

  // Post hook for adding new ticker
  const { postData: postNewTicker, loading: addTickerLoading } = usePostData<NewTickerResponse, any>({
    successMessage: 'Ticker added successfully!',
    errorMessage: 'Failed to add ticker.',
  });

  const exchangeItems: StyledSelectItem[] = [
    { id: 'NASDAQ', label: 'NASDAQ' },
    { id: 'NYSE', label: 'NYSE' },
    { id: 'AMEX', label: 'AMEX' },
    { id: 'TSX', label: 'TSX' },
  ];

  const handleAddTicker = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that industry and sub-industry are selected
    if (!newTickerForm.industryKey || !newTickerForm.subIndustryKey) {
      alert('Please select both Industry and Sub-Industry');
      return;
    }

    // Submit each ticker entry sequentially
    let allSuccess = true;

    for (const tickerEntry of newTickerForm.tickerEntries) {
      // Skip empty entries
      if (!tickerEntry.name || !tickerEntry.symbol) continue;

      // Create a single ticker submission with the common fields
      const tickerSubmission = {
        name: tickerEntry.name,
        symbol: tickerEntry.symbol,
        exchange: newTickerForm.exchange,
        industryKey: newTickerForm.industryKey,
        subIndustryKey: newTickerForm.subIndustryKey,
        websiteUrl: tickerEntry.websiteUrl,
      };

      const result = await postNewTicker(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1`, tickerSubmission);
      if (!result) {
        allSuccess = false;
        break;
      }
    }

    if (allSuccess) {
      // Reset form but maintain the selected industry and sub-industry
      setNewTickerForm({
        tickerEntries: [{ name: '', symbol: '', websiteUrl: '' }],
        exchange: 'NASDAQ',
        industryKey: newTickerForm.industryKey,
        subIndustryKey: newTickerForm.subIndustryKey,
      });
      // Call the onSuccess callback to refresh tickers and hide form
      onSuccess();
    }
  };

  // Function to add a new ticker entry
  const addTickerEntry = () => {
    setNewTickerForm((prev) => ({
      ...prev,
      tickerEntries: [...prev.tickerEntries, { name: '', symbol: '', websiteUrl: '' }],
    }));
  };

  // Function to remove a ticker entry
  const removeTickerEntry = (index: number) => {
    setNewTickerForm((prev) => ({
      ...prev,
      tickerEntries: prev.tickerEntries.filter((_, i) => i !== index),
    }));
  };

  // Function to update a ticker entry
  const updateTickerEntry = (index: number, field: keyof TickerEntry, value: string) => {
    setNewTickerForm((prev) => {
      const updatedEntries = [...prev.tickerEntries];
      updatedEntries[index] = {
        ...updatedEntries[index],
        [field]: field === 'symbol' ? value.toUpperCase() : value,
      };
      return {
        ...prev,
        tickerEntries: updatedEntries,
      };
    });
  };

  return (
    <Block title="Add New Tickers" className="text-color">
      <form onSubmit={handleAddTicker} className="space-y-6">
        {/* Ticker Entries */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Ticker Information</h3>

          {newTickerForm.tickerEntries.map((entry, index) => (
            <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Company Name</label>
                  <input
                    type="text"
                    value={entry.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTickerEntry(index, 'name', e.target.value)}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTickerEntry(index, 'symbol', e.target.value)}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTickerEntry(index, 'websiteUrl', e.target.value)}
                    className="w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="e.g. https://www.apple.com"
                  />
                </div>
              </div>

              {/* Remove button - only show for rows after the first one */}
              {index > 0 && (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeTickerEntry(index)}
                    className="flex items-center text-red-500 hover:text-red-700"
                    aria-label="Remove ticker"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add Another Ticker button */}
          <div>
            <button type="button" onClick={addTickerEntry} className="text-blue-600 hover:text-blue-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Another Ticker
            </button>
          </div>
        </div>

        <h3 className="text-lg font-semibold mt-6">Common Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StyledSelect
            label="Exchange"
            selectedItemId={newTickerForm.exchange}
            items={exchangeItems}
            setSelectedItemId={(exchange) => setNewTickerForm((prev) => ({ ...prev, exchange: exchange || 'NASDAQ' }))}
          />

          <StyledSelect
            label="Industry"
            selectedItemId={newTickerForm.industryKey}
            items={industries.map((industry) => ({
              id: industry.industryKey,
              label: industry.name,
            }))}
            setSelectedItemId={(industry) => {
              setNewTickerForm((prev) => ({
                ...prev,
                industryKey: industry || '',
                subIndustryKey: '', // Reset sub-industry when industry changes
              }));
            }}
          />

          <StyledSelect
            label="Sub-Industry"
            selectedItemId={newTickerForm.subIndustryKey}
            items={filteredSubIndustries.map((subIndustry) => ({
              id: subIndustry.subIndustryKey,
              label: subIndustry.name,
            }))}
            setSelectedItemId={(subIndustry) =>
              setNewTickerForm((prev) => ({
                ...prev,
                subIndustryKey: subIndustry || '',
              }))
            }
          />
        </div>

        <div className="flex space-x-4 mt-6">
          <Button type="submit" variant="contained" primary loading={addTickerLoading} disabled={addTickerLoading}>
            {addTickerLoading ? 'Adding...' : 'Add Tickers'}
          </Button>

          <Button type="button" variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Block>
  );
}
