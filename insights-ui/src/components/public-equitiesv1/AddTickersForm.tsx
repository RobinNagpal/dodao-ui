import React, { useState, useRef } from 'react';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';
import { TickerV1Industry, TickerV1SubIndustry } from '@prisma/client';
import Papa from 'papaparse';

interface NewTickerResponse {
  success: boolean;
  ticker: unknown;
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

type TickerCsvRow = {
  name?: string;
  symbol?: string;
  websiteUrl?: string;
};

type NewTickerSubmission = {
  name: string;
  symbol: string;
  exchange: string;
  industryKey: string;
  subIndustryKey: string;
  websiteUrl: string;
};

const CSV_EXAMPLE: string = `name,symbol,websiteUrl
Apple Inc.,AAPL,https://www.apple.com
Microsoft Corporation,MSFT,https://www.microsoft.com
Shopify Inc.,SHOP,https://www.shopify.com`;

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

  const [csvText, setCsvText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvError, setCsvError] = useState<string>('');

  // Filter sub-industries based on selected industry
  const filteredSubIndustries: TickerV1SubIndustry[] = subIndustries.filter((sub) => sub.industryKey === newTickerForm.industryKey);

  // Post hook for adding new ticker
  const { postData: postNewTicker, loading: addTickerLoading } = usePostData<NewTickerResponse, NewTickerSubmission>({
    successMessage: 'Ticker added successfully!',
    errorMessage: 'Failed to add ticker.',
  });

  const exchangeItems: StyledSelectItem[] = [
    { id: 'NASDAQ', label: 'NASDAQ' },
    { id: 'NYSE', label: 'NYSE' },
    { id: 'AMEX', label: 'AMEX' },
    { id: 'TSX', label: 'TSX' },
  ];

  // ---------- CSV Utilities ----------
  const requiredHeaders: ReadonlyArray<keyof Required<TickerCsvRow>> = ['name', 'symbol', 'websiteUrl'];

  const validateHeaders = (headers: string[]): string | null => {
    const mustHave: Array<'name' | 'symbol'> = ['name', 'symbol'];
    const missing = mustHave.filter((h) => !headers.includes(h));
    if (missing.length > 0) {
      return `Missing required headers: ${missing.join(', ')}`;
    }
    return null;
  };

  const normalizeAndFilterRows = (rows: Array<TickerCsvRow>): TickerEntry[] => {
    return rows
      .map((row): TickerEntry | null => {
        const name = (row.name ?? '').trim();
        const symbol = (row.symbol ?? '').trim().toUpperCase();
        const websiteUrl = (row.websiteUrl ?? '').trim();
        if (!name || !symbol) return null;
        return { name, symbol, websiteUrl };
      })
      .filter((r): r is TickerEntry => r !== null);
  };

  const loadTickerEntries = (entries: TickerEntry[]): void => {
    if (entries.length === 0) {
      setCsvError('No valid ticker entries found in CSV');
      return;
    }
    setNewTickerForm((prev) => ({
      ...prev,
      tickerEntries: entries,
    }));
  };

