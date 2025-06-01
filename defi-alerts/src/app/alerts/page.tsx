'use client';

import { AssetImage } from '@/components/alerts/core/AssetImage';
import CreateAlertModals from '@/components/alerts/CreateAlertModals';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { type Alert, type Channel, frequencyOptions, type PrismaCondition, severityOptions } from '@/types/alerts';
import { formatWalletAddress } from '@/utils/getFormattedWalletAddress';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Bell, ChevronDown, Info, Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useEffect, useState } from 'react';

export default function AlertsPage() {
  const { data } = useSession();
  const session = data as DoDAOSession;

  const router = useRouter();
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
    redirectPath: undefined,
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

  const severityLabel = (s: PrismaCondition) => severityOptions.find((o) => o.value === s.severity)?.label || '-';

  const freqLabel = (f: string) => frequencyOptions.find((o) => o.value === f)?.label || f;

  // Calculate summary counts
  const totalAlerts = filteredAlerts.length;
  const supplyAlerts = filteredAlerts.filter((a) => a.actionType === 'SUPPLY').length;
  const borrowAlerts = filteredAlerts.filter((a) => a.actionType === 'BORROW').length;
  const personalizedAlerts = filteredAlerts.filter((a) => a.category === 'PERSONALIZED').length;

  // Get severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'LOW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-theme-bg-muted text-theme-muted border-theme-border-primary';
    }
  };

  // Format condition threshold values based on condition type
  const formatThresholdValue = (condition: PrismaCondition) => {
    if (condition.conditionType === 'APR_OUTSIDE_RANGE') {
      return condition.thresholdValueLow && condition.thresholdValueHigh ? `${condition.thresholdValueLow}–${condition.thresholdValueHigh}%` : '-';
    } else {
      return condition.thresholdValue ? `${condition.thresholdValue}%` : '-';
    }
  };

  const handleModalClose = async () => {
    setShowCreateAlertModal(false);
    await reFetchData();
  };

  return (
    <div className="max-w-7xl mx-auto px-2 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-theme-primary">Market Alerts</h1>
          <p className="text-theme-muted">Monitor market rates and get notified when conditions are met.</p>
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
        <Tabs defaultValue="all" value={activeTab} className="w-full md:w-auto" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full md:w-[400px] bg-theme-bg-secondary">
            <TabsTrigger
              value="all"
              className={
                activeTab === 'all' ? 'bg-primary-color text-primary-text data-[state=active]:bg-primary-color data-[state=active]:text-primary-text' : ''
              }
            >
              All Alerts
            </TabsTrigger>
            <TabsTrigger
              value="general"
              className={
                activeTab === 'general' ? 'bg-primary-color text-primary-text data-[state=active]:bg-primary-color data-[state=active]:text-primary-text' : ''
              }
            >
              Market Alerts
            </TabsTrigger>
            <TabsTrigger
              value="personalized"
              className={
                activeTab === 'personalized'
                  ? 'bg-primary-color text-primary-text data-[state=active]:bg-primary-color data-[state=active]:text-primary-text'
                  : ''
              }
            >
              Position Alerts
            </TabsTrigger>
          </TabsList>
        </Tabs>

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
                  <TableHead className="w-[120px]">Alert Type</TableHead>
                  <TableHead className="w-[200px]">Chain/Market</TableHead>
                  <TableHead className="w-[200px]">Wallet Address</TableHead>
                  <TableHead className="w-[180px]">Conditions</TableHead>
                  <TableHead className="w-[150px]">Frequency</TableHead>
                  <TableHead className="w-[200px]">Delivery Channel</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.length > 0 ? (
                  filteredAlerts.map((alert) => {
                    // For simplicity pick first condition & channel
                    const cond = alert.conditions[0] as PrismaCondition | undefined;
                    const chan = alert.deliveryChannels[0] as Channel | undefined;
                    const hasMultipleConditions = alert.conditions.length > 1;
                    const hasMultipleChannels = alert.deliveryChannels.length > 1;

                    return (
                      <TableRow key={alert.id} className="border-primary-color">
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="text-theme-primary">{alert.actionType.charAt(0) + alert.actionType.slice(1).toLowerCase()}</span>
                            {alert.category === 'PERSONALIZED' && <span className="text-xs text-primary-color">Personalized</span>}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex flex-wrap gap-1">
                              {(alert.selectedChains || []).map((chain) => (
                                <Badge key={chain.chainId} variant="outline" className="border border-primary-color flex items-center gap-1">
                                  {/* We don't have platform info for chains, so we can't use PlatformImage here */}
                                  {chain.name}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(alert.selectedAssets || []).map((asset) => (
                                <span key={asset.chainId_address} className="text-xs text-theme-primary font-medium flex items-center gap-1">
                                  <AssetImage
                                    chain={alert.selectedChains.find((c) => c.chainId === asset.chainId)?.name || ''}
                                    assetAddress={asset.address}
                                    assetSymbol={asset.symbol}
                                  />
                                  {asset.symbol}
                                </span>
                              ))}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="text-theme-primary">{alert.walletAddress ? formatWalletAddress(alert.walletAddress) : ''}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          {cond ? (
                            <div className="flex items-center gap-2">
                              <Badge className={`${getSeverityColor(cond.severity)}`}>{severityLabel(cond as PrismaCondition)}</Badge>
                              <span className="text-xs text-theme-muted">{formatThresholdValue(cond as PrismaCondition)}</span>
                              {hasMultipleConditions && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button size="icon" className="h-5 w-5 p-0 hover-text-primary">
                                        <Info size={14} />
                                        <span className="sr-only">View all conditions</span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs bg-block p-3 border border-theme-primary">
                                      <div className="space-y-2">
                                        <h4 className="font-medium text-primary-color">All Conditions</h4>
                                        <ul className="space-y-1">
                                          {alert.conditions.map((c, i) => (
                                            <li key={i} className="text-xs text-theme-muted">
                                              <span className="font-medium">{severityLabel(c as PrismaCondition)}:</span>{' '}
                                              {formatThresholdValue(c as PrismaCondition)}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-theme-muted">None</span>
                          )}
                        </TableCell>

                        <TableCell>
                          <span className="text-theme-primary">{freqLabel(alert.notificationFrequency)}</span>
                        </TableCell>

                        <TableCell>
                          {chan ? (
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                <span className="text-xs font-medium text-theme-primary">{chan.channelType}</span>
                                {hasMultipleChannels && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button size="icon" className="h-5 w-5 p-0 hover-text-primary ml-2">
                                          <Info size={14} />
                                          <span className="sr-only">View all channels</span>
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-xs bg-block p-3 border border-theme-primary">
                                        <div className="space-y-2">
                                          <h4 className="font-medium text-primary-color">All Delivery Channels</h4>
                                          <ul className="space-y-1">
                                            {alert.deliveryChannels.map((c, i) => (
                                              <li key={i} className="text-xs text-theme-muted">
                                                <span className="font-medium">
                                                  {c.channelType.charAt(0).toUpperCase() + c.channelType.slice(1).toLowerCase()}:
                                                </span>{' '}
                                                {c.channelType === 'EMAIL' ? c.email : c.webhookUrl}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                              <span className="text-xs text-theme-muted truncate max-w-[180px]">
                                {chan.channelType === 'EMAIL' ? chan.email : chan.webhookUrl}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-theme-muted">Not set</span>
                          )}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              alert.status === 'ACTIVE' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            }
                          >
                            {alert.status.charAt(0) + alert.status.slice(1).toLowerCase()}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button className="h-8 w-8 p-0 hover-text-primary">
                                <span className="sr-only">Open menu</span>
                                <ChevronDown className="ml-4 h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-block">
                              <div className="hover-border-primary hover-text-primary">
                                <DropdownMenuItem className="text-theme-primary cursor-pointer" onClick={() => router.push(`/alerts/edit/${alert.id}`)}>
                                  Edit
                                </DropdownMenuItem>
                              </div>
                              <div className="hover-border-primary hover-text-primary">
                                <DropdownMenuItem className="text-theme-primary cursor-pointer" onClick={() => router.push(`/alerts/history/${alert.id}`)}>
                                  History
                                </DropdownMenuItem>
                              </div>
                              <DropdownMenuItem
                                className="text-red-600 cursor-pointer"
                                onClick={() => {
                                  setAlertToDelete(alert.id);
                                  setShowConfirmModal(true);
                                }}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
            {showConfirmModal && alertToDelete && (
              <ConfirmationModal
                open={showConfirmModal}
                showSemiTransparentBg={true}
                onClose={() => {
                  setShowConfirmModal(false);
                  setAlertToDelete(null);
                }}
                onConfirm={async () => {
                  await deleteAlert(`${baseUrl}/api/alerts/${alertToDelete}`);
                  setShowConfirmModal(false);
                  setAlertToDelete(null);
                }}
                title="Delete Alert"
                confirmationText="Are you sure you want to delete this alert?"
                confirming={deleting}
                askForTextInput={false}
              />
            )}
          </div>
        </div>
      )}

      {/* Create Alert Modals */}
      <CreateAlertModals isOpen={showCreateAlertModal} onClose={handleModalClose} />
    </div>
  );
}
