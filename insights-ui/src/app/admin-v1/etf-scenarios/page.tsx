'use client';

import AdminNav from '@/app/admin-v1/AdminNav';
import type { EtfScenarioListingItem, EtfScenarioListingResponse } from '@/app/api/[spaceId]/etf-scenarios/listing/route';
import Button from '@dodao/web-core/components/core/buttons/Button';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Download, Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import DeleteConfirmationModal from '@/app/admin-v1/industry-management/DeleteConfirmationModal';
import ImportEtfScenariosModal from './ImportEtfScenariosModal';
import ManageLinksModal from './ManageLinksModal';
import UpsertEtfScenarioModal from './UpsertEtfScenarioModal';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';

const OUTLOOK_BADGE: Record<string, string> = {
  HIGH: 'bg-red-500/15 text-red-300 border-red-500/40',
  MEDIUM: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  LOW: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  IN_PROGRESS: 'bg-gray-500/15 text-gray-300 border-gray-500/40',
};

export default function EtfScenariosAdminPage(): JSX.Element {
  const [showUpsert, setShowUpsert] = useState<boolean>(false);
  const [selected, setSelected] = useState<EtfScenarioListingItem | null>(null);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<EtfScenarioListingItem | null>(null);
  const [showImport, setShowImport] = useState<boolean>(false);
  const [showLinks, setShowLinks] = useState<boolean>(false);
  const [linksTarget, setLinksTarget] = useState<EtfScenarioListingItem | null>(null);

  const listingUrl = `${getBaseUrl()}/api/${KoalaGainsSpaceId}/etf-scenarios/listing?pageSize=200&includeArchived=true`;
  const {
    data: listing,
    loading: loadingList,
    reFetchData: refetchList,
  } = useFetchData<EtfScenarioListingResponse>(listingUrl, {}, 'Failed to load ETF scenarios');

  const { deleteData: deleteScenario, loading: deleting } = useDeleteData<{ success: boolean }, never>({
    successMessage: 'Scenario deleted successfully!',
    errorMessage: 'Failed to delete scenario',
  });

  const handleEdit = (scenario: EtfScenarioListingItem): void => {
    setSelected(scenario);
    setShowUpsert(true);
  };

  const handleManageLinks = (scenario: EtfScenarioListingItem): void => {
    setLinksTarget(scenario);
    setShowLinks(true);
  };

  const handleDeleteClick = (scenario: EtfScenarioListingItem): void => {
    setDeleteTarget(scenario);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    await deleteScenario(`${getBaseUrl()}/api/etf-scenarios/${deleteTarget.id}`);
    await refetchList();
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  const scenarios = listing?.scenarios ?? [];

  return (
    <PageWrapper>
      <AdminNav />

      <div className="bg-gray-800 -mx-6 px-6 py-6 mb-6 border-b border-gray-700/60">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">ETF Scenarios</h1>
            <p className="text-gray-300 mt-1">Manage the dated playbook of sector / asset-class scenarios.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outlined" onClick={() => refetchList()}>
              Refresh
            </Button>
            <Button variant="outlined" onClick={() => setShowImport(true)}>
              <Download className="h-4 w-4 mr-1" />
              Import from doc
            </Button>
            <Button
              onClick={() => {
                setSelected(null);
                setShowUpsert(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Scenario
            </Button>
          </div>
        </div>
      </div>

      {loadingList ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400" />
          <span className="ml-3 text-indigo-300">Loading…</span>
        </div>
      ) : scenarios.length === 0 ? (
        <div className="rounded-lg border border-gray-700/50 bg-gray-900/40 p-8 text-center text-gray-400">
          No scenarios yet. Use <strong>Import from doc</strong> to bulk-load or <strong>Add Scenario</strong> to create one manually.
        </div>
      ) : (
        <div className="rounded-lg border border-gray-700/50 bg-gray-900/40 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-800/60 text-gray-300">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Outlook</th>
                <th className="px-3 py-2">As of</th>
                <th className="px-3 py-2">Archived</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s) => (
                <tr key={s.id} className="border-t border-gray-700/50 hover:bg-gray-800/40">
                  <td className="px-3 py-2 text-gray-400">{s.scenarioNumber}</td>
                  <td className="px-3 py-2 text-white">
                    <Link href={`/etf-scenarios/${s.slug}`} className="hover:text-indigo-300" target="_blank">
                      {s.title}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-block border rounded-full px-2 py-0.5 text-xs ${OUTLOOK_BADGE[s.outlookBucket] ?? ''}`}>{s.outlookBucket}</span>
                  </td>
                  <td className="px-3 py-2 text-gray-400">{s.outlookAsOfDate.slice(0, 10)}</td>
                  <td className="px-3 py-2 text-gray-400">{s.archived ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outlined" onClick={() => handleManageLinks(s)}>
                        Links
                      </Button>
                      <Button variant="outlined" onClick={() => handleEdit(s)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outlined" onClick={() => handleDeleteClick(s)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <UpsertEtfScenarioModal
        isOpen={showUpsert}
        onClose={() => {
          setSelected(null);
          setShowUpsert(false);
        }}
        onSuccess={() => refetchList()}
        scenarioId={selected?.id}
      />

      <ManageLinksModal
        isOpen={showLinks}
        onClose={() => {
          setLinksTarget(null);
          setShowLinks(false);
        }}
        onSuccess={() => refetchList()}
        scenarioId={linksTarget?.id}
        scenarioTitle={linksTarget?.title}
      />

      <ImportEtfScenariosModal isOpen={showImport} onClose={() => setShowImport(false)} onSuccess={() => refetchList()} />

      <DeleteConfirmationModal
        title="Delete Scenario"
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDelete={handleConfirmDelete}
        deleting={deleting}
        deleteButtonText="Delete Scenario"
        confirmationText="Archive Me"
      />
    </PageWrapper>
  );
}
