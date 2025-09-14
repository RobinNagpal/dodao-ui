'use client';

import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useState } from 'react';
import { Plus, Building2 } from 'lucide-react';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { TickerV1Industry } from '@prisma/client';

import CreateIndustryModal from './CreateIndustryModal';
import EditIndustryModal from './EditIndustryModal';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';

export default function IndustriesTab(): JSX.Element {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<TickerV1Industry | null>(null);
  const [deleteIndustryKey, setDeleteIndustryKey] = useState<string>('');

  const {
    data: industries,
    loading: loadingIndustries,
    reFetchData: refetchIndustries,
  } = useFetchData<TickerV1Industry[]>(`${getBaseUrl()}/api/industries`, {}, 'Failed to load industries');

  const { deleteData: deleteIndustry, loading: deletingIndustry } = useDeleteData<{ success: boolean }, never>({
    successMessage: 'Industry deleted successfully!',
    errorMessage: 'Failed to delete industry',
  });

  const handleEdit = (industry: TickerV1Industry) => {
    setSelectedIndustry(industry);
    setShowEditModal(true);
  };

  const handleDelete = (industryKey: string) => {
    setDeleteIndustryKey(industryKey);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    await deleteIndustry(`${getBaseUrl()}/api/industries/${deleteIndustryKey}`);
    await refetchIndustries();
    setShowDeleteConfirm(false);
  };

  return (
    <PageWrapper>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Industries</h2>
          <p className="text-emerald-600/70 mt-1">Manage your industry categories</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          <span className="font-medium">Add Industry</span>
        </button>
      </div>

      {loadingIndustries ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
          <span className="ml-3 text-emerald-600">Loading industries...</span>
        </div>
      ) : industries && industries.length > 0 ? (
        <div className="overflow-x-auto rounded-xl shadow border border-emerald-100">
          <table className="min-w-full divide-y divide-emerald-100">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Key</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Summary</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {industries.map((industry) => (
                <tr key={industry.industryKey}>
                  <td className="px-6 py-4 text-sm text-gray-700">{industry.industryKey}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{industry.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{industry.summary}</td>
                  <td className="px-6 py-4 flex space-x-3 justify-end">
                    <button onClick={() => handleEdit(industry)} className="text-emerald-600 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(industry.industryKey)} className="text-red-500 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20">
          <Building2 className="mx-auto h-12 w-12 text-emerald-400 mb-4" />
          <h3 className="text-lg font-bold text-gray-800">No industries found</h3>
          <p className="text-gray-600 mb-6">Start by adding your first industry.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200"
          >
            <Plus className="inline mr-2 h-4 w-4" />
            Add Industry
          </button>
        </div>
      )}

      <CreateIndustryModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={refetchIndustries} />

      {selectedIndustry && (
        <EditIndustryModal
          isOpen={showEditModal}
          onClose={() => {
            setSelectedIndustry(null);
            setShowEditModal(false);
          }}
          onSuccess={refetchIndustries}
          industry={selectedIndustry}
        />
      )}

      <ConfirmationModal
        open={showDeleteConfirm}
        showSemiTransparentBg={true}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        confirming={deletingIndustry}
        title="Delete Industry"
        confirmationText="Are you sure you want to delete this industry? This action cannot be undone."
        askForTextInput={false}
      />
    </PageWrapper>
  );
}