  const parseCsvFromText = (text: string): void => {
    setCsvError('');
    Papa.parse<TickerCsvRow>(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data ?? [];
          if (data.length === 0) {
            setCsvError('CSV contents are empty');
            return;
          }
          const headers = Object.keys(data[0] ?? {});
          const headerErr = validateHeaders(headers);
          if (headerErr) {
            setCsvError(headerErr);
            return;
          }
          const tickerEntries = normalizeAndFilterRows(data);
          loadTickerEntries(tickerEntries);
        } catch (err) {
          setCsvError('Error parsing CSV contents');
          // eslint-disable-next-line no-console
          console.error('CSV text parsing error:', err);
        }
      },
      error: (error: Error) => {
        setCsvError('Error reading CSV contents');
        // eslint-disable-next-line no-console
        console.error('CSV text reading error:', error);
      },
    });
  };

  // CSV handling from file
  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvError('');

    Papa.parse<TickerCsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data ?? [];

          if (data.length === 0) {
            setCsvError('CSV file is empty');
            return;
          }

          const headers = Object.keys(data[0] ?? {});
          const headerErr = validateHeaders(headers);
          if (headerErr) {
            setCsvError(headerErr);
            return;
          }

          const tickerEntries = normalizeAndFilterRows(data);
          loadTickerEntries(tickerEntries);

          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error) {
          setCsvError('Error parsing CSV file');
          // eslint-disable-next-line no-console
          console.error('CSV parsing error:', error);
        }
      },
      error: (error: Error) => {
        setCsvError('Error reading CSV file');
        // eslint-disable-next-line no-console
        console.error('CSV reading error:', error);
      },
    });
  };

  const clearTickerEntries = (): void => {
    setNewTickerForm((prev) => ({
      ...prev,
      tickerEntries: [{ name: '', symbol: '', websiteUrl: '' }],
    }));
    setCsvError('');
    setCsvText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddTicker = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Validate that industry and sub-industry are selected
    if (!newTickerForm.industryKey || !newTickerForm.subIndustryKey) {
      // eslint-disable-next-line no-alert
      alert('Please select both Industry and Sub-Industry');
      return;
    }

    // Submit each ticker entry sequentially
    let allSuccess = true;

    for (const tickerEntry of newTickerForm.tickerEntries) {
      // Skip empty entries
      if (!tickerEntry.name || !tickerEntry.symbol) continue;

      // Create a single ticker submission with the common fields
      const tickerSubmission: NewTickerSubmission = {
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
  const addTickerEntry = (): void => {
    setNewTickerForm((prev) => ({
      ...prev,
      tickerEntries: [...prev.tickerEntries, { name: '', symbol: '', websiteUrl: '' }],
    }));
  };

  // Function to remove a ticker entry
  const removeTickerEntry = (index: number): void => {
    setNewTickerForm((prev) => ({
      ...prev,
      tickerEntries: prev.tickerEntries.filter((_, i) => i !== index),
    }));
  };

  // Function to update a ticker entry
  const updateTickerEntry = (index: number, field: keyof TickerEntry, value: string): void => {
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
    <Block className="text-color">
      <form onSubmit={handleAddTicker} className="space-y-6">
        {/* Header with CSV controls */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold">Add New Tickers</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              CSV format: <code>name, symbol, websiteUrl</code> (websiteUrl optional)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" id="csv-upload" />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/30"
            >
              Upload CSV
            </label>
            <Button type="button" variant="outlined" onClick={() => parseCsvFromText(csvText)} disabled={csvText.trim().length === 0} className="text-sm">
              Add CSV Contents
            </Button>
            {newTickerForm.tickerEntries.length > 1 && (
              <Button type="button" variant="outlined" onClick={clearTickerEntries} className="text-sm text-red-600 hover:text-red-800">
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* CSV Text Area with example on top */}
        <div className="space-y-2">
          <div className="rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20 p-3">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Example CSV</p>
            <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{CSV_EXAMPLE}</pre>
          </div>
          <label htmlFor="csv-contents" className="block text-sm font-medium dark:text-gray-300">
            Paste CSV Contents
          </label>
          <textarea
            id="csv-contents"
            value={csvText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCsvText(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder={`Paste CSV rows here...\n\n${CSV_EXAMPLE}`}
            aria-describedby="csv-help"
          />
          <p id="csv-help" className="text-xs text-gray-500 dark:text-gray-400">
            Click <strong>Add CSV Contents</strong> to parse the pasted data, or use <strong>Upload CSV</strong> to select a file.
          </p>
        </div>

        {/* CSV Error/Success Messages */}
        {csvError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md" role="alert" aria-live="assertive">
            <p className="text-sm text-red-600 dark:text-red-400">{csvError}</p>
          </div>
        )}

        {newTickerForm.tickerEntries.length > 1 && !csvError && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md" role="status" aria-live="polite">
            <p className="text-sm text-green-600 dark:text-green-400">
              ✓ Loaded {newTickerForm.tickerEntries.length} ticker{newTickerForm.tickerEntries.length !== 1 ? 's' : ''} from CSV
            </p>
          </div>
        )}

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
                    aria-label={`Remove ticker row ${index + 1}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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
            setSelectedItemId={(exchange?: string | null) => setNewTickerForm((prev) => ({ ...prev, exchange: exchange || 'NASDAQ' }))}
          />

          <StyledSelect
            label="Industry"
            selectedItemId={newTickerForm.industryKey}
            items={industries.map((industry) => ({
              id: industry.industryKey,
              label: industry.name,
            }))}
            setSelectedItemId={(industry?: string | null) => {
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
            setSelectedItemId={(subIndustry?: string | null) =>
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
