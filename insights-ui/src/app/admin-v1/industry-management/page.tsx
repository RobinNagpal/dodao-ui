'use client';

import AdminNav from '@/app/admin-v1/AdminNav';
import type { IndustryWithSubIndustriesAndCounts } from '@/types/ticker-typesv1';
import Button from '@dodao/web-core/components/core/buttons/Button';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import type { TickerV1Industry, TickerV1SubIndustry } from '@prisma/client';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import DeleteConfirmationModal from './DeleteConfirmationModal';

import IndustryTree, { type IndustryAction, type SubIndustryAction } from './IndustryTree';
import UpsertIndustryModal from './UpsertIndustryModal';
import UpsertSubIndustryModal from './UpsertSubIndustryModal';

type DeleteKind = 'industry' | 'subIndustry';

export default function IndustryManagementPage(): JSX.Element {
  // Modal state
  const [showUpsertIndustry, setShowUpsertIndustry] = useState<boolean>(false);
  const [showUpsertSubIndustry, setShowUpsertSubIndustry] = useState<boolean>(false);
  const [selectedIndustry, setSelectedIndustry] = useState<TickerV1Industry | null>(null);
  const [selectedSubIndustry, setSelectedSubIndustry] = useState<TickerV1SubIndustry | null>(null);

  // Delete confirm state
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [deleteKind, setDeleteKind] = useState<DeleteKind>('industry');
  const [deleteKey, setDeleteKey] = useState<string>('');

  // Data (now includes counts)
  const {
    data: industries,
    loading: loadingIndustries,
    reFetchData: refetchIndustries,
  } = useFetchData<IndustryWithSubIndustriesAndCounts[]>(`${getBaseUrl()}/api/industries`, {}, 'Failed to load industries');

  // Delete hooks
  const { deleteData: deleteIndustry, loading: deletingIndustry } = useDeleteData<{ success: boolean }, never>({
    successMessage: 'Industry deleted successfully!',
    errorMessage: 'Failed to delete industry',
  });
  const { deleteData: deleteSubIndustry, loading: deletingSubIndustry } = useDeleteData<{ success: boolean }, never>({
    successMessage: 'Sub-industry deleted successfully!',
    errorMessage: 'Failed to delete sub-industry',
  });

  // Handlers triggered from the tree view
  const onIndustryAction = (action: IndustryAction, industry: TickerV1Industry): void => {
    switch (action) {
      case 'addSub':
        setSelectedIndustry(industry);
        setSelectedSubIndustry(null);
        setShowUpsertSubIndustry(true);
        break;
      case 'edit':
        setSelectedIndustry(industry);
        setShowUpsertIndustry(true);
        break;
      case 'delete':
        setDeleteKind('industry');
        setDeleteKey(industry.industryKey);
        setDeleteOpen(true);
        break;
    }
  };

  const onSubIndustryAction = (action: SubIndustryAction, sub: TickerV1SubIndustry): void => {
    switch (action) {
      case 'edit':
        setSelectedSubIndustry(sub);
        setShowUpsertSubIndustry(true);
        break;
      case 'delete':
        setDeleteKind('subIndustry');
        setDeleteKey(sub.subIndustryKey);
        setDeleteOpen(true);
        break;
    }
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (deleteKind === 'industry') {
      await deleteIndustry(`${getBaseUrl()}/api/industries/${deleteKey}`);
      await refetchIndustries();
    } else {
      await deleteSubIndustry(`${getBaseUrl()}/api/sub-industries/${deleteKey}`);
      await refetchIndustries();
    }
    setDeleteOpen(false);
  };

  const handleRefreshAll = (): void => {
    refetchIndustries();
  };

  // Ensure stable expanded map on first load (optional; done inside IndustryTree as well)
  useEffect(() => {}, [industries]);

  const loading: boolean = loadingIndustries;

  return (
    <PageWrapper>
      <AdminNav />

      <div className="bg-gray-800 -mx-6 px-6 py-6 mb-6 border-b border-gray-700/60">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Industry Management</h1>
            <p className="text-gray-300 mt-1">Tree view of industries and sub-industries.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outlined" onClick={handleRefreshAll}>
              Refresh
            </Button>
            <Button
              onClick={(): void => {
                setSelectedIndustry(null);
                setShowUpsertIndustry(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Industry
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
          <IndustryTree industries={industries ?? []} onIndustryAction={onIndustryAction} onSubIndustryAction={onSubIndustryAction} />
          {(!industries || industries.length === 0) && (
            <div className="p-8 text-center text-gray-400">No industries yet. Use “Add Industry” to create one.</div>
          )}
        </div>
      )}

      {/* Modals */}
      <UpsertIndustryModal
        isOpen={showUpsertIndustry}
        onClose={(): void => {
          setSelectedIndustry(null);
          setShowUpsertIndustry(false);
        }}
        onSuccess={handleRefreshAll}
        industry={selectedIndustry ?? undefined}
      />

      <UpsertSubIndustryModal
        isOpen={showUpsertSubIndustry}
        onClose={(): void => {
          setSelectedSubIndustry(null);
          setSelectedIndustry(null);
          setShowUpsertSubIndustry(false);
        }}
        onSuccess={handleRefreshAll}
        subIndustry={selectedSubIndustry ?? undefined}
        preselectedIndustryKey={selectedIndustry?.industryKey}
      />

      <DeleteConfirmationModal
        title={`Delete ${deleteKind === 'industry' ? 'Industry' : 'Sub-industry'}`}
        open={deleteOpen}
        onClose={(): void => setDeleteOpen(false)}
        onDelete={handleConfirmDelete}
        deleting={deletingIndustry || deletingSubIndustry}
        deleteButtonText={`Delete ${deleteKind === 'industry' ? 'Industry' : 'Sub-industry'}`}
        confirmationText="Archive Me"
      />
    </PageWrapper>
  );
}
