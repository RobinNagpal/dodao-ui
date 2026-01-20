'use client';

import React, { useState } from 'react';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { AnalysisTemplateWithRelations } from '../../api/analysis-templates/route';
import { TickerV1 } from '@prisma/client';
import SearchBar, { SearchResult } from '@/components/core/SearchBar/SearchBar';
import Link from 'next/link';

interface AnalysisTemplateReport {
  id: string;
  analysisTemplateId: string;
  promptId: string;
  promptKey: string;
  inputObj: any;
  createdAt: Date;
  updatedAt: Date;
  analysisTemplate: AnalysisTemplateWithRelations;
}

interface CreateAnalysisTemplateReportRequest {
  analysisTemplateId: string;
  promptKey: string;
  inputObj: any;
}

type ReportType = 'ticker' | 'company';

export default function AnalysisTemplateReportPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('ticker');
  const [selectedTicker, setSelectedTicker] = useState<TickerV1 | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [promptKey, setPromptKey] = useState('');

  const {
    data: reports,
    loading: reportsLoading,
    reFetchData: refetchReports,
  } = useFetchData<AnalysisTemplateReport[]>(
    `${getBaseUrl()}/api/analysis-template-reports`,
    { cache: 'no-cache' },
    'Failed to fetch analysis template reports'
  );

  const { data: templates, loading: templatesLoading } = useFetchData<AnalysisTemplateWithRelations[]>(
    `${getBaseUrl()}/api/analysis-templates`,
    { cache: 'no-cache' },
    'Failed to fetch analysis templates'
  );

  const { postData: createReport, loading: createReportLoading } = usePostData<AnalysisTemplateReport, CreateAnalysisTemplateReportRequest>({
    successMessage: 'Analysis template report created successfully!',
    errorMessage: 'Failed to create analysis template report.',
  });

  const handleTickerSelect = (result: SearchResult) => {
    // Convert SearchResult to a simplified ticker format for our use
    const ticker = {
      id: result.id,
      name: result.name,
      symbol: result.symbol,
      exchange: result.exchange,
    };
    setSelectedTicker(ticker as any);
  };

  const handleCreateReport = async () => {
    if (!selectedTemplateId || !promptKey.trim()) {
      alert('Please select a template and enter a prompt key');
      return;
    }

    let inputObj: any = {};

    if (reportType === 'ticker') {
      if (!selectedTicker) {
        alert('Please select a ticker');
        return;
      }
      inputObj = {
        tickerName: selectedTicker.name,
        tickerSymbol: selectedTicker.symbol,
        exchange: selectedTicker.exchange,
      };
    } else {
      if (!companyName.trim()) {
        alert('Please enter a company name');
        return;
      }
      inputObj = {
        companyName: companyName.trim(),
      };
    }

    const selectedTemplate = templates?.find((t) => t.id === selectedTemplateId);
    if (!selectedTemplate) {
      alert('Selected template not found');
      return;
    }

    const result = await createReport(`${getBaseUrl()}/api/analysis-template-reports`, {
      analysisTemplateId: selectedTemplateId,
      promptKey: promptKey.trim(),
      inputObj,
    });

    if (result) {
      refetchReports();
      setShowCreateModal(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setReportType('ticker');
    setSelectedTicker(null);
    setCompanyName('');
    setSelectedTemplateId('');
    setPromptKey('');
  };

  const templateOptions =
    templates?.map((template) => ({
      id: template.id,
      label: template.name,
    })) || [];

  return (
    <PageWrapper>
      <div className="text-color">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl heading-color">Analysis Template Reports</h1>
          <Button onClick={() => setShowCreateModal(true)} primary variant="contained">
            Create New Report
          </Button>
        </div>

        <p className="text-gray-600 mb-8">Create and manage analysis reports for tickers or companies using analysis templates.</p>

        {/* Reports List */}
        <div>
          {reportsLoading ? (
            <p>Loading reports...</p>
          ) : reports && reports.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-semibold mb-2">{report.analysisTemplate.name}</h3>
                  <p className="text-gray-600 mb-4">Prompt: {report.promptKey}</p>

                  <div className="mb-4">
                    <div className="text-sm text-gray-500">Created: {new Date(report.createdAt).toLocaleDateString()}</div>
                    <div className="text-sm text-blue-600 mt-1">
                      {report.inputObj.tickerSymbol
                        ? `Ticker: ${report.inputObj.tickerSymbol} (${report.inputObj.exchange})`
                        : `Company: ${report.inputObj.companyName}`}
                    </div>
                  </div>

                  <Link href={`/admin-v1/analysis-template-report/${report.id}/generate`} className="w-full">
                    <Button variant="contained" primary className="w-full">
                      Generate Analysis
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No analysis template reports created yet</p>
              <Button onClick={() => setShowCreateModal(true)} primary variant="contained">
                Create Your First Report
              </Button>
            </div>
          )}
        </div>

        {/* Create Report Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-4">Create Analysis Template Report</h2>

              {/* Report Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Report Type</label>
                <div className="flex gap-4">
                  <Button
                    onClick={() => setReportType('ticker')}
                    variant={reportType === 'ticker' ? 'contained' : 'outlined'}
                    primary={reportType === 'ticker'}
                    className="flex-1"
                  >
                    Ticker Analysis
                  </Button>
                  <Button
                    onClick={() => setReportType('company')}
                    variant={reportType === 'company' ? 'contained' : 'outlined'}
                    primary={reportType === 'company'}
                    className="flex-1"
                  >
                    Company Analysis
                  </Button>
                </div>
              </div>

              {/* Template Selection */}
              <div className="mb-6">
                <StyledSelect
                  label="Select Analysis Template *"
                  selectedItemId={selectedTemplateId}
                  items={templateOptions}
                  setSelectedItemId={(id) => setSelectedTemplateId(id || '')}
                />
              </div>

              {/* Prompt Key */}
              <div className="mb-6">
                <Input modelValue={promptKey} onUpdate={(val) => setPromptKey(val as string)} placeholder="Enter prompt key">
                  Prompt Key *
                </Input>
              </div>

              {/* Conditional Input Based on Report Type */}
              {reportType === 'ticker' ? (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Select Ticker</label>

                  {/* Ticker Search using SearchBar component */}
                  <SearchBar placeholder="Search for a ticker..." onResultClick={handleTickerSelect} variant="navbar" />

                  {/* Selected Ticker Display */}
                  {selectedTicker && (
                    <div className="border border-gray-200 rounded p-3 mt-4">
                      <p className="font-medium">{selectedTicker.name}</p>
                      <p className="text-sm text-gray-600">
                        {selectedTicker.symbol} - {selectedTicker.exchange}
                      </p>
                      <Button onClick={() => setSelectedTicker(null)} variant="outlined" className="mt-2">
                        Clear Selection
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-6">
                  <Input modelValue={companyName} onUpdate={(val) => setCompanyName(val as string)} placeholder="Enter company name">
                    Company Name *
                  </Input>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <Button onClick={() => setShowCreateModal(false)} variant="outlined" className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateReport}
                  primary
                  loading={createReportLoading}
                  disabled={!selectedTemplateId || !promptKey.trim() || (reportType === 'ticker' ? !selectedTicker : !companyName.trim())}
                  className="flex-1"
                >
                  Create Report
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
