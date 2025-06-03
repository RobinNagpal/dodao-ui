'use client';

import { AlertNotificationResponse } from '@/app/api/alert-notifications/route';
import { ConditionsCell } from '@/components/alerts';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatWalletAddress } from '@/utils/getFormattedWalletAddress';
import { toSentenceCase } from '@/utils/getSentenceCase';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Bell } from 'lucide-react';
import { useSession } from 'next-auth/react';
import type React from 'react';

export default function AlertNotificationsPage() {
  const { data } = useSession();
  const session = data as DoDAOSession;

  const baseUrl = getBaseUrl();
  const userId = session.userId;

  // Use useFetchData hook to fetch alert notifications
  const {
    data: alertNotificationsData,
    loading: isLoading,
    error: fetchError,
  } = useFetchData<AlertNotificationResponse[]>(
    `${baseUrl}/api/alert-notifications`,
    { skipInitialFetch: !userId },
    'Failed to load alert notifications. Please try again later.'
  );

  // Format date for display
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get condition description
  const getConditionDescription = (condition: any) => {
    switch (condition.conditionType) {
      case 'APR_RISE_ABOVE':
        return `APR rises above ${condition.thresholdValue}%`;
      case 'APR_FALLS_BELOW':
        return `APR falls below ${condition.thresholdValue}%`;
      case 'APR_OUTSIDE_RANGE':
        return `APR outside range ${condition.thresholdValueLow}% - ${condition.thresholdValueHigh}%`;
      case 'RATE_DIFF_ABOVE':
        return `Rate difference above ${condition.thresholdValue}%`;
      case 'RATE_DIFF_BELOW':
        return `Rate difference below ${condition.thresholdValue}%`;
      default:
        return condition.conditionType;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-theme-primary">Alert Notifications</h1>
          <p className="text-theme-muted">View all notifications sent for your alerts, including details about the triggered conditions.</p>
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

      {/* Alert Notifications table */}
      {!isLoading && !fetchError && (
        <div className="rounded-md border border-primary-color overflow-hidden bg-block">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-primary-color">
                  <TableHead className="w-[150px] text-center">Alert Type</TableHead>
                  <TableHead className="w-[200px] text-center">Chain/Asset</TableHead>
                  <TableHead className="w-[250px] text-center">All Alert Condition</TableHead>
                  <TableHead className="w-[250px] text-center">Triggered Condition</TableHead>
                  <TableHead className="w-[150px] text-center">Severity</TableHead>
                  <TableHead className="w-[200px] text-center">Sent At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alertNotificationsData && alertNotificationsData.length > 0 ? (
                  alertNotificationsData.map((notification) => {
                    // Use the triggeredConditions field from the API response
                    const { triggeredConditions } = notification;

                    const sentAt = notification?.SentNotification?.sentAt;
                    return (
                      <TableRow key={notification.id} className="border-primary-color">
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="text-theme-primary">{toSentenceCase(notification.alert.actionType)}</span>
                            {notification.alert.category === 'PERSONALIZED' ? (
                              <span className="text-xs text-primary-color">{formatWalletAddress(notification.alert.walletAddress!)}</span>
                            ) : (
                              <span className="text-xs text-primary-color">General</span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            {notification.alert.selectedChains.map((chain, index) => (
                              <span key={index} className="text-theme-primary">
                                {chain.name}
                              </span>
                            ))}
                            {notification.alert.selectedAssets.map((asset, index) => (
                              <span key={index} className="text-xs text-primary-color">
                                {asset.symbol}
                              </span>
                            ))}
                          </div>
                        </TableCell>

                        <TableCell className="text-left">
                          <ConditionsCell alert={notification.alert} />
                        </TableCell>
                        <TableCell className="text-left">
                          <ConditionsCell alert={{ ...notification.alert, conditions: triggeredConditions }} />
                        </TableCell>

                        <TableCell className="text-center">
                          {triggeredConditions.map((condition, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className={
                                condition.severity === 'HIGH'
                                  ? 'bg-red-100 text-red-800 border-red-200'
                                  : condition.severity === 'MEDIUM'
                                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                  : condition.severity === 'LOW'
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : 'bg-gray-100 text-gray-800 border-gray-200'
                              }
                            >
                              {condition.severity}
                            </Badge>
                          ))}
                        </TableCell>

                        <TableCell className="text-center">
                          {notification.SentNotification ? (
                            <span className="text-theme-primary">{sentAt ? formatDate(sentAt) : '-'}</span>
                          ) : (
                            <span className="text-theme-muted">Not sent</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-theme-muted">
                        <Bell size={24} className="mb-2 text-primary-color" />
                        <p>No alert notifications found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
