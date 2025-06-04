'use client';

import { AlertActionsCell, ConditionsCell, DeleteAlertModal, DeliveryChannelCell } from '@/components/alerts';
import AssetChainPairCell from '@/components/alerts/core/AssetChainPairCell';
import CreateAlertModals from '@/components/alerts/CreateAlertModals';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type Alert, frequencyOptions } from '@/types/alerts';
import { formatWalletAddress } from '@/utils/getFormattedWalletAddress';
import { toSentenceCase } from '@/utils/getSentenceCase';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Bell, Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { useSession } from 'next-auth/react';
import type React from 'react';
import { useEffect, useState } from 'react';

export default function AlertsPage() {
  const { data } = useSession();
  const session = data as DoDAOSession;

  const baseUrl = getBaseUrl();
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [actionTypeFilter, setActionTypeFilter] = useState('all');
  const [chainFilter, setChainFilter] = useState('all');
  const [alertToDelete, setAlertToDelete] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [uniqueChains, setUniqueChains] = useState<string[]>([]);

  // Modal state
  const [showCreateAlertModal, setShowCreateAlertModal] = useState(false);

  const { loading: deleting, deleteData: deleteAlert } = useDeleteData<{ id: string }, null>({
    successMessage: 'Alert deleted successfully',
    errorMessage: 'Failed to delete alert',
  });

  // const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const userId = session.userId;

  // Use useFetchData hook to fetch alerts
  const {
    data: alertsData,
    loading: isLoading,
    error: fetchError,
    reFetchData,
  } = useFetchData<Alert[]>(`${baseUrl}/api/alerts`, { skipInitialFetch: !userId }, 'Failed to load alerts. Please try again later.');

  // Process alerts data
  // Update filtered alerts when alerts data changes or filters change
  useEffect(() => {
    const alerts = alertsData
      ? alertsData
          .filter((alert: Alert) => !alert.isComparison)
          .map((alert: Alert) => ({
            ...alert,
            selectedChains: alert.selectedChains || [],
            selectedAssets: alert.selectedAssets || [],
            conditions: alert.conditions || [],
            deliveryChannels: alert.deliveryChannels || [],
          }))
      : [];

    let result = [...alerts];

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

    setUniqueChains(Array.from(new Set(alerts.flatMap((alert) => (alert.selectedChains || []).map((chain) => chain.name)).filter(Boolean))));
  }, [activeTab, actionTypeFilter, chainFilter, alertsData]);

  const freqLabel = (f: string) => frequencyOptions.find((o) => o.value === f)?.label || f;

  const handleModalClose = async () => {
    setShowCreateAlertModal(false);
    await reFetchData();
  };

  return (
    <div className="max-w-7xl mx-auto px-2 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-theme-primary">Compound Alerts</h1>
          <p className="text-theme-muted">
            Monitor Compound&apos;s market rates—generally or for a specific wallet—and receive notifications based on your custom alert settings.
          </p>
        </div>

        <Button
          onClick={() => setShowCreateAlertModal(true)}
          className="mt-4 md:mt-0 px-4 py-2 text-sm bg-primary-color text-primary-text border border-transparent rounded-lg hover-border-body"
        >
          <Plus size={16} className="inline mr-1" /> Create Alert
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
              <TrendingDown size={16} className="mr-2" /> Borrow Alerts
            </Button>
            <Button
              variant={actionTypeFilter === 'supply' ? 'default' : 'outline'}
              onClick={() => setActionTypeFilter((prev) => (prev === 'supply' ? 'all' : 'supply'))}
              className={
                actionTypeFilter === 'supply' ? 'bg-primary-color text-primary-text' : 'border-theme-border-primary text-theme-primary hover-border-primary'
              }
            >
              <TrendingUp size={16} className="mr-2" /> Supply Alerts
            </Button>
          </div>

          <Select onValueChange={setChainFilter} defaultValue="all">
            <SelectTrigger className="w-full md:w-[180px] border-theme-border-primary">
              <SelectValue placeholder="All Chains" />
            </SelectTrigger>
            <SelectContent className="bg-block">
              <div className="hover-border-primary hover-text-primary">
                <SelectItem value="all">All Chains</SelectItem>
              </div>
              {uniqueChains.map((chain) => (
                <div key={chain} className="hover-border-primary hover-text-primary">
                  <SelectItem key={chain} value={chain.toLowerCase()}>
                    {chain}
                  </SelectItem>
                </div>
              ))}
            </SelectContent>
          </Select>
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
                  <TableHead className="w-[120px] text-center">Alert</TableHead>
                  <TableHead className="w-[200px] text-center">Chain/Market</TableHead>
                  <TableHead className="w-[250px] text-center">Condition</TableHead>
                  <TableHead className="w-[120px] text-center">Frequency</TableHead>
                  <TableHead className="w-[170px] text-center">Delivery Channel</TableHead>
                  <TableHead className="w-[100px] text-center">Status</TableHead>
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
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <AssetChainPairCell chains={alert.selectedChains || []} assets={alert.selectedAssets || []} />
                        </TableCell>

                        <TableCell className="flex items-center justify-center">
                          <ConditionsCell alert={alert} />
                        </TableCell>

                        <TableCell className="text-center">
                          <span className="text-theme-primary">{freqLabel(alert.notificationFrequency)}</span>
                        </TableCell>

                        <TableCell>
                          <DeliveryChannelCell deliveryChannels={alert.deliveryChannels} />
                        </TableCell>

                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={
                              alert.status === 'ACTIVE' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            }
                          >
                            {alert.status.charAt(0) + alert.status.slice(1).toLowerCase()}
                          </Badge>
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
                        <Bell size={24} className="mb-2 text-primary-color" />
                        <p>No alerts found</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 border-theme-border-primary text-theme-primary hover-border-primary"
                          onClick={() => setShowCreateAlertModal(true)}
                        >
                          Create your first alert
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

      {/* Create Alert Modals */}
      <CreateAlertModals isOpen={showCreateAlertModal} onClose={handleModalClose} />
    </div>
  );
}
