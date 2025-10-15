import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ExchangeId, exchangeItems, isExchangeId, toExchangeId } from '@/utils/exchangeUtils';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Papa from 'papaparse';
import React, { useMemo, useRef, useState } from 'react';

/** ---------- Types ---------- */

type AddedTicker = {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  websiteUrl?: string | null;
  stockAnalyzeUrl?: string | null;
  industryKey: string;
  subIndustryKey: string;
};

interface ErrorTicker {
  input: NewTickerSubmission;
  reason: string;
}

interface BulkResponse {
  success: boolean;
  addedTickers: AddedTicker[];
  errorTickers: ErrorTicker[];
}

interface TickerEntry {
  name: string;
  symbol: string;
  websiteUrl: string;
  stockAnalyzeUrl: string;
  exchange: ExchangeId;
}

interface NewTickerForm {
  tickerEntries: TickerEntry[];
  industryKey: string;
  subIndustryKey: string;
}

interface AddTickersFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  selectedIndustryKey: string;
  selectedSubIndustryKey: string;
}

type TickerCsvRow = {
  exchange?: string;
  name?: string;
  symbol?: string;
  websiteUrl?: string;
  stockAnalyzeUrl?: string;
};

type NewTickerSubmission = {
  name: string;
  symbol: string;
  exchange: ExchangeId;
  industryKey: string;
  subIndustryKey: string;
  websiteUrl: string;
  stockAnalyzeUrl: string;
};

/** ---------- Constants & Helpers ---------- */

const CSV_EXAMPLE: string = `exchange,name,symbol,websiteUrl,stockAnalyzeUrl
NASDAQ,Apple Inc.,AAPL,https://www.apple.com,https://www.tradingview.com/symbols/NASDAQ-AAPL/
NASDAQ,Microsoft Corporation,MSFT,https://www.microsoft.com,https://www.tradingview.com/symbols/NASDAQ-MSFT/
TSX,Shopify Inc.,SHOP,https://www.shopify.com,https://www.tradingview.com/symbols/TSX-SHOP/`;

function buildKey(symbol: string, exchange: string): string {
  return `${symbol.toUpperCase()}|${exchange}`;
}

/** ---------- Component ---------- */

