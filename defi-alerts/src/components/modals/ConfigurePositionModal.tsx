'use client';

import { useSession } from 'next-auth/react';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationFrequencySection, DeliveryChannelsCard } from '@/components/alerts';
import { type Channel, type ConditionType, type NotificationFrequency, type SeverityLevel, severityOptions } from '@/types/alerts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, AlertCircle, Info, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CreatePersonalizedAlertPayload, PersonalizedAlertCreationResponse } from '@/app/api/alerts/create/personalized-market/route';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { AlertCategory, AlertActionType, ConditionType as PrismaConditionType, DeliveryChannelType } from '@prisma/client';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { BasePosition, WalletComparisonPosition } from './types';
import { PersonalizedComparisonAlertPayload, PersonalizedComparisonAlertResponse } from '@/app/api/alerts/create/personalized-comparison/route';
import { toSentenceCase } from '@/utils/getSentenceCase';

interface ConfigurePositionProps<T extends BasePosition> {
  isOpen: boolean;
  modalType: 'GENERAL' | 'COMPARISON';
  selectedPosition: T | null;
  handleClose: () => void;
  updatePosition: (id: string, changes: Partial<T>) => void;
  positionChannels: Record<string, any[]>;
  setPositionChannels: React.Dispatch<React.SetStateAction<Record<string, any[]>>>;
  errors: any;
  setErrors: (errors: any) => void;
  onSwitchToPositions: () => void;
}

