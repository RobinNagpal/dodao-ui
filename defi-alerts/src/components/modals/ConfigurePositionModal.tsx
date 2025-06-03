'use client';

import { PersonalizedComparisonAlertPayload, PersonalizedComparisonAlertResponse } from '@/app/api/alerts/create/personalized-comparison/route';
import { CreatePersonalizedAlertPayload, PersonalizedAlertCreationResponse } from '@/app/api/alerts/create/personalized-market/route';
import { DeliveryChannelsCard, NotificationFrequencySection, PositionConditionEditor } from '@/components/alerts';
import { ComparisonCondition, MarketCondition } from '@/components/alerts/PositionConditionEditor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type Channel, type ConditionType, type NotificationFrequency, type SeverityLevel } from '@/types/alerts';
import { toSentenceCase } from '@/utils/getSentenceCase';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { AlertActionType, AlertCategory, ConditionType as PrismaConditionType, DeliveryChannelType } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { BasePosition, WalletComparisonPosition } from './types';

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
  onCreate: () => void;
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
  onCreate,
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
      onCreate();
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
      onCreate();
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
                    Current {modalType === 'GENERAL' ? 'APR' : `${toSentenceCase((selectedPosition as unknown as WalletComparisonPosition).platform)} APY`}:{' '}
                    {selectedPosition.rate}
                  </span>
                </div>
              </div>

              <div className="p-5 bg-theme-secondary rounded-lg border border-primary-color">
                <PositionConditionEditor
                  editorType={modalType === 'GENERAL' ? 'market' : 'comparison'}
                  actionType={selectedPosition.actionType}
                  platformName={modalType === 'COMPARISON' ? (selectedPosition as unknown as WalletComparisonPosition).platform : undefined}
                  currentRate={modalType === 'COMPARISON' ? (selectedPosition as unknown as WalletComparisonPosition).rate : undefined}
                  conditions={
                    modalType === 'COMPARISON' ? (selectedPosition.conditions as ComparisonCondition[]) : (selectedPosition.conditions as MarketCondition[])
                  }
                  addCondition={() => {
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
                  updateCondition={(id, field, value) => {
                    console.log(`Updating condition ${id} with ${field} = ${value}`);
                    const updates = {
                      conditions: selectedPosition.conditions.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
                    } as Partial<T>;

                    console.log(updates);
                    updatePosition(selectedPosition.id, updates);
                  }}
                  removeCondition={(id) => {
                    updatePosition(selectedPosition.id, {
                      conditions: selectedPosition.conditions.filter((c) => c.id !== id),
                    } as Partial<T>);
                  }}
                  errors={errors[selectedPosition.id]}
                />
                <hr className="my-4"></hr>
                <NotificationFrequencySection
                  notificationFrequency={selectedPosition.notificationFrequency}
                  setNotificationFrequency={(freq) => updatePosition(selectedPosition.id, { notificationFrequency: freq } as Partial<T>)}
                />
              </div>

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
