'use client';

import AdminNav from '@/app/admin-v1/AdminNav';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TickerWithMissingFinancialData } from '@/utils/missing-financial-data-utils';
import { validateStockAnalyzeUrl } from '@/utils/stockAnalyzeUrlValidation';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Checkbox from '@dodao/web-core/components/app/Form/Checkbox';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ArrowPathIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React, { useState } from 'react';
import { TickerV1 } from '@prisma/client';
import { UpdateStockAnalyzeUrlRequest } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/route';
import { FetchFinancialDataRequest, FetchFinancialDataResponse } from '@/app/api/[spaceId]/tickers-v1/fetch-financial-data/route';
import { AllExchanges } from '@/utils/countryExchangeUtils';

interface EditableUrlCellProps {
  ticker: TickerWithMissingFinancialData;
  onUpdate: () => void;
}

function EditableUrlCell({ ticker, onUpdate }: EditableUrlCellProps): JSX.Element {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedUrl, setEditedUrl] = useState<string>(ticker.stockAnalyzeUrl || '');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');

  const { putData: updateUrl, loading: updatingUrl } = usePutData<TickerV1, UpdateStockAnalyzeUrlRequest>({
    successMessage: 'Stock Analyze URL updated successfully!',
    errorMessage: 'Failed to update Stock Analyze URL',
  });

  const handleEdit = (): void => {
    setIsEditing(true);
    setEditedUrl(ticker.stockAnalyzeUrl || '');
    setValidationError('');
  };

  const handleCancel = (): void => {
    setIsEditing(false);
    setEditedUrl(ticker.stockAnalyzeUrl || '');
    setValidationError('');
  };

  const handleSave = async (): Promise<void> => {
    if (isUpdating || updatingUrl) return;

    const trimmedUrl = editedUrl.trim();

    // Validate URL format if provided
    if (trimmedUrl) {
      const validationError = validateStockAnalyzeUrl(ticker.symbol, ticker.exchange as AllExchanges, trimmedUrl);
      if (validationError) {
        setValidationError(validationError);
        return;
      }
    }

    setValidationError('');
    setIsUpdating(true);
    try {
      const result = await updateUrl(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/exchange/${ticker.exchange}/${ticker.symbol}`, {
        stockAnalyzeUrl: trimmedUrl,
      });

      if (result) {
        setIsEditing(false);
        onUpdate();
      }
    } catch (err) {
      console.error('Error updating URL:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={editedUrl}
            onChange={(e) => {
              setEditedUrl(e.target.value);
              setValidationError(''); // Clear validation error on change
            }}
            className={`flex-1 px-2 py-1 text-sm bg-gray-700 text-gray-200 border rounded focus:outline-none focus:ring-2 ${
              validationError
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
            }`}
            disabled={isUpdating || updatingUrl}
            autoFocus
          />
          <button onClick={handleSave} disabled={isUpdating || updatingUrl} className="p-1 text-green-400 hover:text-green-300 disabled:opacity-50" title="Save">
            <CheckIcon className="w-4 h-4" />
          </button>
          <button onClick={handleCancel} disabled={isUpdating || updatingUrl} className="p-1 text-red-400 hover:text-red-300 disabled:opacity-50" title="Cancel">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
        {validationError && <p className="text-sm text-red-400">❌ {validationError}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {ticker.stockAnalyzeUrl ? (
        <>
          <a href={ticker.stockAnalyzeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 break-all flex-1">
            {ticker.stockAnalyzeUrl}
          </a>
          <button onClick={handleEdit} className="p-1 text-gray-400 hover:text-gray-300 flex-shrink-0" title="Edit URL">
            <PencilIcon className="w-4 h-4" />
          </button>
        </>
      ) : (
        <>
          <span className="text-red-400 flex-1">No URL</span>
          <button onClick={handleEdit} className="p-1 text-gray-400 hover:text-gray-300 flex-shrink-0" title="Add URL">
            <PencilIcon className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}

interface MissingFinancialDataTableProps {
  rows: TickerWithMissingFinancialData[];
  selectedRows: Set<string>;
  onSelectRow: (tickerId: string, isSelected: boolean) => void;
  onUrlUpdate: () => void;
}

function MissingFinancialDataTable({ rows, selectedRows, onSelectRow, onUrlUpdate }: MissingFinancialDataTableProps): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Select</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-700 z-10">Ticker</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Industry</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Stock Analyze URL</th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {rows.map((ticker: TickerWithMissingFinancialData) => {
            const exchange: string = ticker.exchange;
            const symbol: string = ticker.symbol;
            const isSelected = selectedRows.has(ticker.id);

            return (
              <tr key={ticker.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Checkbox id={`select-${ticker.id}`} labelContent="" isChecked={isSelected} onChange={(checked) => onSelectRow(ticker.id, checked)} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky left-0 bg-gray-800 z-10 link-color">
                  <Link href={`/stocks/${exchange}/${symbol}`} target="_blank">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{symbol}</span>
                      <span className="text-blue-400 text-xs">({exchange})</span>
                    </div>
                    <div className="text-xs text-gray-400">{ticker.name}</div>
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="text-xs text-gray-400">
                    {ticker.industry?.name || ticker.industryKey || 'Unknown Industry'}
                    <br />
                    {ticker.subIndustry?.name || ticker.subIndustryKey || 'Unknown Sub-Industry'}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <EditableUrlCell ticker={ticker} onUpdate={onUrlUpdate} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function MissingFinancialDataPage(): JSX.Element {
  const [pagination, setPagination] = useState<{ skip: number; take: number }>({ skip: 0, take: 50 });
  const [accumulatedData, setAccumulatedData] = useState<TickerWithMissingFinancialData[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showFetchConfirmation, setShowFetchConfirmation] = useState<boolean>(false);

  const { postData: fetchFinancialData, loading: fetchingFinancialData } = usePostData<FetchFinancialDataResponse, FetchFinancialDataRequest>({
    successMessage: 'Financial data fetch started successfully!',
    errorMessage: 'Failed to fetch financial data',
  });

  const baseUrl: string = `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/missing-financial-data`;
  const params = new URLSearchParams();
  params.append('skip', pagination.skip.toString());
  params.append('take', pagination.take.toString());
  const apiUrl: string = `${baseUrl}?${params.toString()}`;

  const { data, loading, reFetchData } = useFetchData<TickerWithMissingFinancialData[]>(apiUrl, {}, 'Failed to fetch missing financial data');

  React.useEffect(() => {
    if (data) {
      if (pagination.skip === 0) {
        setAccumulatedData(data);
      } else {
        setAccumulatedData((prev) => [...prev, ...data]);
      }
    }
  }, [data, pagination.skip]);

  function handleManualRefresh(): void {
    setPagination({ skip: 0, take: 50 });
    setAccumulatedData([]);
    reFetchData();
  }

  function handleLoadMore(): void {
    setPagination((prev) => ({ skip: prev.skip + prev.take, take: prev.take }));
  }

  function handleSelectRow(tickerId: string, isSelected: boolean): void {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(tickerId);
      } else {
        newSet.delete(tickerId);
      }
      return newSet;
    });
  }

  function handleSelectAll(): void {
    if (accumulatedData.length === 0) return;

    const allIds = accumulatedData.map((ticker) => ticker.id);
    setSelectedRows(new Set(allIds));
  }

  function handleSelectFirst50(): void {
    if (accumulatedData.length === 0) return;

    const first50Ids = accumulatedData.slice(0, 50).map((ticker) => ticker.id);
    setSelectedRows(new Set(first50Ids));
  }

  function handleClearSelection(): void {
    setSelectedRows(new Set());
  }

  function handleFetchFinancialData(): void {
    if (selectedRows.size === 0 || fetchingFinancialData) return;
    setShowFetchConfirmation(true);
  }

  async function handleFetchFinancialDataConfirmed(): Promise<void> {
    setShowFetchConfirmation(false);
    try {
      const result = await fetchFinancialData(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/fetch-financial-data`, {
        tickerIds: Array.from(selectedRows),
      });

      if (result) {
        // Refresh the data to remove successfully processed tickers
        reFetchData();
        setSelectedRows(new Set());
      }
    } catch (err) {
      console.error('Error fetching financial data:', err);
    }
  }

  function handleUrlUpdate(): void {
    // Refresh the data to get updated ticker information
    handleManualRefresh();
  }

  const hasMore: boolean = !!data && data.length === pagination.take;

  return (
    <div className="mt-12 px-4 text-color">
      <AdminNav />

      <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Missing Financial Data</h2>

        <div className="flex items-center gap-3">
          <Button onClick={handleManualRefresh} variant="outlined" className="flex items-center gap-2">
            <ArrowPathIcon className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="bg-gray-800 border border-red-500 rounded-lg p-4">
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="text-xl font-semibold">Tickers with Missing Financial Data</h3>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Showing {accumulatedData.length} tickers</span>
              {hasMore && (
                <Button onClick={handleLoadMore} variant="text" className="text-blue-400 hover:text-blue-300">
                  Show More
                </Button>
              )}
            </div>
          </div>

          {/* Selection controls */}
          {accumulatedData.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              <Button onClick={handleSelectAll} variant="outlined" className="text-sm" disabled={fetchingFinancialData}>
                Select All
              </Button>
              <Button onClick={handleSelectFirst50} variant="outlined" className="text-sm" disabled={fetchingFinancialData}>
                Select First 50
              </Button>
              <Button onClick={handleClearSelection} variant="outlined" className="text-sm" disabled={fetchingFinancialData || selectedRows.size === 0}>
                Clear Selection
              </Button>
              <span className="ml-auto text-sm text-gray-400 self-center">{selectedRows.size} tickers selected</span>
            </div>
          )}

          {/* Fetch button */}
          {selectedRows.size > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              <Button
                onClick={handleFetchFinancialData}
                variant="contained"
                className="flex items-center gap-2"
                disabled={fetchingFinancialData || selectedRows.size === 0}
              >
                {fetchingFinancialData ? 'Fetching...' : 'Fetch Financial Data for Selected'}
              </Button>
            </div>
          )}

          {loading && accumulatedData.length === 0 ? (
            <div className="py-8">Loading missing financial data...</div>
          ) : accumulatedData.length === 0 ? (
            <div className="py-4">No tickers with missing financial data found.</div>
          ) : (
            <MissingFinancialDataTable rows={accumulatedData} selectedRows={selectedRows} onSelectRow={handleSelectRow} onUrlUpdate={handleUrlUpdate} />
          )}
        </div>
      </div>

      <ConfirmationModal
        title="Fetch Financial Data"
        open={showFetchConfirmation}
        onClose={() => setShowFetchConfirmation(false)}
        onConfirm={handleFetchFinancialDataConfirmed}
        confirming={fetchingFinancialData}
        confirmationText={`Are you sure you want to fetch financial data for ${selectedRows.size} selected ticker(s)? This will fetch data from the stock analyzer scraper.`}
        askForTextInput={false}
      />
    </div>
  );
}
