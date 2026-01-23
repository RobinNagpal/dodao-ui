'use client';

import React, { useState } from 'react';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { AnalysisTemplateReportWithRelations } from '../../api/analysis-template-reports/route';
import Link from 'next/link';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import AddEditAnalysisTemplateReportModal from '@/components/analysis-templates/AddEditAnalysisTemplateReportModal';
import AnalysisTemplateActions from '@/components/analysis-templates/AnalysisTemplateActions';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';

export default function AnalysisTemplateReportPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<AnalysisTemplateReportWithRelations | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<AnalysisTemplateReportWithRelations | null>(null);

  const {
    data: reports,
    loading: reportsLoading,
    reFetchData: refetchReports,
  } = useFetchData<AnalysisTemplateReportWithRelations[]>(
    `${getBaseUrl()}/api/analysis-template-reports`,
    { cache: 'no-cache' },
    'Failed to fetch analysis template reports'
  );

  const { deleteData, loading: deleting } = useDeleteData<{ success: boolean }, any>({
    errorMessage: 'Failed to delete analysis template report',
    successMessage: 'Analysis template report deleted successfully',
  });

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

  const handleDeleteReport = (report: AnalysisTemplateReportWithRelations) => {
    setReportToDelete(report);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setReportToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!reportToDelete) return;

    try {
      await deleteData(`${getBaseUrl()}/api/analysis-template-reports/${reportToDelete.id}`);
      refetchReports();
      handleCloseDeleteModal();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  if (reportsLoading) {
    return <FullPageLoader />;
  }

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        <div className="pt-2 pb-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <ChartBarIcon className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-white">Analysis Template Reports</h1>
              <div className="ml-auto">
                <Button onClick={handleCreateNew} primary variant="contained">
                  Create New Report
                </Button>
              </div>
            </div>
            <p className="text-gray-400 text-base ml-11">
              Discover {reports?.length || 0} analysis report{(reports?.length || 0) !== 1 ? 's' : ''} and generate detailed analysis
            </p>
          </div>

          {/* Reports List */}
          <div>
            {reports && reports.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reports.map((report) => (
                  <Link key={report.id} href={`/admin-v1/analysis-template-report/${report.id}`}>
                    <div className="bg-gray-900 rounded-2xl overflow-hidden transition-all border border-gray-800 hover:border-blue-500 relative group cursor-pointer">
                      <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
                        <AnalysisTemplateActions
                          onEdit={() => handleEdit(report)}
                          onGenerate={() => (window.location.href = `/admin-v1/analysis-template-report/${report.id}/generate`)}
                          onDelete={() => handleDeleteReport(report)}
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 mb-2 pr-12">{report.reportName}</h3>
                        <p className="text-blue-400 text-sm font-medium mb-3">Prompt: {report.promptKey}</p>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center text-sm">
                            <span className="text-gray-400">Analysis Template: {report.analysisTemplate.name}</span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-700 mt-4">
                          <span className="text-blue-400 group-hover:text-blue-300 transition-color text-sm font-medium">See Report →</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <ChartBarIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No analysis reports yet</h3>
                <p className="text-gray-400 mb-4">You haven’t created any analysis template reports yet.</p>
                <Button onClick={handleCreateNew} primary variant="contained">
                  Create Your First Report
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Create/Edit Report Modal */}
        <AddEditAnalysisTemplateReportModal isOpen={showModal} onClose={handleModalClose} onSuccess={handleModalSuccess} existingReport={selectedReport} />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          open={deleteModalOpen}
          onClose={handleCloseDeleteModal}
          onDelete={handleConfirmDelete}
          title="Delete Analysis Template Report"
          deleting={deleting}
          deleteButtonText="Delete Report"
          confirmationText="DELETE"
        />
      </div>
    </PageWrapper>
  );
}
