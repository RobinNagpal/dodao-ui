'use client';

import { GenerationRequestPayload, TickerIdentifier } from '@/app/api/[spaceId]/tickers-v1/generation-requests/route';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { KoalaGainsSession } from '@/types/auth';
import { analysisTypes, ReportType } from '@/types/ticker-typesv1';
import { createBackgroundGenerationRequest, createSingleAnalysisBackgroundRequest } from '@/utils/analysis-reports/report-generator-utils';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useRouter } from 'next/navigation';
import React, { ReactNode, useState } from 'react';
import { parseMarkdown } from '@/util/parse-markdown';
import { GeneratePromptRequest, GeneratePromptResponse } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/generate-prompt/route';

interface StockActionsProps {
  ticker: TickerIdentifier;
  session?: KoalaGainsSession;
  children?: ReactNode;
}

export default function StockActions({ ticker, children, session }: StockActionsProps): JSX.Element {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [selectedPromptType, setSelectedPromptType] = useState<ReportType | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [copied, setCopied] = useState(false);

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

  // Create dropdown items - "Generate Report" and "Import Prompt" options
  const dropdownItems: EllipsisDropdownItem[] = [
    { key: 'generate-report', label: 'Generate Report' },
    { key: 'import-prompt', label: 'Import Prompt' },
  ];

  // Create modal items for all report types
  const reportGenerationItems: EllipsisDropdownItem[] = [
    ...analysisTypes.map((analysisType) => ({
      key: analysisType.key,
      label: `Generate ${analysisType.label}`,
    })),
    { key: 'generate-all', label: 'Generate All Reports' },
  ];

  const handleDropdownSelect = (key: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    if (key === 'generate-report') {
      setIsModalOpen(true);
    } else if (key === 'import-prompt') {
      setIsPromptModalOpen(true);
    }
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
    const result = await postPromptData(`${getBaseUrl()}/api/koala_gains/tickers-v1/exchange/${ticker.exchange}/${ticker.symbol}/generate-prompt`, {
      reportType: key as ReportType,
    });

    if (result) {
      setSelectedPromptType(key as ReportType);
      setGeneratedPrompt(result.prompt);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 z-10">
        {children}
        <PrivateWrapper session={session}>
          <EllipsisDropdown items={dropdownItems} className="px-2 py-2 z-10" onSelect={handleDropdownSelect} />
        </PrivateWrapper>
      </div>

      <FullPageModal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate Report" fullWidth={false}>
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
        }}
        title={selectedPromptType ? `Prompt for ${analysisTypes.find((t) => t.key === selectedPromptType)?.label}` : 'Import Prompt'}
        fullWidth={true}
      >
        <div className="p-4">
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
                  }}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
                >
                  ← Back to Selection
                </button>
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
              </div>
              <div className="rounded-lg p-2 overflow-y-auto">
                <div className="markdown markdown-body text-left" dangerouslySetInnerHTML={{ __html: parseMarkdown(generatedPrompt || 'Loading prompt...') }} />
              </div>
            </div>
          )}
        </div>
      </FullPageModal>
    </>
  );
}
