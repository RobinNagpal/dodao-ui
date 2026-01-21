'use client';

import React, { useState } from 'react';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { AnalysisTemplateReportWithRelations } from '../../api/analysis-template-reports/route';
import Link from 'next/link';
import AddEditAnalysisTemplateReportModal from './AddEditAnalysisTemplateReportModal';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';

export default function AnalysisTemplateReportPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<AnalysisTemplateReportWithRelations | null>(null);

  const {
    data: reports,
    loading: reportsLoading,
    reFetchData: refetchReports,
  } = useFetchData<AnalysisTemplateReportWithRelations[]>(
    `${getBaseUrl()}/api/analysis-template-reports`,
    { cache: 'no-cache' },
    'Failed to fetch analysis template reports'
  );

  const handleCreateNew = () => {
    setSelectedReport(null);
    setShowModal(true);
  };

  const handleEdit = (report: AnalysisTemplateReportWithRelations) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedReport(null);
  };

  const handleModalSuccess = () => {
    refetchReports();
  };

  if (reportsLoading) {
    return <FullPageLoader />;
  }

  return (
    <PageWrapper>
      <div className="text-color">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl heading-color">Analysis Template Reports</h1>
          <Button onClick={handleCreateNew} primary variant="contained">
            Create New Report
          </Button>
        </div>

        <p className="text-gray-600 mb-8">Create and manage analysis reports for tickers or companies using analysis templates.</p>

        {/* Reports List */}
        <div>
          {reports && reports.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-semibold mb-2">{report.analysisTemplate.name}</h3>
                  <p className="text-gray-600 mb-4">Prompt: {report.promptKey}</p>

                  <div className="mb-4">
                    <div className="text-sm text-gray-500">Created: {new Date(report.createdAt).toLocaleDateString()}</div>
                    <div className="text-sm text-blue-600 mt-1">Input: {JSON.stringify(report.inputObj)}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => handleEdit(report)} variant="outlined" className="flex-1">
                      Edit
                    </Button>
                    <Link href={`/admin-v1/analysis-template-report/${report.id}/generate`} className="flex-1">
                      <Button variant="contained" primary className="w-full">
                        Generate Analysis
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No analysis template reports created yet</p>
              <Button onClick={handleCreateNew} primary variant="contained">
                Create Your First Report
              </Button>
            </div>
          )}
        </div>

        {/* Create/Edit Report Modal */}
        <AddEditAnalysisTemplateReportModal isOpen={showModal} onClose={handleModalClose} onSuccess={handleModalSuccess} existingReport={selectedReport} />
      </div>
    </PageWrapper>
  );
}
