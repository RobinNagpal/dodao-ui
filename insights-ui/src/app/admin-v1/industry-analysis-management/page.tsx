'use client';

import AdminNav from '@/app/admin-v1/AdminNav';
import Button from '@dodao/web-core/components/core/buttons/Button';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import type { TickerV1IndustryAnalysis, IndustryBuildingBlockAnalysis } from '@prisma/client';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import DeleteConfirmationModal from '../industry-management/DeleteConfirmationModal';

import IndustryAnalysisTree, { type IndustryAnalysisAction, type SubIndustryAnalysisAction } from './IndustryAnalysisTree';
import UpsertIndustryAnalysisModal from './UpsertIndustryAnalysisModal';
import UpsertSubIndustryAnalysisModal from './UpsertSubIndustryAnalysisModal';

type DeleteKind = 'industryAnalysis' | 'buildingBlockAnalysis';

export interface IndustryAnalysisWithSubAnalyses extends TickerV1IndustryAnalysis {
  subIndustryAnalyses: IndustryBuildingBlockAnalysis[];
  industry: {
    name: string;
    industryKey: string;
  };
}

export default function IndustryAnalysisManagementPage(): JSX.Element {
  // Modal state
  const [showUpsertIndustryAnalysis, setShowUpsertIndustryAnalysis] = useState<boolean>(false);
  const [showUpsertSubIndustryAnalysis, setShowUpsertSubIndustryAnalysis] = useState<boolean>(false);
  const [selectedIndustryAnalysis, setSelectedIndustryAnalysis] = useState<IndustryAnalysisWithSubAnalyses | null>(null);
  const [selectedSubIndustryAnalysis, setSelectedSubIndustryAnalysis] = useState<IndustryBuildingBlockAnalysis | null>(null);

  // Delete confirm state
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [deleteKind, setDeleteKind] = useState<DeleteKind>('industryAnalysis');
  const [deleteId, setDeleteId] = useState<string>('');

  // Data
  const {
    data: industryAnalyses,
    loading: loadingIndustryAnalyses,
    reFetchData: refetchIndustryAnalyses,
  } = useFetchData<IndustryAnalysisWithSubAnalyses[]>(`${getBaseUrl()}/api/industry-analysis`, {}, 'Failed to load industry analyses');

  // Delete hooks
  const { deleteData: deleteIndustryAnalysis, loading: deletingIndustryAnalysis } = useDeleteData<{ success: boolean }, never>({
    successMessage: 'Industry analysis deleted successfully!',
    errorMessage: 'Failed to delete industry analysis',
  });
  const { deleteData: deleteSubIndustryAnalysis, loading: deletingSubIndustryAnalysis } = useDeleteData<{ success: boolean }, never>({
    successMessage: 'Building block analysis deleted successfully!',
    errorMessage: 'Failed to delete building block analysis',
  });

  // Handlers triggered from the tree view
  const onIndustryAnalysisAction = (action: IndustryAnalysisAction, industryAnalysis: IndustryAnalysisWithSubAnalyses): void => {
    switch (action) {
      case 'addSub':
        setSelectedIndustryAnalysis(industryAnalysis);
        setSelectedSubIndustryAnalysis(null);
        setShowUpsertSubIndustryAnalysis(true);
        break;
      case 'edit':
        setSelectedIndustryAnalysis(industryAnalysis);
        setShowUpsertIndustryAnalysis(true);
        break;
      case 'delete':
        setDeleteKind('industryAnalysis');
        setDeleteId(industryAnalysis.id);
        setDeleteOpen(true);
        break;
    }
  };

  const onSubIndustryAnalysisAction = (action: SubIndustryAnalysisAction, sub: IndustryBuildingBlockAnalysis): void => {
    switch (action) {
      case 'edit':
        setSelectedSubIndustryAnalysis(sub);
        setShowUpsertSubIndustryAnalysis(true);
        break;
      case 'delete':
        setDeleteKind('buildingBlockAnalysis');
        setDeleteId(sub.id);
        setDeleteOpen(true);
        break;
    }
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (deleteKind === 'industryAnalysis') {
      await deleteIndustryAnalysis(`${getBaseUrl()}/api/industry-analysis/${deleteId}`);
      await refetchIndustryAnalyses();
    } else {
      await deleteSubIndustryAnalysis(`${getBaseUrl()}/api/sub-industry-analysis/${deleteId}`);
      await refetchIndustryAnalyses();
    }
    setDeleteOpen(false);
  };

  const handleRefreshAll = (): void => {
    refetchIndustryAnalyses();
  };

  // Ensure stable expanded map on first load (optional; done inside IndustryAnalysisTree as well)
  useEffect(() => {}, [industryAnalyses]);

  const loading: boolean = loadingIndustryAnalyses;

  return (
    <PageWrapper>
      <AdminNav />

      <div className="bg-gray-800 -mx-6 px-6 py-6 mb-6 border-b border-gray-700/60">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Industry Analysis Management</h1>
            <p className="text-gray-300 mt-1">Tree view of industry analyses and sub-industry analyses.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outlined" onClick={handleRefreshAll}>
              Refresh
            </Button>
            <Button
              onClick={(): void => {
                setSelectedIndustryAnalysis(null);
                setShowUpsertIndustryAnalysis(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Industry Analysis
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400" />
          <span className="ml-3 text-indigo-300">Loading…</span>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-700/50 bg-gray-900/40">
          <IndustryAnalysisTree
            industryAnalyses={industryAnalyses ?? []}
            onIndustryAnalysisAction={onIndustryAnalysisAction}
            onSubIndustryAnalysisAction={onSubIndustryAnalysisAction}
          />
          {(!industryAnalyses || industryAnalyses.length === 0) && (
            <div className="p-8 text-center text-gray-400">No industry analyses yet. Use Add Industry Analysis to create one.</div>
          )}
        </div>
      )}

      {/* Modals */}
      <UpsertIndustryAnalysisModal
        isOpen={showUpsertIndustryAnalysis}
        onClose={(): void => {
          setSelectedIndustryAnalysis(null);
          setShowUpsertIndustryAnalysis(false);
        }}
        onSuccess={handleRefreshAll}
        industryAnalysis={selectedIndustryAnalysis ?? undefined}
      />

      <UpsertSubIndustryAnalysisModal
        isOpen={showUpsertSubIndustryAnalysis}
        onClose={(): void => {
          setSelectedSubIndustryAnalysis(null);
          setSelectedIndustryAnalysis(null);
          setShowUpsertSubIndustryAnalysis(false);
        }}
        onSuccess={handleRefreshAll}
        subIndustryAnalysis={selectedSubIndustryAnalysis ?? undefined}
        preselectedIndustryAnalysisId={selectedIndustryAnalysis?.id}
      />

      <DeleteConfirmationModal
        title={`Delete ${deleteKind === 'industryAnalysis' ? 'Industry Analysis' : 'Building Block Analysis'}`}
        open={deleteOpen}
        onClose={(): void => setDeleteOpen(false)}
        onDelete={handleConfirmDelete}
        deleting={deletingIndustryAnalysis || deletingSubIndustryAnalysis}
        deleteButtonText={`Delete ${deleteKind === 'industryAnalysis' ? 'Industry Analysis' : 'Building Block Analysis'}`}
        confirmationText="Delete Me"
      />
    </PageWrapper>
  );
}
