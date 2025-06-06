'use client';

import {
  AlertActionsCell,
  StatusBadge,
  AssetsCell,
  ChainsCell,
  ConditionsCell,
  CreateComparisonModals,
  DeleteAlertModal,
  DeliveryChannelCell,
  PlatformsCell,
} from '@/components/alerts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ChainSelect from '@/components/alerts/core/ChainSelect';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { type Alert, frequencyOptions } from '@/types/alerts';
import { formatWalletAddress } from '@/utils/getFormattedWalletAddress';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ArrowLeftRight, Info, Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { useSession } from 'next-auth/react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { toSentenceCase } from '@/utils/getSentenceCase';
import AssetChainPairCell from '@/components/alerts/core/AssetChainPairCell';

export default function CompareCompoundPage() {
  const { data } = useSession();
  const session = data as DoDAOSession;

  const baseUrl = getBaseUrl();
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [actionTypeFilter, setActionTypeFilter] = useState('all');
  const [chainFilter, setChainFilter] = useState('all');

  const [alertToDelete, setAlertToDelete] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCreateComparisonModal, setShowCreateComparisonModal] = useState(false);

  const { loading: deleting, deleteData: deleteAlert } = useDeleteData<{ id: string }, null>({
    successMessage: 'Alert deleted successfully',
    errorMessage: 'Failed to delete alert',
  });

  // const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const userId = session?.userId;

  // Use useFetchData hook to fetch alerts
  const {
    data: alertsData,
    loading: isLoading,
    error: fetchError,
    reFetchData,
  } = useFetchData<Alert[]>(`${baseUrl}/api/alerts`, { skipInitialFetch: !userId }, 'Failed to load comparison alerts. Please try again later.');

  useEffect(() => {
    if (!alertsData) return;

    // Filter to only show comparison alerts
    const comparisonAlerts = alertsData.filter((alert: Alert) => alert.isComparison);

    // Ensure every alert has the required properties
    const processedAlerts = comparisonAlerts.map((alert: Alert) => ({
      ...alert,
      selectedChains: alert.selectedChains || [],
      selectedAssets: alert.selectedAssets || [],
      compareProtocols: alert.compareProtocols || [],
      conditions: alert.conditions || [],
      deliveryChannels: alert.deliveryChannels || [],
    }));

    let result = [...processedAlerts];

    // Apply category filter
    if (activeTab !== 'all') {
      result = result.filter((alert) => (activeTab === 'general' ? alert.category === 'GENERAL' : alert.category === 'PERSONALIZED'));
    }

    // Apply action type filter
    if (actionTypeFilter !== 'all') {
      result = result.filter((alert) => alert.actionType === actionTypeFilter.toUpperCase());
    }

    // Apply chain filter
    if (chainFilter !== 'all') {
      result = result.filter((alert) => (alert.selectedChains || []).some((chain) => chain.name.toLowerCase() === chainFilter.toLowerCase()));
    }

    setFilteredAlerts(result);
  }, [alertsData, activeTab, actionTypeFilter, chainFilter]);

  const freqLabel = (f: string) => frequencyOptions.find((o) => o.value === f)?.label || f;

  // Get unique chains for filter
  const uniqueChains = alertsData
    ? Array.from(
        new Set(
          alertsData
            .filter((alert: Alert) => alert.isComparison)
            .flatMap((alert) => (alert.selectedChains || []).map((chain) => chain.name))
            .filter(Boolean)
        )
      )
    : [];

  const handleModalClose = async () => {
    setShowCreateComparisonModal(false);
    await reFetchData();
  };

  return (
    <div className="max-w-7xl mx-auto px-2 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-theme-primary">Compound vs Others</h1>
          <p className="text-theme-muted">
            Monitor Compound&apos;s performance and see when it outperforms other Lending-Borrowing DeFi platforms—generally or for a specific wallet—by
            creating your own custom alerts.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateComparisonModal(true)}
          className="mt-4 md:mt-0 bg-primary-color text-primary-text border border-transparent hover-border-body"
        >
          <Plus size={16} className="mr-1" /> Create Comparison Alert
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div></div>

        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="flex gap-2">
            <Button
              variant={actionTypeFilter === 'borrow' ? 'default' : 'outline'}
              onClick={() => setActionTypeFilter((prev) => (prev === 'borrow' ? 'all' : 'borrow'))}
              className={
                actionTypeFilter === 'borrow' ? 'bg-primary-color text-primary-text' : 'border-theme-border-primary text-theme-primary hover-border-primary'
              }
            >
              <TrendingDown size={16} className="mr-2" /> Borrow Rates
            </Button>
            <Button
              variant={actionTypeFilter === 'supply' ? 'default' : 'outline'}
              onClick={() => setActionTypeFilter((prev) => (prev === 'supply' ? 'all' : 'supply'))}
              className={
                actionTypeFilter === 'supply' ? 'bg-primary-color text-primary-text' : 'border-theme-border-primary text-theme-primary hover-border-primary'
              }
            >
              <TrendingUp size={16} className="mr-2" /> Supply Rates
            </Button>
          </div>

          <ChainSelect onValueChange={setChainFilter} defaultValue="all" chains={uniqueChains} />
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center">
          <FullPageLoader />
        </div>
      )}

      {/* Error state */}
      {fetchError && (
        <div className="flex justify-center items-center h-40">
          <div className="text-red-500">{fetchError}</div>
        </div>
      )}

      {/* Alerts table */}
      {!isLoading && !fetchError && (
        <div className="rounded-md border border-primary-color overflow-hidden bg-block">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-primary-color">
                  <TableHead className="w-[150px] text-left">Alert</TableHead>
                  <TableHead className="w-[180px] text-center">Chain/Market</TableHead>
                  <TableHead className="w-[350px] text-center">Condition</TableHead>
                  <TableHead className="w-[100px] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.length > 0 ? (
                  filteredAlerts.map((alert) => {
                    return (
                      <TableRow key={alert.id} className="border-primary-color">
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="text-theme-primary">{toSentenceCase(alert.actionType)}</span>
                            {alert.category === 'PERSONALIZED' ? (
                              <span className="text-xs text-primary-color">{formatWalletAddress(alert.walletAddress!)}</span>
                            ) : (
                              <span className="text-xs text-primary-color">General</span>
                            )}
                            <span>
                              <PlatformsCell platforms={alert.compareProtocols || []} />
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-theme-muted">
                            <DeliveryChannelCell deliveryChannels={alert.deliveryChannels} isMini={true} />- {freqLabel(alert.notificationFrequency)}
                          </div>
                          <StatusBadge status={alert.status} showOnlyInactive={true} />
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center justify-center">
                            <AssetChainPairCell chains={alert.selectedChains || []} assets={alert.selectedAssets || []} />
                          </div>
                        </TableCell>

                        <TableCell>
                          <ConditionsCell alert={alert} />
                        </TableCell>

                        <TableCell className="text-center">
                          <AlertActionsCell alert={alert} setAlertToDelete={setAlertToDelete} setShowConfirmModal={setShowConfirmModal} />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-theme-muted">
                        <ArrowLeftRight size={24} className="mb-2 text-primary-color" />
                        <p>No comparison alerts found</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 border-theme-border-primary text-theme-primary hover-border-primary"
                          onClick={() => setShowCreateComparisonModal(true)}
                        >
                          Create your first comparison alert
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <DeleteAlertModal
              open={showConfirmModal}
              alertId={alertToDelete}
              baseUrl={baseUrl}
              deleting={deleting}
              onClose={() => {
                setShowConfirmModal(false);
                setAlertToDelete(null);
              }}
              onDeleteSuccess={reFetchData}
              deleteAlert={deleteAlert}
            />
          </div>
        </div>
      )}

      {/* Create Comparison Alert Modal */}
      <CreateComparisonModals isOpen={showCreateComparisonModal} onClose={handleModalClose} onAlertsUpdated={reFetchData} />
    </div>
  );
}
