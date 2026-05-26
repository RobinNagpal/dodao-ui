'use client';

import { GenerationRequestPayload, TickerIdentifier } from '@/app/api/[spaceId]/tickers-v1/generation-requests/route';
import { analysisTypes, ReportType } from '@/types/ticker-typesv1';
import { createBackgroundGenerationRequest, createSingleAnalysisBackgroundRequest } from '@/utils/analysis-reports/report-generator-utils';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { parseMarkdown } from '@/util/parse-markdown';
import { GeneratePromptRequest, GeneratePromptResponse } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/generate-prompt/route';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import RawJsonEditModal from '@/components/prompts/RawJsonEditModal';
import { LLMResponse, SaveJsonReportRequest } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/save-json-report/route';
import { revalidateTickerCache } from '@/utils/cache-actions';
import EditStockDetailsModal from '@/app/stocks/[exchange]/[ticker]/EditStockDetailsModal';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';

interface StockActionsAdminPanelProps {
  ticker: TickerIdentifier;
  movedExchange?: string | null;
  movedSymbol?: string | null;
  isDeleted?: boolean;
  websiteUrl?: string | null;
}

export default function StockActionsAdminPanel({ ticker, movedExchange, movedSymbol, isDeleted, websiteUrl }: StockActionsAdminPanelProps): JSX.Element {
  const router = useRouter();
  const { showNotification } = useNotificationContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [selectedPromptType, setSelectedPromptType] = useState<ReportType | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [importedJson, setImportedJson] = useState<string>('');
  const [jsonContent, setJsonContent] = useState<LLMResponse | null>(null);
  const [isEditDetailsOpen, setIsEditDetailsOpen] = useState(false);

  // Post hook for background generation requests
  const { postData: postRequest } = usePostData<any, GenerationRequestPayload[]>({
    successMessage: 'Background generation request created successfully!',
    errorMessage: 'Failed to create background generation request.',
  });

  // Post hook for prompt generation
  const { postData: postPromptData } = usePostData<GeneratePromptResponse, GeneratePromptRequest>({
    successMessage: 'Prompt generated successfully!',
    errorMessage: 'Failed to generate prompt.',
  });

  // Post hook for saving JSON report
  const { postData: postSaveReport, loading: savingReport } = usePostData<{ success: boolean; message: string }, SaveJsonReportRequest>({
    successMessage: 'Report saved successfully!',
    errorMessage: 'Failed to save report.',
  });

  // Create dropdown items - "Generate Report", "Import Prompt", "Invalidate Cache", and "Edit Stock"
  const dropdownItems: EllipsisDropdownItem[] = [
    { key: 'generate-report', label: 'Generate Report' },
    { key: 'import-prompt', label: 'Import Prompt' },
    { key: 'invalidate-cache', label: 'Invalidate Cache' },
    { key: 'edit-stock', label: 'Edit Stock' },
  ];

  const reportGenerationItems: EllipsisDropdownItem[] = [
    ...analysisTypes.map((analysisType) => ({
      key: analysisType.key,
      label: `Generate ${analysisType.label}`,
    })),
    { key: 'generate-all', label: 'Generate All Reports' },
  ];

  const handleDropdownSelect = async (key: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    if (key === 'generate-report') {
      setIsModalOpen(true);
    } else if (key === 'import-prompt') {
      setIsPromptModalOpen(true);
    } else if (key === 'invalidate-cache') {
      const result = await revalidateTickerCache(ticker.symbol, ticker.exchange);
      showNotification({ type: result.success ? 'success' : 'error', message: result.message });
      router.refresh();
    } else if (key === 'edit-stock') {
      setIsEditDetailsOpen(true);
    }
  };

  const handleEditDetailsSaved = async (): Promise<void> => {
    const result = await revalidateTickerCache(ticker.symbol, ticker.exchange);
    // After an edit-save, only surface CloudFront problems — the save itself
    // already shows its own success notification via usePostData.
    if (!result.success) {
      showNotification({ type: 'error', message: result.message });
    }
    router.refresh();
  };

  const handleModalSelect = async (key: string) => {
    setIsModalOpen(false);
    try {
      if (key === 'generate-all') {
        await createBackgroundGenerationRequest(ticker, postRequest);
      } else {
        await createSingleAnalysisBackgroundRequest(key as ReportType, ticker, postRequest);
      }

      // Redirect to generation requests page after any generation is initiated
      router.push('/admin-v1/generation-requests');
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const handlePromptModalSelect = async (key: string) => {
    // Reset JSON content when switching prompt types
    setJsonContent(null);
    setImportedJson('');

    const result = await postPromptData(`${getBaseUrl()}/api/koala_gains/tickers-v1/exchange/${ticker.exchange}/${ticker.symbol}/generate-prompt`, {
      reportType: key as ReportType,
    });

    if (result) {
      setSelectedPromptType(key as ReportType);
      setGeneratedPrompt(result.prompt);
    }
  };

  const handleJsonSave = (jsonString: string) => {
    try {
      const parsedJson = JSON.parse(jsonString);
      setJsonContent(parsedJson);
      setImportedJson(jsonString);
      setIsJsonModalOpen(false);
    } catch (error) {
      console.error('Invalid JSON:', error);
    }
  };

  const handleSaveReport = async () => {
    if (!jsonContent || !selectedPromptType) return;

    const result = await postSaveReport(`${getBaseUrl()}/api/koala_gains/tickers-v1/exchange/${ticker.exchange}/${ticker.symbol}/save-json-report`, {
      llmResponse: jsonContent,
      reportType: selectedPromptType,
    });

    if (result) {
      // Reset state after successful save
      setJsonContent(null);
      setImportedJson('');
      setIsPromptModalOpen(false);
      setSelectedPromptType(null);
      setGeneratedPrompt('');
    }
  };

  const renderJsonContentInMarkdown = (content: LLMResponse) => {
    if (!content || typeof content !== 'object') return null;

    const formatTitle = (key: string) => {
      return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    };

    const renderValue = (value: any, key: string) => {
      // Handle arrays specially
      if (Array.isArray(value)) {
        return (
          <div className="space-y-4">
            {value.map((item, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-md">
                {typeof item === 'object' && item !== null ? (
                  <div className="space-y-3">
                    {Object.entries(item).map(([itemKey, itemValue]) => (
                      <div key={itemKey}>
                        <h5 className="font-semibold text-gray-300 mb-1 capitalize">{formatTitle(itemKey)}</h5>
                        <div className="markdown markdown-body text-left">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: parseMarkdown(
                                typeof itemValue === 'string'
                                  ? itemValue
                                  : typeof itemValue === 'object' && itemValue !== null
                                  ? JSON.stringify(itemValue, null, 2)
                                  : String(itemValue)
                              ),
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="markdown markdown-body text-left">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: parseMarkdown(String(item)),
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      }

      // Handle regular values
      return (
        <div className="markdown markdown-body text-left">
          <div
            dangerouslySetInnerHTML={{
              __html: parseMarkdown(
                typeof value === 'string' ? value : typeof value === 'object' && value !== null ? JSON.stringify(value, null, 2) : String(value)
              ),
            }}
          />
        </div>
      );
    };

    return (
      <div className="space-y-6">
        {Object.entries(content).map(([key, value]) => (
          <div key={key} className="border-b border-gray-600 pb-4">
            <h3 className="text-lg font-semibold text-white mb-3 capitalize">
              {formatTitle(key)}
              {Array.isArray(value) && (
                <span className="ml-2 text-sm text-gray-400 font-normal">
                  ({value.length} item{value.length !== 1 ? 's' : ''})
                </span>
              )}
            </h3>
            {renderValue(value, key)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <EllipsisDropdown items={dropdownItems} className="px-2 py-2 z-10" onSelect={handleDropdownSelect} />

      <FullPageModal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate Report">
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {reportGenerationItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleModalSelect(item.key)}
                className="text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors duration-200 border border-gray-600 text-sm"
                disabled={item.disabled}
              >
                <span className={`${item.disabled ? 'text-gray-500' : 'text-white'}`}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </FullPageModal>

      <FullPageModal
        open={isPromptModalOpen}
        onClose={() => {
          setIsPromptModalOpen(false);
          setSelectedPromptType(null);
          setGeneratedPrompt('');
          setJsonContent(null);
          setImportedJson('');
        }}
        title={selectedPromptType ? `Prompt for ${analysisTypes.find((t) => t.key === selectedPromptType)?.label}` : 'Import Prompt'}
      >
        <PageWrapper>
          <div className="px-4">
            {!selectedPromptType ? (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white">Select Report Type</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {analysisTypes.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => handlePromptModalSelect(item.key)}
                      className="text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors duration-200 border border-gray-600 text-sm"
                    >
                      <span className="text-white">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => {
                      setSelectedPromptType(null);
                      setGeneratedPrompt('');
                      setJsonContent(null);
                      setImportedJson('');
                    }}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
                  >
                    ← Back to Selection
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(generatedPrompt);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        } catch (error) {
                          console.error('Failed to copy prompt:', error);
                        }
                      }}
                      className={`px-3 py-1 rounded text-sm text-white transition-colors duration-200 ${
                        copied ? 'bg-green-600 hover:bg-green-500' : 'bg-blue-600 hover:bg-blue-500'
                      }`}
                    >
                      {copied ? 'Copied!' : 'Copy Prompt'}
                    </button>
                    <button
                      onClick={() => setIsJsonModalOpen(true)}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-sm text-white transition-colors duration-200"
                    >
                      Import JSON
                    </button>
                  </div>
                </div>
                <div className="rounded-lg p-2 overflow-y-auto">
                  {jsonContent ? (
                    <div>
                      <div className="mb-4 p-3 bg-green-900 border border-green-600 rounded">
                        <p className="text-green-200 text-sm">✓ JSON content imported successfully!</p>
                      </div>
                      <div className="bg-gray-900 border border-gray-600 rounded p-4 mb-4 max-h-96 overflow-y-auto">
                        {renderJsonContentInMarkdown(jsonContent)}
                      </div>
                      <div className="mt-4 flex justify-center gap-3">
                        <button
                          onClick={() => {
                            setJsonContent(null);
                            setImportedJson('');
                          }}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white font-medium"
                        >
                          Clear JSON
                        </button>
                        <button
                          onClick={handleSaveReport}
                          disabled={savingReport}
                          className={`px-4 py-2 rounded text-white font-medium transition-colors duration-200 ${
                            savingReport ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'
                          }`}
                        >
                          {savingReport ? 'Saving...' : 'Save Report'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="markdown markdown-body text-left"
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(generatedPrompt || 'Loading prompt...') }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </PageWrapper>
      </FullPageModal>

      <RawJsonEditModal open={isJsonModalOpen} onClose={() => setIsJsonModalOpen(false)} title="Import JSON Report" onSave={handleJsonSave} />

      <EditStockDetailsModal
        open={isEditDetailsOpen}
        onClose={() => setIsEditDetailsOpen(false)}
        symbol={ticker.symbol}
        exchange={ticker.exchange}
        initialMovedExchange={movedExchange ?? null}
        initialMovedSymbol={movedSymbol ?? null}
        initialIsDeleted={isDeleted ?? false}
        initialWebsiteUrl={websiteUrl ?? null}
        onSaved={handleEditDetailsSaved}
      />
    </>
  );
}
