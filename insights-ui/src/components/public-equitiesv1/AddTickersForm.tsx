import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Papa from 'papaparse';
import React, { useMemo, useRef, useState } from 'react';
import { USExchanges, CanadaExchanges, IndiaExchanges, UKExchanges, isExchange } from '@/utils/countryExchangeUtils';
import TickerFields from './TickerFields';
import RemoveRowButton from './RemoveRowButton';
import type { NewTickerEntry, TickerFieldsValue } from './types';
import { buildKey } from './types';

/** ---------- Types local to Add ---------- */

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

type TickerCsvRow = {
  exchange?: string;
  name?: string;
  symbol?: string;
  websiteUrl?: string;
  stockAnalyzeUrl?: string;
};

interface AddTickersFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  selectedIndustryKey: string;
  selectedSubIndustryKey: string;
}

type NewTickerSubmission = {
  name: string;
  symbol: string;
  exchange: USExchanges | CanadaExchanges | IndiaExchanges | UKExchanges;
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

/** ---------- Component ---------- */

export default function AddTickersForm({ onSuccess, onCancel, selectedIndustryKey, selectedSubIndustryKey }: AddTickersFormProps): JSX.Element {
  const [entries, setEntries] = useState<NewTickerEntry[]>([{ name: '', symbol: '', websiteUrl: '', stockAnalyzeUrl: '', exchange: 'NASDAQ' }]);

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

  const normalizeAndFilterRows = (rows: ReadonlyArray<TickerCsvRow>): NewTickerEntry[] => {
    const valid: NewTickerEntry[] = [];
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

      if (!isExchange(exchangeRaw)) {
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

  /** ---------- API Submit (Batch) ---------- */

  const batchSubmit = async (rows: ReadonlyArray<NewTickerEntry>): Promise<void> => {
    // Filter out entirely empty rows
    const filtered: NewTickerSubmission[] = rows
      .filter((t) => t.name || t.symbol || t.websiteUrl || t.stockAnalyzeUrl)
      .map((t) => ({
        name: t.name.trim(),
        symbol: t.symbol.toUpperCase().trim(),
        exchange: t.exchange,
        industryKey: selectedIndustryKey,
        subIndustryKey: selectedSubIndustryKey,
        websiteUrl: t.websiteUrl.trim(),
        stockAnalyzeUrl: t.stockAnalyzeUrl.trim(),
      }));

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
      setEntries((prev) => prev.filter((t) => !addedSet.has(buildKey(t.symbol, t.exchange))));

      // If nothing errored and at least one added: reset to single blank and call onSuccess
      const noErrors = (data.errorTickers || []).length === 0;
      if (noErrors && (data.addedTickers || []).length > 0) {
        setEntries([{ name: '', symbol: '', websiteUrl: '', stockAnalyzeUrl: '', exchange: 'NASDAQ' }]);
        onSuccess();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit tickers';
      setCsvError(message);
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
      complete: async (results): Promise<void> => {
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
          setEntries([...tickerEntries]);
          await batchSubmit(tickerEntries); // auto-submit full array when CSV is provided
        } catch (err: unknown) {
          console.error('CSV text parsing error:', err);
          setCsvError('Error parsing CSV contents');
        }
      },
      error: (error: Error): void => {
        console.error('CSV text reading error:', error);
        setCsvError('Error reading CSV contents');
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
      complete: async (results): Promise<void> => {
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
          setEntries([...tickerEntries]);
          if (fileInputRef.current) fileInputRef.current.value = '';
          await batchSubmit(tickerEntries); // auto-submit on upload
        } catch (error: unknown) {
          console.error('CSV parsing error:', error);
          setCsvError('Error parsing CSV file');
        }
      },
      error: (error: Error): void => {
        console.error('CSV reading error:', error);
        setCsvError('Error reading CSV file');
      },
    });
  };

  const clearEntries = (): void => {
    setEntries([{ name: '', symbol: '', websiteUrl: '', stockAnalyzeUrl: '', exchange: 'NASDAQ' }]);
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

    if (!selectedIndustryKey || !selectedSubIndustryKey) {
      // eslint-disable-next-line no-alert
      alert('Please select both Industry and Sub-Industry');
      return;
    }

    // Validate rows
    for (let i = 0; i < entries.length; i++) {
      const t = entries[i];
      const hasAny = t.name.trim().length > 0 || t.symbol.trim().length > 0 || t.websiteUrl.trim().length > 0 || t.stockAnalyzeUrl.trim().length > 0;
      if (!hasAny) continue;
      if (!t.exchange || !isExchange(t.exchange)) {
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

    await batchSubmit(entries);
  };

  /** ---------- Mutators ---------- */

  const addRow = (): void => {
    setEntries((prev) => [...prev, { name: '', symbol: '', websiteUrl: '', stockAnalyzeUrl: '', exchange: 'NASDAQ' }]);
  };

  const removeRow = (index: number): void => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const patchRow = (index: number, patch: Partial<NewTickerEntry>): void => {
    setEntries((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
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
            CSV format: <code>exchange, name, symbol, websiteUrl, stockAnalyzeUrl</code> (<strong>exchange required</strong>; websiteUrl &amp; stockAnalyzeUrl
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
            onClick={(): void => parseCsvFromText(csvText)}
            disabled={csvText.trim().length === 0 || loading}
            className="text-sm"
          >
            Parse & Add CSV
          </Button>
          {entries.length > 1 && (
            <Button type="button" variant="outlined" onClick={clearEntries} className="text-sm text-red-600 hover:text-red-800">
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
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>): void => setCsvText(e.target.value)}
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

      {/* Ticker Entries */}
      <div className="space-y-6 mt-4">
        <h3 className="text-lg font-semibold">Ticker Information</h3>

        {entries.map((entry, index) => {
          const key = buildKey(entry.symbol, entry.exchange);
          const inlineError = rowErrors[key];

          const coreValue: TickerFieldsValue = {
            exchange: entry.exchange,
            name: entry.name,
            symbol: entry.symbol,
            websiteUrl: entry.websiteUrl,
            stockAnalyzeUrl: entry.stockAnalyzeUrl,
          };

          return (
            <div key={index}>
              <TickerFields
                value={coreValue}
                onPatch={(patch): void => patchRow(index, patch)}
                mdColumns={5} // Add form shows 5 cols when we include stockAnalyzeUrl
                inlineError={inlineError}
              />

              {index > 0 && (
                <div className="mt-3 flex justify-end">
                  <RemoveRowButton onClick={(): void => removeRow(index)} ariaLabel={`Remove ticker row ${index + 1}`} />
                </div>
              )}
            </div>
          );
        })}

        <div>
          <button type="button" onClick={addRow} className="text-blue-600 hover:text-blue-800 flex items-center">
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
