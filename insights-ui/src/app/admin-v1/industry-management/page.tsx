'use client';

import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useState, useEffect, useMemo } from 'react';
import { Plus, Building2, Tag, Filter, ChevronDown, ChevronUp, Edit, Trash2, PlusCircle } from 'lucide-react';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { TickerV1Industry, TickerV1SubIndustry } from '@prisma/client';
import UpsertIndustryModal from './UpsertIndustryModal';
import UpsertSubIndustryModal from './UpsertSubIndustryModal';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Checkboxes, { CheckboxItem } from '@dodao/web-core/components/core/checkboxes/Checkboxes';

type TabValue = 'all' | 'industries' | 'subIndustries';
const TAB_VALUES = ['all', 'industries', 'subIndustries'] as const;

function isTabValue(value: string): value is TabValue {
  return (TAB_VALUES as readonly string[]).includes(value);
}

export default function IndustryManagementPage(): JSX.Element {
  // State for modals
  const [showUpsertIndustryModal, setShowUpsertIndustryModal] = useState<boolean>(false);
  const [showUpsertSubIndustryModal, setShowUpsertSubIndustryModal] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [selectedIndustry, setSelectedIndustry] = useState<TickerV1Industry | null>(null);
  const [selectedSubIndustry, setSelectedSubIndustry] = useState<TickerV1SubIndustry | null>(null);
  const [deleteItemKey, setDeleteItemKey] = useState<string>('');
  const [deleteItemType, setDeleteItemType] = useState<'industry' | 'subIndustry'>('industry');
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [expandedIndustries, setExpandedIndustries] = useState<Record<string, boolean>>({});
  const [showArchived, setShowArchived] = useState<boolean>(false);

  // Fetch data
  const {
    data: industries,
    loading: loadingIndustries,
    reFetchData: refetchIndustries,
  } = useFetchData<TickerV1Industry[]>(`${getBaseUrl()}/api/industries${showArchived ? '?archived=true' : ''}`, {}, 'Failed to load industries');

  const {
    data: subIndustries,
    loading: loadingSubIndustries,
    reFetchData: refetchSubIndustries,
  } = useFetchData<TickerV1SubIndustry[]>(`${getBaseUrl()}/api/sub-industries`, {}, 'Failed to load sub-industries');

  // Delete handlers
  const { deleteData: deleteIndustry, loading: deletingIndustry } = useDeleteData<{ success: boolean }, never>({
    successMessage: 'Industry deleted successfully!',
    errorMessage: 'Failed to delete industry',
  });

  const { deleteData: deleteSubIndustry, loading: deletingSubIndustry } = useDeleteData<{ success: boolean }, never>({
    successMessage: 'Sub-industry deleted successfully!',
    errorMessage: 'Failed to delete sub-industry',
  });

  // Initialize expanded state for industries
  useEffect((): void => {
    if (industries) {
      const expanded: Record<string, boolean> = {};
      industries.forEach((industry) => {
        expanded[industry.industryKey] = expanded[industry.industryKey] || false;
      });
      setExpandedIndustries(expanded);
    }
  }, [industries]);

  // Handlers
  const handleEditIndustry = (industry: TickerV1Industry): void => {
    setSelectedIndustry(industry);
    setShowUpsertIndustryModal(true);
  };

  const handleEditSubIndustry = (subIndustry: TickerV1SubIndustry): void => {
    setSelectedSubIndustry(subIndustry);
    setShowUpsertSubIndustryModal(true);
  };

  const handleAddSubIndustry = (industryKey: string): void => {
    setShowUpsertSubIndustryModal(true);
    setSelectedSubIndustry(null);
    setSelectedIndustry(industries?.find((i) => i.industryKey === industryKey) ?? null);
  };

  const handleDeleteIndustry = (industryKey: string): void => {
    setDeleteItemKey(industryKey);
    setDeleteItemType('industry');
    setShowDeleteConfirm(true);
  };

  const handleDeleteSubIndustry = (subIndustryKey: string): void => {
    setDeleteItemKey(subIndustryKey);
    setDeleteItemType('subIndustry');
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (deleteItemType === 'industry') {
      await deleteIndustry(`${getBaseUrl()}/api/industries/${deleteItemKey}`);
      await refetchIndustries();
    } else {
      await deleteSubIndustry(`${getBaseUrl()}/api/sub-industries/${deleteItemKey}`);
      await refetchSubIndustries();
    }
    setShowDeleteConfirm(false);
  };

  const toggleIndustryExpanded = (industryKey: string): void => {
    setExpandedIndustries((prev) => ({
      ...prev,
      [industryKey]: !prev[industryKey],
    }));
  };

  const handleRefresh = (): void => {
    refetchIndustries();
    refetchSubIndustries();
  };

  // Filter sub-industries by industry
  const getSubIndustriesForIndustry = (industryKey: string): TickerV1SubIndustry[] => {
    return subIndustries?.filter((si) => si.industryKey === industryKey) ?? [];
  };

  // Single-item checkbox group for "Show Archived"
  const archivedItems: CheckboxItem[] = useMemo<CheckboxItem[]>(() => [{ id: 'showArchived', name: 'showArchived', label: 'Show Archived' }], []);
  const handleShowArchivedChange = (selectedIds: string[]): void => {
    setShowArchived(selectedIds.includes('showArchived'));
  };

  // Render functions
  const renderIndustryRow = (industry: TickerV1Industry): JSX.Element => {
    const isExpanded = expandedIndustries[industry.industryKey];
    const industrySubIndustries = getSubIndustriesForIndustry(industry.industryKey);

    return (
      <div key={industry.industryKey} className="mb-4 rounded-xl overflow-hidden shadow-sm border border-gray-600/40 bg-gray-800/40 backdrop-blur-sm">
        <div className="p-4 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building2 className="h-5 w-5 text-indigo-400" />
              <div>
                <h3 className="font-medium text-white">{industry.name}</h3>
                <p className="text-sm text-gray-400">{industry.industryKey}</p>
              </div>
              {industry.archived && (
                <span className="px-2 py-1 text-xs font-medium rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300">Archived</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={(): void => handleAddSubIndustry(industry.industryKey)}
                className="p-1 text-indigo-400 hover:text-indigo-300"
                title="Add Sub-industry"
              >
                <PlusCircle className="h-5 w-5" />
              </button>
              <button onClick={(): void => handleEditIndustry(industry)} className="p-1 text-indigo-400 hover:text-indigo-300" title="Edit Industry">
                <Edit className="h-5 w-5" />
              </button>
              <button onClick={(): void => handleDeleteIndustry(industry.industryKey)} className="p-1 text-red-400 hover:text-red-300" title="Delete Industry">
                <Trash2 className="h-5 w-5" />
              </button>
              <button
                onClick={(): void => toggleIndustryExpanded(industry.industryKey)}
                className="p-1 text-indigo-400 hover:text-indigo-300 ml-2"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>
          </div>
          {isExpanded && (
            <div className="mt-2">
              <p className="text-sm text-gray-300">{industry.summary}</p>
            </div>
          )}
        </div>

        {isExpanded && industrySubIndustries.length > 0 && (
          <div className="bg-transparent">
            <div className="px-4 py-2 bg-gray-800/40 border-b border-gray-700/50">
              <h4 className="text-sm font-medium text-indigo-300">Sub-industries</h4>
            </div>
            <div className="divide-y divide-gray-700/50">
              {industrySubIndustries.map((subIndustry) => (
                <div key={subIndustry.subIndustryKey} className="px-4 py-3 hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Tag className="h-4 w-4 text-indigo-400" />
                      <div>
                        <h4 className="font-medium text-gray-100">{subIndustry.name}</h4>
                        <p className="text-xs text-gray-400">{subIndustry.subIndustryKey}</p>
                      </div>
                      {subIndustry.archived && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300">Archived</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(): void => handleEditSubIndustry(subIndustry)}
                        className="p-1 text-indigo-400 hover:text-indigo-300"
                        title="Edit Sub-industry"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(): void => handleDeleteSubIndustry(subIndustry.subIndustryKey)}
                        className="p-1 text-red-400 hover:text-red-300"
                        title="Delete Sub-industry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isExpanded && industrySubIndustries.length === 0 && (
          <div className="bg-gray-800/30 p-4 text-center text-gray-400 text-sm">No sub-industries found for this industry.</div>
        )}
      </div>
    );
  };

  const renderSubIndustryTable = (): JSX.Element => {
    return (
      <div className="overflow-x-auto rounded-xl shadow border border-gray-600/40 bg-gray-800/40 backdrop-blur-sm">
        <table className="min-w-full divide-y divide-gray-700/50">
          <thead className="bg-gray-800/60">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-300 uppercase tracking-wider">Key</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-300 uppercase tracking-wider">Industry</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {subIndustries?.map((subIndustry) => {
              const parentIndustry = industries?.find((i) => i.industryKey === subIndustry.industryKey);
              return (
                <tr key={subIndustry.subIndustryKey} className="hover:bg-gray-800/50">
                  <td className="px-6 py-4 text-sm text-gray-300">{subIndustry.subIndustryKey}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{subIndustry.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{parentIndustry?.name ?? subIndustry.industryKey}</td>
                  <td className="px-6 py-4 text-sm">
                    {subIndustry.archived ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300">Archived</span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full border border-green-500/30 bg-green-500/10 text-green-300">Active</span>
                    )}
                  </td>
                  <td className="px-6 py-4 flex space-x-3 justify-end">
                    <button onClick={(): void => handleEditSubIndustry(subIndustry)} className="text-indigo-300 hover:text-indigo-200">
                      Edit
                    </button>
                    <button onClick={(): void => handleDeleteSubIndustry(subIndustry.subIndustryKey)} className="text-red-400 hover:text-red-300">
                      Delete
                    </button>
                  </td>
                </tr>
              );
            }) ?? null}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <PageWrapper>
      {/* Header to match Hero */}
      <div className="bg-gray-800 -mx-6 px-6 py-8 mb-8 border-b border-gray-700/60">
        <h1 className="text-3xl font-bold text-white">Industry Management</h1>
        <p className="text-gray-300 mt-2">Manage industries and sub-industries in one place</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Tabs
            value={activeTab}
            onValueChange={(value: string): void => {
              if (isTabValue(value)) setActiveTab(value);
            }}
          >
            <TabsList className="bg-gray-800/40 border border-gray-600/40 backdrop-blur-sm">
              <TabsTrigger value="all" className="text-gray-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                All
              </TabsTrigger>
              <TabsTrigger value="industries" className="text-gray-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                Industries
              </TabsTrigger>
              <TabsTrigger value="subIndustries" className="text-gray-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                Sub-industries
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="ml-4">
            <Checkboxes items={archivedItems} selectedItemIds={showArchived ? ['showArchived'] : []} onChange={handleShowArchivedChange} />
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={handleRefresh}
            variant="outlined"
            className="flex items-center space-x-1 border-indigo-600 text-indigo-300 hover:bg-indigo-600 hover:text-white"
          >
            <Filter className="h-4 w-4 mr-1" />
            Refresh
          </Button>

          {(activeTab === 'all' || activeTab === 'industries') && (
            <Button
              onClick={(): void => {
                setSelectedIndustry(null);
                setShowUpsertIndustryModal(true);
              }}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Industry
            </Button>
          )}

          {(activeTab === 'all' || activeTab === 'subIndustries') && (
            <Button
              onClick={(): void => {
                setSelectedSubIndustry(null);
                setShowUpsertSubIndustryModal(true);
              }}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Sub-industry
            </Button>
          )}
        </div>
      </div>

      {loadingIndustries || loadingSubIndustries ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400"></div>
          <span className="ml-3 text-indigo-300">Loading data...</span>
        </div>
      ) : (
        <>
          {(activeTab === 'all' || activeTab === 'industries') && (
            <div className="mb-8">
              {activeTab === 'industries' && <h2 className="text-xl font-bold text-white mb-4">Industries</h2>}

              {industries && industries.length > 0 ? (
                <div className="space-y-4">{industries.map((industry) => renderIndustryRow(industry))}</div>
              ) : (
                <div className="text-center py-20 rounded-xl shadow-sm border border-gray-600/40 bg-gray-800/40 backdrop-blur-sm">
                  <Building2 className="mx-auto h-12 w-12 text-indigo-400 mb-4" />
                  <h3 className="text-lg font-bold text-white">No industries found</h3>
                  <p className="text-gray-300 mb-6">Start by adding your first industry.</p>
                  <Button
                    onClick={(): void => {
                      setSelectedIndustry(null);
                      setShowUpsertIndustryModal(true);
                    }}
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Industry
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'subIndustries' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Sub-industries</h2>

              {subIndustries && subIndustries.length > 0 ? (
                renderSubIndustryTable()
              ) : (
                <div className="text-center py-20 rounded-xl shadow-sm border border-gray-600/40 bg-gray-800/40 backdrop-blur-sm">
                  <Tag className="mx-auto h-12 w-12 text-indigo-400 mb-4" />
                  <h3 className="text-lg font-bold text-white">No sub-industries found</h3>
                  <p className="text-gray-300 mb-6">Start by adding your first sub-industry.</p>
                  <Button
                    onClick={(): void => {
                      setSelectedSubIndustry(null);
                      setShowUpsertSubIndustryModal(true);
                    }}
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Sub-industry
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <UpsertIndustryModal
        isOpen={showUpsertIndustryModal}
        onClose={(): void => {
          setSelectedIndustry(null);
          setShowUpsertIndustryModal(false);
        }}
        onSuccess={(): void => {
          handleRefresh();
        }}
        industry={selectedIndustry ?? undefined}
      />

      <UpsertSubIndustryModal
        isOpen={showUpsertSubIndustryModal}
        onClose={(): void => {
          setSelectedSubIndustry(null);
          setShowUpsertSubIndustryModal(false);
        }}
        onSuccess={(): void => {
          handleRefresh();
        }}
        subIndustry={selectedSubIndustry ?? undefined}
        preselectedIndustryKey={selectedIndustry?.industryKey}
      />

      <ConfirmationModal
        open={showDeleteConfirm}
        showSemiTransparentBg={true}
        onClose={(): void => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        confirming={deletingIndustry || deletingSubIndustry}
        title={`Delete ${deleteItemType === 'industry' ? 'Industry' : 'Sub-industry'}`}
        confirmationText={`Are you sure you want to delete this ${deleteItemType === 'industry' ? 'industry' : 'sub-industry'}? This action cannot be undone.`}
        askForTextInput={false}
      />
    </PageWrapper>
  );
}