export default function AddTickersForm({ onSuccess, onCancel, selectedIndustryKey, selectedSubIndustryKey }: AddTickersFormProps): JSX.Element {
  const [newTickerForm, setNewTickerForm] = useState<NewTickerForm>({
    tickerEntries: [{ name: '', symbol: '', websiteUrl: '', stockAnalyzeUrl: '', exchange: 'NASDAQ' }],
    industryKey: selectedIndustryKey,
    subIndustryKey: selectedSubIndustryKey,
  });

  const [csvText, setCsvText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [csvError, setCsvError] = useState<string>('');
  const [feedbackAdded, setFeedbackAdded] = useState<AddedTicker[]>([]);
  const [feedbackErrors, setFeedbackErrors] = useState<ErrorTicker[]>([]);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep row errors keyed by symbol|exchange for quick inline display
  const addedKeys = useMemo(() => new Set(feedbackAdded.map((t) => buildKey(t.symbol, t.exchange))), [feedbackAdded]);

  /** ---------- CSV Utilities ---------- */

  const validateHeaders = (headers: string[]): string | null => {
    const lower = headers.map((x) => x.toLowerCase().trim());
    const mustHave: ReadonlyArray<'exchange' | 'name' | 'symbol'> = ['exchange', 'name', 'symbol'] as const;
    const missing = mustHave.filter((h) => !lower.includes(h));
    if (missing.length > 0) {
      return `Missing required headers: ${missing.join(', ')}`;
    }
    return null;
  };

  const normalizeAndFilterRows = (rows: ReadonlyArray<TickerCsvRow>): TickerEntry[] => {
    const valid: TickerEntry[] = [];
    let invalidCount = 0;

    for (const row of rows) {
      const exchangeRaw = (row.exchange ?? '').trim().toUpperCase();
      const name = (row.name ?? '').trim();
      const symbol = (row.symbol ?? '').trim().toUpperCase();
      const websiteUrl = (row.websiteUrl ?? '').trim();
      const stockAnalyzeUrl = (row.stockAnalyzeUrl ?? '').trim();

      if (!exchangeRaw || !name || !symbol) {
        invalidCount++;
        continue;
      }

      if (!isExchangeId(exchangeRaw)) {
        invalidCount++;
        continue;
      }

      valid.push({ name, symbol, websiteUrl, stockAnalyzeUrl, exchange: exchangeRaw });
    }

    if (rows.length > 0 && invalidCount > 0) {
      setCsvError(`${invalidCount} row${invalidCount === 1 ? '' : 's'} ignored due to missing/invalid required fields (exchange, name, symbol).`);
    }

    return valid;
  };

  const loadTickerEntries = (entries: ReadonlyArray<TickerEntry>): void => {
    if (entries.length === 0) {
      setCsvError('No valid ticker entries found in CSV');
      return;
    }
    setNewTickerForm((prev) => ({
      ...prev,
      tickerEntries: [...entries],
    }));
  };

  /** ---------- API Submit (Batch) ---------- */

  const batchSubmit = async (entries: ReadonlyArray<TickerEntry>): Promise<void> => {
    // Filter out entirely empty rows
    const filtered = entries
      .filter((t) => t.name || t.symbol || t.websiteUrl || t.stockAnalyzeUrl)
      .map((t) => ({
        name: t.name.trim(),
        symbol: t.symbol.toUpperCase().trim(),
        exchange: t.exchange,
        industryKey: newTickerForm.industryKey,
        subIndustryKey: newTickerForm.subIndustryKey,
        websiteUrl: t.websiteUrl.trim(),
        stockAnalyzeUrl: t.stockAnalyzeUrl.trim(),
      })) as NewTickerSubmission[];

    if (!filtered.length) return;

    setLoading(true);
    setFeedbackAdded([]);
    setFeedbackErrors([]);
    setRowErrors({});

    try {
      const res = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickers: filtered }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Request failed');
      }

      const data: BulkResponse = await res.json();

      // Success feedback lists
      setFeedbackAdded(data.addedTickers || []);
      setFeedbackErrors(data.errorTickers || []);

      // Map error reasons to rows
      const errMap: Record<string, string> = {};
      for (const e of data.errorTickers || []) {
        const k = buildKey(e.input.symbol, e.input.exchange);
        errMap[k] = e.reason;
      }
      setRowErrors(errMap);

      // Remove successfully added rows from the form; keep error rows
      const addedSet = new Set((data.addedTickers || []).map((t) => buildKey(t.symbol, t.exchange)));
      setNewTickerForm((prev) => ({
        ...prev,
        tickerEntries: prev.tickerEntries.filter((t) => !addedSet.has(buildKey(t.symbol, t.exchange))),
      }));

      // If nothing errored and at least one added: reset to single blank and call onSuccess
      const noErrors = (data.errorTickers || []).length === 0;
      if (noErrors && (data.addedTickers || []).length > 0) {
        setNewTickerForm({
          tickerEntries: [{ name: '', symbol: '', websiteUrl: '', stockAnalyzeUrl: '', exchange: 'NASDAQ' }],
          industryKey: newTickerForm.industryKey,
          subIndustryKey: newTickerForm.subIndustryKey,
        });
        onSuccess();
      }
    } catch (err: any) {
      setCsvError(err?.message || 'Failed to submit tickers');
    } finally {
      setLoading(false);
    }
  };

  /** ---------- CSV Parse + Submit ---------- */

  const parseCsvFromText = (text: string): void => {
    setCsvError('');
    Papa.parse<TickerCsvRow>(text, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const data: TickerCsvRow[] = results.data ?? [];
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
          await batchSubmit(tickerEntries); // auto-submit full array when CSV is provided
        } catch (err) {
          setCsvError('Error parsing CSV contents');
          console.error('CSV text parsing error:', err);
        }
      },
      error: (error: Error) => {
        setCsvError('Error reading CSV contents');
        console.error('CSV text reading error:', error);
      },
    });
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvError('');
    Papa.parse<TickerCsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const data: TickerCsvRow[] = results.data ?? [];
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
          if (fileInputRef.current) fileInputRef.current.value = '';
          await batchSubmit(tickerEntries); // auto-submit on upload
        } catch (error) {
          setCsvError('Error parsing CSV file');
          console.error('CSV parsing error:', error);
        }
      },
      error: (error: Error) => {
        setCsvError('Error reading CSV file');
        console.error('CSV reading error:', error);
      },
    });
  };

  const clearTickerEntries = (): void => {
    setNewTickerForm((prev) => ({
      ...prev,
      tickerEntries: [{ name: '', symbol: '', websiteUrl: '', stockAnalyzeUrl: '', exchange: 'NASDAQ' }],
    }));
    setCsvError('');
    setCsvText('');
    setFeedbackAdded([]);
    setFeedbackErrors([]);
    setRowErrors({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /** ---------- Submit (button) ---------- */

  const handleAddTicker = async (e?: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e?.preventDefault();

    if (!newTickerForm.industryKey || !newTickerForm.subIndustryKey) {
      alert('Please select both Industry and Sub-Industry');
      return;
    }

    // Validate rows
    for (let i = 0; i < newTickerForm.tickerEntries.length; i++) {
      const t = newTickerForm.tickerEntries[i];
      const hasAny = t.name.trim().length > 0 || t.symbol.trim().length > 0 || t.websiteUrl.trim().length > 0 || t.stockAnalyzeUrl.trim().length > 0;
      if (!hasAny) continue;
      if (!t.exchange || !isExchangeId(t.exchange)) {
        alert(`Row ${i + 1}: Please select a valid Exchange.`);
        return;
      }
      if (!t.name.trim() || !t.symbol.trim()) {
        alert(`Row ${i + 1}: Please provide both Company Name and Symbol.`);
        return;
      }
    }

    await batchSubmit(newTickerForm.tickerEntries);
  };

  /** ---------- Row Mutators ---------- */

  const addTickerEntry = (): void => {
    setNewTickerForm((prev) => ({
      ...prev,
      tickerEntries: [...prev.tickerEntries, { name: '', symbol: '', websiteUrl: '', stockAnalyzeUrl: '', exchange: 'NASDAQ' }],
    }));
  };

  const removeTickerEntry = (index: number): void => {
    setNewTickerForm((prev) => ({
      ...prev,
      tickerEntries: prev.tickerEntries.filter((_, i) => i !== index),
    }));
  };

  const updateTickerTextField = (index: number, field: 'name' | 'symbol' | 'websiteUrl' | 'stockAnalyzeUrl', value: string): void => {
    setNewTickerForm((prev) => {
      const updatedEntries = [...prev.tickerEntries];
      updatedEntries[index] = {
        ...updatedEntries[index],
        [field]: field === 'symbol' ? value.toUpperCase() : value,
      } as TickerEntry;
      return { ...prev, tickerEntries: updatedEntries };
    });
  };

  const updateTickerExchange = (index: number, exchange: ExchangeId): void => {
    setNewTickerForm((prev) => {
      const updatedEntries = [...prev.tickerEntries];
      updatedEntries[index] = { ...updatedEntries[index], exchange };
      return { ...prev, tickerEntries: updatedEntries };
    });
  };

  /** ---------- Render ---------- */

  return (
    <Block className="text-color">
      {/* Header with CSV controls */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold">Add New Tickers</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            CSV format: <code>exchange, name, symbol, websiteUrl, stockAnalyzeUrl</code> (<strong>exchange required</strong>, websiteUrl &amp; stockAnalyzeUrl
            optional)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" id="csv-upload" />
          <label
            htmlFor="csv-upload"
            className="cursor-pointer inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/30"
          >
            Upload CSV (auto-add)
          </label>
          <Button
            type="button"
            variant="outlined"
            onClick={() => parseCsvFromText(csvText)}
            disabled={csvText.trim().length === 0 || loading}
            className="text-sm"
          >
            Parse & Add CSV
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
          Clicking <strong>Parse &amp; Add CSV</strong> will parse and immediately submit all rows.
        </p>
      </div>

      {/* Alerts */}
      {csvError && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md" role="alert" aria-live="assertive">
          <p className="text-sm text-red-600 dark:text-red-400">{csvError}</p>
        </div>
      )}

      {feedbackAdded.length > 0 && (
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md" role="status" aria-live="polite">
          <p className="text-sm font-medium text-green-700 dark:text-green-300">
            ✓ Added {feedbackAdded.length} ticker{feedbackAdded.length === 1 ? '' : 's'}:
          </p>
          <ul className="mt-1 list-disc ml-5 text-sm text-green-700 dark:text-green-300">
            {feedbackAdded.map((t) => (
              <li key={t.id}>
                {t.symbol} ({t.exchange}) — {t.name}
                {t.stockAnalyzeUrl ? (
                  <>
                    {' '}
                    ·{' '}
                    <a className="underline" href={t.stockAnalyzeUrl} target="_blank" rel="noreferrer">
                      Analyze
                    </a>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      {feedbackErrors.length > 0 && (
        <div
          className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Some tickers could not be added ({feedbackErrors.length}):</p>
          <ul className="mt-1 list-disc ml-5 text-sm text-yellow-800 dark:text-yellow-200">
            {feedbackErrors.map((e, idx) => (
              <li key={idx}>
                {e.input.symbol.toUpperCase()} ({e.input.exchange}) — {e.input.name} · <span className="italic">{e.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Ticker Entries Form */}
      <div className="space-y-6 mt-4">
        <h3 className="text-lg font-semibold">Ticker Information</h3>

        {newTickerForm.tickerEntries.map((entry, index) => {
          const key = buildKey(entry.symbol, entry.exchange);
          const inlineError = rowErrors[key];
          return (
            <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Stock Analyze URL</label>
                  <input
                    type="url"
                    value={entry.stockAnalyzeUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTickerTextField(index, 'stockAnalyzeUrl', e.target.value)}
                    className="w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="e.g. https://www.tradingview.com/symbols/NASDAQ-AAPL/"
                  />
                </div>
              </div>

              {inlineError && <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">⚠ {inlineError}</p>}

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
          );
        })}

        <div>
          <button type="button" onClick={addTickerEntry} className="text-blue-600 hover:text-blue-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Another Ticker
          </button>
        </div>
      </div>

      <div className="flex space-x-4 mt-6">
        <Button type="submit" variant="contained" primary loading={loading} disabled={loading} onClick={handleAddTicker}>
          {loading ? 'Adding...' : 'Add Tickers'}
        </Button>

        <Button type="button" variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Block>
  );
}