export default function ConfigurePositionModal<T extends BasePosition>({
  isOpen,
  modalType,
  selectedPosition,
  handleClose,
  updatePosition,
  positionChannels,
  setPositionChannels,
  errors,
  setErrors,
  onSwitchToPositions,
}: ConfigurePositionProps<T>) {
  const { data } = useSession();
  const session = data as DoDAOSession;
  const baseUrl = getBaseUrl();

  const { showNotification } = useNotificationContext();

  const { postData: postPositionAlert, loading: creatingPositionAlert } = usePostData<PersonalizedAlertCreationResponse, CreatePersonalizedAlertPayload>({
    successMessage: 'Personalized alert created successfully',
    errorMessage: 'Failed to create personalized alert',
    redirectPath: '/alerts',
  });

  const { postData: postPersonalizedComparisonAlert, loading: creatingComparisonAlert } = usePostData<
    PersonalizedComparisonAlertResponse,
    PersonalizedComparisonAlertPayload
  >({
    successMessage: 'Personalized comparison alert created successfully',
    errorMessage: 'Failed to create personalized comparison alert',
    redirectPath: '/alerts/compare-compound',
  });

  if (!selectedPosition) return null;

  // Get contextual message for condition type
  const getConditionMessage = (conditionType: ConditionType) => {
    switch (conditionType) {
      case 'APR_RISE_ABOVE':
        return 'Alert when APR exceeds your threshold (e.g., alert when APR goes above 5%)';
      case 'APR_FALLS_BELOW':
        return 'Alert when APR drops under your threshold (e.g., alert when APR goes below 2%)';
      case 'APR_OUTSIDE_RANGE':
        return 'Alert when APR moves outside your specified range (e.g., alert when APR is below 3% or above 6%)';
      default:
        return 'Select a condition type to see its description';
    }
  };

  // Get contextual message for condition type
  const getComparisonMessage = (position: WalletComparisonPosition) => {
    if (position.actionType === 'SUPPLY') {
      return `Example: If ${toSentenceCase(position.platform)} offers ${
        position.rate
      } APR and you set 1.2% threshold, you'll be alerted when Compound's supply APR reaches ${(parseFloat(position.rate.replace('%', '')) + 1.2).toFixed(
        1
      )}% (${toSentenceCase(position.platform)} rate + your threshold)`;
    } else {
      return `Example: If ${toSentenceCase(position.platform)} charges ${
        position.rate
      } APR and you set 0.5% threshold, you'll be alerted when Compound's borrow APR drops to ${(parseFloat(position.rate.replace('%', '')) - 0.5).toFixed(
        1
      )}% (${toSentenceCase(position.platform)} rate - your threshold)`;
    }
  };

  // Position channel functions
  const addPositionChannel = () => {
    if (!selectedPosition) return;

    setPositionChannels((prev) => ({
      ...prev,
      [selectedPosition.id]: [...(prev[selectedPosition.id] || []), { channelType: 'EMAIL', email: session?.username || '' }],
    }));
  };

  const updatePositionChannel = (idx: number, field: keyof Channel, val: string) => {
    if (!selectedPosition) return;

    setPositionChannels((prev) => ({
      ...prev,
      [selectedPosition.id]: (prev[selectedPosition.id] || []).map((ch, i) => (i === idx ? { ...ch, [field]: val } : ch)),
    }));
  };

  const removePositionChannel = (idx: number) => {
    if (!selectedPosition) return;

    setPositionChannels((prev) => ({
      ...prev,
      [selectedPosition.id]: (prev[selectedPosition.id] || []).filter((_, i) => i !== idx),
    }));
  };

  // Position alert validation and submission
  const validatePositionAlert = () => {
    if (!selectedPosition) return false;

    const positionErrors: {
      conditions?: string[];
      channels?: string[];
    } = {};

    // Validate conditions
    const conditionErrors: string[] = [];
    selectedPosition.conditions.forEach((condition, index) => {
      if (condition.conditionType === 'APR_OUTSIDE_RANGE') {
        if (!condition.thresholdLow || !condition.thresholdHigh) {
          conditionErrors[index] = 'Both min and max thresholds are required';
        } else if (isNaN(Number(condition.thresholdLow)) || isNaN(Number(condition.thresholdHigh))) {
          conditionErrors[index] = 'Min and max thresholds must be valid numbers';
        }
      } else {
        if (!condition.thresholdValue) {
          conditionErrors[index] = 'Threshold value is required';
        } else if (isNaN(Number(condition.thresholdValue))) {
          conditionErrors[index] = 'Threshold value must be a valid number';
        }
      }
    });

    if (conditionErrors.some((error) => error)) {
      positionErrors.conditions = conditionErrors;
    }

    // Validate channels
    const channels = positionChannels[selectedPosition.id] || [];
    const channelErrors: string[] = [];
    channels.forEach((channel, index) => {
      if (channel.channelType === 'EMAIL') {
        if (!channel.email) {
          channelErrors[index] = 'Email address is required';
        } else {
          const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRx.test(channel.email)) {
            channelErrors[index] = 'Invalid email address';
          }
        }
      } else if (channel.channelType === 'WEBHOOK') {
        if (!channel.webhookUrl) {
          channelErrors[index] = 'Webhook URL is required';
        } else {
          try {
            new URL(channel.webhookUrl);
          } catch {
            channelErrors[index] = 'Invalid webhook URL';
          }
        }
      }
    });

    if (channelErrors.some((error) => error)) {
      positionErrors.channels = channelErrors;
    }

    setErrors((prev: any) => ({
      ...prev,
      [selectedPosition.id]: positionErrors,
    }));

    return Object.keys(positionErrors).length === 0;
  };

  const handleCreatePositionAlert = async () => {
    if (!selectedPosition || !validatePositionAlert()) {
      showNotification({
        type: 'error',
        heading: 'Validation Error',
        message: 'Please fix the errors before submitting',
      });
      return;
    }

    // Prepare the payload
    const payload: CreatePersonalizedAlertPayload = {
      walletAddress: selectedPosition.walletAddress,
      category: 'PERSONALIZED' as AlertCategory,
      actionType: selectedPosition.actionType as AlertActionType,
      selectedChains: [selectedPosition.chain],
      selectedMarkets: [selectedPosition.assetAddress],
      compareProtocols: [],
      notificationFrequency: selectedPosition.notificationFrequency as NotificationFrequency,
      conditions: selectedPosition.conditions.map((condition) =>
        condition.conditionType === 'APR_OUTSIDE_RANGE'
          ? {
              type: condition.conditionType as PrismaConditionType,
              min: condition.thresholdLow,
              max: condition.thresholdHigh,
              severity: condition.severity as SeverityLevel,
            }
          : {
              type: condition.conditionType as PrismaConditionType,
              value: condition.thresholdValue,
              severity: condition.severity as SeverityLevel,
            }
      ),
      deliveryChannels: (positionChannels[selectedPosition.id] || []).map((c) => ({
        type: c.channelType as DeliveryChannelType,
        email: c.channelType === 'EMAIL' ? c.email : undefined,
        webhookUrl: c.channelType === 'WEBHOOK' ? c.webhookUrl : undefined,
      })),
    };

    const success = await postPositionAlert(`${baseUrl}/api/alerts/create/personalized-market`, payload);

    if (success) {
      handleClose();
    }
  };

  // Position alert validation and submission
  const validateComparisonPositionAlert = () => {
    if (!selectedPosition) return false;

    const positionErrors: {
      conditions?: string[];
      channels?: string[];
    } = {};

    // Validate conditions
    const conditionErrors: string[] = [];
    selectedPosition.conditions.forEach((condition, index) => {
      if (!condition.thresholdValue) {
        conditionErrors[index] = 'Threshold value is required';
      } else if (isNaN(Number(condition.thresholdValue))) {
        conditionErrors[index] = 'Threshold value must be a valid number';
      }
    });

    if (conditionErrors.some((error) => error)) {
      positionErrors.conditions = conditionErrors;
    }

    // Validate channels
    const channels = positionChannels[selectedPosition.id] || [];
    const channelErrors: string[] = [];
    channels.forEach((channel, index) => {
      if (channel.channelType === 'EMAIL') {
        if (!channel.email) {
          channelErrors[index] = 'Email address is required';
        } else {
          const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRx.test(channel.email)) {
            channelErrors[index] = 'Invalid email address';
          }
        }
      } else if (channel.channelType === 'WEBHOOK') {
        if (!channel.webhookUrl) {
          channelErrors[index] = 'Webhook URL is required';
        } else {
          try {
            new URL(channel.webhookUrl);
          } catch {
            channelErrors[index] = 'Invalid webhook URL';
          }
        }
      }
    });

    if (channelErrors.some((error) => error)) {
      positionErrors.channels = channelErrors;
    }

    setErrors((prev: any) => ({
      ...prev,
      [selectedPosition.id]: positionErrors,
    }));

    return Object.keys(positionErrors).length === 0;
  };

  const handleCreatePersonalizedComparisonAlert = async () => {
    if (!selectedPosition || !validateComparisonPositionAlert()) {
      showNotification({
        type: 'error',
        heading: 'Validation Error',
        message: 'Please fix the errors before submitting',
      });
      return;
    }

    // Prepare the payload
    const payload: PersonalizedComparisonAlertPayload = {
      walletAddress: selectedPosition.walletAddress,
      category: 'PERSONALIZED' as AlertCategory,
      actionType: selectedPosition.actionType as AlertActionType,
      isComparison: true,
      selectedChains: [selectedPosition.chain],
      selectedMarkets: [selectedPosition.assetAddress],
      compareProtocols: [(selectedPosition as unknown as WalletComparisonPosition).platform],
      notificationFrequency: selectedPosition.notificationFrequency as NotificationFrequency,
      conditions: selectedPosition.conditions.map((condition) => ({
        type: condition.conditionType as PrismaConditionType,
        value: condition.thresholdValue!,
        severity: condition.severity as SeverityLevel,
      })),
      deliveryChannels: (positionChannels[selectedPosition.id] || []).map((c) => ({
        type: c.channelType as DeliveryChannelType,
        email: c.channelType === 'EMAIL' ? c.email : undefined,
        webhookUrl: c.channelType === 'WEBHOOK' ? c.webhookUrl : undefined,
      })),
    };

    const success = await postPersonalizedComparisonAlert(`${baseUrl}/api/alerts/create/personalized-comparison`, payload);

    if (success) {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-6xl max-h-[90vh] overflow-y-auto bg-theme-bg-secondary border border-primary-color background-color">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-theme-primary">
            Configure Alert for {selectedPosition?.assetSymbol} on {selectedPosition?.chain}
            {modalType === 'COMPARISON' ? ` - ${toSentenceCase((selectedPosition as unknown as WalletComparisonPosition)?.platform)}` : ''}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {selectedPosition && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="text-primary-color border-primary-color">
                  {selectedPosition.actionType}
                </Badge>
                <div>
                  <span className="text-theme-primary">
                    Current {modalType === 'GENERAL' ? 'APR' : `${(selectedPosition as unknown as WalletComparisonPosition).platform} APY`}:{' '}
                    {selectedPosition.rate}
                  </span>
                </div>
              </div>

              <div className="border-t border-theme-primary pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-medium text-theme-primary">{modalType === 'GENERAL' ? 'Condition Settings' : 'Rate Difference Thresholds'}</h4>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!selectedPosition) return;
                      const conditionType =
                        modalType === 'GENERAL'
                          ? ('APR_RISE_ABOVE' as ConditionType)
                          : selectedPosition.actionType === 'SUPPLY'
                          ? ('RATE_DIFF_ABOVE' as ConditionType)
                          : ('RATE_DIFF_BELOW' as ConditionType);
                      const newCondition = {
                        id: `condition-${Date.now()}`,
                        conditionType: conditionType,
                        severity: 'NONE' as SeverityLevel,
                        thresholdValue: '',
                      };
                      updatePosition(selectedPosition.id, {
                        conditions: [...selectedPosition.conditions, newCondition],
                      } as Partial<T>);
                    }}
                    className="text-theme-primary border border-theme-primary hover-border-primary hover-text-primary"
                  >
                    <Plus size={16} className="mr-1" /> Add {modalType === 'GENERAL' ? 'Condition' : 'Threshold'}
                  </Button>
                </div>

                <p className="text-sm text-theme-muted mb-4">
                  {modalType === 'GENERAL'
                    ? 'Define when you want to be alerted about changes to this position. You will receive an alert if any of the set conditions are met.'
                    : 'Set the Rate Difference required to trigger an alert. You will receive an alert if any of the set conditions are met.'}
                </p>

                {modalType === 'COMPARISON' ? (
                  <div className="mb-6 p-3 bg-theme-secondary rounded-lg border border-theme-primary">
                    <p className="text-sm text-theme-muted">
                      <span className="text-primary-color font-medium">How thresholds work:</span>{' '}
                      {getComparisonMessage(selectedPosition as unknown as WalletComparisonPosition)}
                    </p>
                  </div>
                ) : (
                  <></>
                )}

                {/* Render each condition */}
                {selectedPosition.conditions.map((condition, index) => (
                  <div key={condition.id} className="mb-6">
                    <div className="border-t border-primary-color pt-4">
                      {modalType === 'GENERAL' ? (
                        <div className="mb-4 p-3 bg-theme-secondary rounded-lg border border-theme-primary">
                          <p className="text-sm text-theme-muted">
                            <span className="text-primary-color font-medium">Condition {index + 1}:</span> {getConditionMessage(condition.conditionType)}
                          </p>
                        </div>
                      ) : (
                        <></>
                      )}

                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-1 flex items-center text-theme-muted">
                          <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0 rounded-full text-primary-color">
                            {index + 1}
                          </Badge>
                        </div>

                        {modalType === 'GENERAL' ? (
                          <>
                            <div className="col-span-3">
                              <Select
                                value={condition.conditionType}
                                onValueChange={(value) =>
                                  updatePosition(selectedPosition.id, {
                                    conditions: selectedPosition.conditions.map((c, i) => (i === index ? { ...c, conditionType: value as ConditionType } : c)),
                                  } as Partial<T>)
                                }
                              >
                                <SelectTrigger className="w-full hover-border-primary">
                                  <SelectValue placeholder="Select condition type" />
                                </SelectTrigger>
                                <SelectContent className="bg-block">
                                  <div className="hover-border-primary hover-text-primary">
                                    <SelectItem value="APR_RISE_ABOVE" className="hover:text-primary-color">
                                      APR rises above threshold
                                    </SelectItem>
                                  </div>
                                  <div className="hover-border-primary hover-text-primary">
                                    <SelectItem value="APR_FALLS_BELOW">APR falls below threshold</SelectItem>
                                  </div>
                                  <div className="hover-border-primary hover-text-primary">
                                    <SelectItem value="APR_OUTSIDE_RANGE">APR is outside a range</SelectItem>
                                  </div>
                                </SelectContent>
                              </Select>
                            </div>

                            {condition.conditionType === 'APR_OUTSIDE_RANGE' ? (
                              <div className="col-span-4 flex flex-col">
                                <div className="flex items-center space-x-2">
                                  <Input
                                    type="text"
                                    placeholder="Min (e.g., 3)"
                                    value={condition.thresholdLow || ''}
                                    onChange={(e) =>
                                      updatePosition(selectedPosition.id, {
                                        conditions: selectedPosition.conditions.map((c, i) => (i === index ? { ...c, thresholdLow: e.target.value } : c)),
                                      } as Partial<T>)
                                    }
                                    className={`border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                                      errors[selectedPosition.id]?.conditions && errors[selectedPosition.id].conditions[index] ? 'border-red-500' : ''
                                    }`}
                                  />
                                  <Input
                                    type="text"
                                    placeholder="Max (e.g., 6)"
                                    value={condition.thresholdHigh || ''}
                                    onChange={(e) =>
                                      updatePosition(selectedPosition.id, {
                                        conditions: selectedPosition.conditions.map((c, i) => (i === index ? { ...c, thresholdHigh: e.target.value } : c)),
                                      } as Partial<T>)
                                    }
                                    className={`border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                                      errors[selectedPosition.id]?.conditions && errors[selectedPosition.id].conditions[index] ? 'border-red-500' : ''
                                    }`}
                                  />
                                  <span className="text-theme-muted whitespace-nowrap flex-shrink-0">APR</span>
                                </div>
                                {errors[selectedPosition.id]?.conditions && errors[selectedPosition.id].conditions[index] && (
                                  <div className="mt-1 flex items-center text-red-500 text-sm">
                                    <AlertCircle size={14} className="mr-1" />
                                    <span>{errors[selectedPosition.id].conditions[index]}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="col-span-4 flex flex-col">
                                <div className="flex items-center">
                                  <Input
                                    type="text"
                                    placeholder={
                                      condition.conditionType === 'APR_RISE_ABOVE'
                                        ? 'Threshold (e.g., 5.0)'
                                        : condition.conditionType === 'APR_FALLS_BELOW'
                                        ? 'Threshold (e.g., 2.0)'
                                        : 'Threshold value'
                                    }
                                    value={condition.thresholdValue || ''}
                                    onChange={(e) =>
                                      updatePosition(selectedPosition.id, {
                                        conditions: selectedPosition.conditions.map((c, i) => (i === index ? { ...c, thresholdValue: e.target.value } : c)),
                                      } as Partial<T>)
                                    }
                                    className={`border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                                      errors[selectedPosition.id]?.conditions && errors[selectedPosition.id].conditions[index] ? 'border-red-500' : ''
                                    }`}
                                  />
                                  <span className="ml-2 text-theme-muted whitespace-nowrap flex-shrink-0">APR</span>
                                </div>
                                {errors[selectedPosition.id]?.conditions && errors[selectedPosition.id].conditions[index] && (
                                  <div className="mt-1 flex items-center text-red-500 text-sm">
                                    <AlertCircle size={14} className="mr-1" />
                                    <span>{errors[selectedPosition.id].conditions[index]}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="col-span-5 flex flex-col">
                            <div className="flex items-center">
                              <Input
                                type="text"
                                placeholder={selectedPosition.actionType === 'SUPPLY' ? 'Threshold (e.g., 1.2)' : 'Threshold (e.g., 0.5)'}
                                value={condition.thresholdValue || ''}
                                onChange={(e) =>
                                  updatePosition(selectedPosition.id, {
                                    conditions: selectedPosition.conditions.map((c, i) => (i === index ? { ...c, thresholdValue: e.target.value } : c)),
                                  } as Partial<T>)
                                }
                                className={`border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                                  errors[selectedPosition.id]?.conditions && errors[selectedPosition.id].conditions[index] ? 'border-red-500' : ''
                                }`}
                              />
                              <span className="ml-2 text-theme-muted whitespace-nowrap flex-shrink-0">APY difference</span>
                            </div>
                            {errors[selectedPosition.id]?.conditions && errors[selectedPosition.id].conditions[index] && (
                              <div className="mt-1 flex items-center text-red-500 text-sm">
                                <AlertCircle size={14} className="mr-1" />
                                <span>{errors[selectedPosition.id].conditions[index]}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Severity */}
                        <div className="col-span-3 flex items-center">
                          <Select
                            value={condition.severity === 'NONE' ? undefined : condition.severity}
                            onValueChange={(value) =>
                              updatePosition(selectedPosition.id, {
                                conditions: selectedPosition.conditions.map((c, i) => (i === index ? { ...c, severity: value as SeverityLevel } : c)),
                              } as Partial<T>)
                            }
                          >
                            <SelectTrigger className="w-full hover-border-primary">
                              <SelectValue placeholder="Severity Level" />
                            </SelectTrigger>
                            <SelectContent className="bg-block">
                              {severityOptions.map((opt) => (
                                <div key={opt.value} className="hover-border-primary hover-text-primary">
                                  <SelectItem value={opt.value}>{opt.label}</SelectItem>
                                </div>
                              ))}
                            </SelectContent>
                          </Select>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="icon" className="h-8 w-8 p-0 ml-1 hover-text-primary">
                                  <Info size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs bg-block p-3 border border-theme-primary">
                                <p className="text-sm">
                                  Severity level is used for visual indication only. It helps you categorize alerts by importance but does not affect
                                  notification delivery or priority.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        {/* Remove */}
                        {selectedPosition.conditions.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              updatePosition(selectedPosition.id, {
                                conditions: selectedPosition.conditions.filter((_, i) => i !== index),
                              } as Partial<T>)
                            }
                            className="col-span-1 text-red-500 h-8 w-8"
                          >
                            <X size={16} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <NotificationFrequencySection
                notificationFrequency={selectedPosition.notificationFrequency}
                setNotificationFrequency={(freq) => updatePosition(selectedPosition.id, { notificationFrequency: freq } as Partial<T>)}
              />

              <div className="mt-8">
                <DeliveryChannelsCard
                  channels={positionChannels[selectedPosition.id] || []}
                  addChannel={addPositionChannel}
                  updateChannel={updatePositionChannel}
                  removeChannel={removePositionChannel}
                  errors={{ channels: errors[selectedPosition.id]?.channels }}
                  session={session}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onSwitchToPositions} className="border hover-border-primary mr-2">
            Back
          </Button>
          <Button
            className="border text-primary-color hover-border-body"
            onClick={modalType === 'GENERAL' ? handleCreatePositionAlert : handleCreatePersonalizedComparisonAlert}
            disabled={modalType === 'GENERAL' ? creatingPositionAlert : creatingComparisonAlert}
          >
            {modalType === 'GENERAL'
              ? creatingPositionAlert
                ? 'Creating...'
                : 'Create Personalized Alert'
              : creatingComparisonAlert
              ? 'Creating...'
              : 'Create Comparison Alert'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
