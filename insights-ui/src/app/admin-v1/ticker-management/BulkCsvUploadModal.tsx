'use client';

import Button from '@dodao/web-core/components/core/buttons/Button';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import Papa from 'papaparse';
import React, { useRef, useState } from 'react';

/** ---------- Types ---------- */

interface CsvRow {
  exchange?: string;
  name?: string;
  symbol?: string;
  websiteUrl?: string;
  stockAnalyzeUrl?: string;
  industryKey?: string;
  subIndustryKey?: string;
  description?: string; // ignored
}

interface ErrorRow {
  symbol: string;
  exchange: string;
  reason: string;
}

interface BulkCsvResponse {
  success: boolean;
  addedCount: number;
  skippedCount: number;
  errorRows: ErrorRow[];
}

interface BulkCsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const REQUIRED_HEADERS = ['exchange', 'name', 'symbol', 'industrykey', 'subindustrykey'] as const;

/** ---------- Component ---------- */

export default function BulkCsvUploadModal({ isOpen, onClose, onSuccess }: BulkCsvUploadModalProps): JSX.Element {
  const [loading, setLoading] = useState(false);
  const [parseError, setParseError] = useState<string>('');
  const [result, setResult] = useState<BulkCsvResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = (): void => {
    setLoading(false);
    setParseError('');
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = (): void => {
    reset();
    onClose();
  };

  const validateHeaders = (headers: string[]): string | null => {
    const lower = headers.map((h) => h.toLowerCase().trim());
    const missing = REQUIRED_HEADERS.filter((h) => !lower.includes(h));
    if (missing.length > 0) {
      return `Missing required columns: ${missing.join(', ')}`;
    }
    return null;
  };

  const submitRows = async (rows: CsvRow[]): Promise<void> => {
    const tickers = rows
      .filter((r) => r.symbol && r.exchange && r.name && r.industryKey && r.subIndustryKey)
      .map((r) => ({
        exchange: (r.exchange ?? '').trim().toUpperCase(),
        name: (r.name ?? '').trim(),
        symbol: (r.symbol ?? '').trim().toUpperCase(),
        websiteUrl: (r.websiteUrl ?? '').trim() || undefined,
        stockAnalyzeUrl: (r.stockAnalyzeUrl ?? '').trim() || undefined,
        industryKey: (r.industryKey ?? '').trim(),
        subIndustryKey: (r.subIndustryKey ?? '').trim(),
      }));

    if (tickers.length === 0) {
      setParseError('No valid rows found in CSV. Ensure all required columns have values.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/bulk-csv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickers }),
      });

      const data: BulkCsvResponse = await res.json();
      setResult(data);

      if (data.addedCount > 0) {
        onSuccess();
      }
    } catch (err: unknown) {
      setParseError(err instanceof Error ? err.message : 'Failed to upload tickers');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError('');
    setResult(null);

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Normalize header: lowercase, remove spaces around "Key" combos
        // e.g. "industryKey" stays "industryKey"; "Industry Key" => "industryKey"
        const trimmed = header.trim();
        // convert "Industry Key" → "industryKey" style normalization
        return trimmed.replace(/\s+(.)/g, (_, c) => c.toUpperCase()).replace(/^(.)/, (_, c) => c.toLowerCase());
      },
      complete: async (parsed) => {
        const data = parsed.data;
        if (!data.length) {
          setParseError('CSV file is empty.');
          return;
        }
        const headers = Object.keys(data[0]);
        const headerErr = validateHeaders(headers);
        if (headerErr) {
          setParseError(headerErr);
          return;
        }
        await submitRows(data);
      },
      error: (err: Error) => {
        setParseError(`Error reading file: ${err.message}`);
      },
    });
  };

  return (
    <SingleSectionModal open={isOpen} onClose={handleClose} title="Bulk Upload Tickers from CSV">
      <div className="space-y-4 p-2">
        {/* Instructions */}
        <div className="rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 text-sm">
          <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Required CSV columns:</p>
          <code className="text-xs text-gray-600 dark:text-gray-400">exchange, name, symbol, industryKey, subIndustryKey</code>
          <p className="font-medium text-gray-700 dark:text-gray-300 mt-2 mb-1">Optional columns:</p>
          <code className="text-xs text-gray-600 dark:text-gray-400">websiteUrl, stockAnalyzeUrl</code>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            The <strong>description</strong> column is ignored. Duplicate tickers (same symbol + exchange) will be reported as errors.
          </p>
        </div>

        {/* File input */}
        {!result && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select CSV file</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={loading}
              className="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
            />
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Uploading tickers…
          </div>
        )}

        {/* Parse / request error */}
        {parseError && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 p-3 text-sm text-red-700 dark:text-red-400">
            {parseError}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-3">
            {result.addedCount > 0 && (
              <div className="rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 p-3 text-sm text-green-700 dark:text-green-400">
                ✓ Successfully added <strong>{result.addedCount}</strong> ticker{result.addedCount !== 1 ? 's' : ''}.
              </div>
            )}

            {result.errorRows.length > 0 && (
              <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-3 text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                  {result.errorRows.length} ticker{result.errorRows.length !== 1 ? 's' : ''} could not be added:
                </p>
                <ul className="space-y-1 max-h-60 overflow-y-auto list-disc ml-4 text-yellow-800 dark:text-yellow-300">
                  {result.errorRows.map((e, i) => (
                    <li key={i}>
                      <span className="font-mono font-medium">
                        {e.symbol} ({e.exchange})
                      </span>{' '}
                      — {e.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Upload another file */}
            <Button
              variant="outlined"
              onClick={() => {
                setResult(null);
                setParseError('');
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              Upload Another File
            </Button>
          </div>
        )}

        {/* Footer buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outlined" onClick={handleClose} disabled={loading}>
            Close
          </Button>
        </div>
      </div>
    </SingleSectionModal>
  );
}
