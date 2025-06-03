'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { NotificationFrequencySection, DeliveryChannelsCard } from '@/components/alerts';
import { type Channel, type NotificationFrequency, type SeverityLevel, type Alert } from '@/types/alerts';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';
import PositionConditionEditor from './PositionConditionEditor';
import type { PositionCondition, MarketCondition, ComparisonCondition } from './PositionConditionEditor';
import { toSentenceCase } from '@/utils/getSentenceCase';

// Base position interface
export interface BasePosition {
  id: string;
  actionType: 'SUPPLY' | 'BORROW';
  notificationFrequency: NotificationFrequency;
  conditions: PositionCondition[];
}

// Market position interface
export interface MarketPosition extends BasePosition {
  chain: string;
  assetSymbol: string;
  assetAddress: string;
  rate: string;
  walletAddress?: string;
}

// Comparison position interface
export interface ComparisonPosition extends BasePosition {
  chain: string;
  market: string;
  platform: string;
  rate: string;
}

// Union type for all position types
export type Position = MarketPosition | ComparisonPosition;

// Props for the component
export interface PositionEditorProps {
  // The type of editor: 'create' or 'edit'
  mode: 'create' | 'edit';

  // The type of position: 'market' or 'comparison'
  positionType: 'market' | 'comparison';

  // The position being edited (required for edit mode)
  position?: Position;

  // The alert being edited (required for edit mode)
  alert?: Alert;

  // The alert ID (required for edit mode)
  alertId?: string;

  // Function to update the position (required for create mode)
  updatePosition?: (id: string, updates: Partial<Position>) => void;

  // Function to create/update the alert
  onSubmit: (position: Position, channels: Channel[]) => void;

  // Whether the form is submitting
  isSubmitting?: boolean;

  // The user session
  session: DoDAOSession;

  // Function to navigate back
  onBack: () => void;
}

export default function PositionEditor({
  mode,
  positionType,
  position,
  alert,
  alertId,
  updatePosition,
  onSubmit,
  isSubmitting = false,
  session,
  onBack,
}: PositionEditorProps) {
  // State for the position
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);

  // State for delivery channels
  const [channels, setChannels] = useState<Channel[]>([{ channelType: 'EMAIL', email: session?.username || '' }]);

  // State for validation errors
  const [errors, setErrors] = useState<{
    conditions?: string[];
    channels?: string[];
  }>({});

  // State for alert status (only for edit mode)
  const [status, setStatus] = useState<'ACTIVE' | 'PAUSED'>('ACTIVE');

  // Initialize state from props
  useEffect(() => {
    if (mode === 'edit' && alert) {
      setStatus(alert.status);

      // Set channels
      if (alert.deliveryChannels?.length) {
        setChannels(
          alert.deliveryChannels.map((c) => ({
            channelType: c.channelType,
            email: c.email || session?.username || '',
            webhookUrl: c.webhookUrl || '',
          }))
        );
      }
    }

    if (position) {
      setCurrentPosition(position);
    }
  }, [mode, alert, position, session?.username]);

  // If no position is available, show loading or error state
  if (!currentPosition) {
    return <div>Loading position data...</div>;
  }

  // Channel functions
  const addChannel = () => {
    setChannels((prev) => [...prev, { channelType: 'EMAIL', email: session?.username || '' }]);
  };

  const updateChannel = (idx: number, field: keyof Channel, val: string) => {
    setChannels((prev) => prev.map((ch, i) => (i === idx ? { ...ch, [field]: val } : ch)));
  };

  const removeChannel = (idx: number) => {
    setChannels((prev) => prev.filter((_, i) => i !== idx));
  };

  // Condition functions
  const addCondition = () => {
    const newCondition =
      positionType === 'market'
        ? ({
            id: `condition-${Date.now()}`,
            conditionType: 'APR_RISE_ABOVE' as const,
            severity: 'NONE' as SeverityLevel,
            thresholdValue: '',
          } as MarketCondition)
        : ({
            id: `condition-${Date.now()}`,
            conditionType: currentPosition.actionType === 'SUPPLY' ? ('RATE_DIFF_ABOVE' as const) : ('RATE_DIFF_BELOW' as const),
            severity: 'NONE' as SeverityLevel,
            thresholdValue: '',
          } as ComparisonCondition);

    if (mode === 'create' && updatePosition) {
      updatePosition(currentPosition.id, {
        conditions: [...currentPosition.conditions, newCondition],
      });
    } else {
      setCurrentPosition({
        ...currentPosition,
        conditions: [...currentPosition.conditions, newCondition],
      });
    }
  };

  const updateCondition = (id: string, field: string, value: string) => {
    const updatedConditions = currentPosition.conditions.map((cond) => (cond.id === id ? { ...cond, [field]: value } : cond));

    if (mode === 'create' && updatePosition) {
      updatePosition(currentPosition.id, { conditions: updatedConditions });
    } else {
      setCurrentPosition({
        ...currentPosition,
        conditions: updatedConditions,
      });
    }
  };

  const removeCondition = (id: string) => {
    const updatedConditions = currentPosition.conditions.filter((cond) => cond.id !== id);

    if (mode === 'create' && updatePosition) {
      updatePosition(currentPosition.id, { conditions: updatedConditions });
    } else {
      setCurrentPosition({
        ...currentPosition,
        conditions: updatedConditions,
      });
    }
  };

  // Update notification frequency
  const updateNotificationFrequency = (frequency: NotificationFrequency) => {
    if (mode === 'create' && updatePosition) {
      updatePosition(currentPosition.id, { notificationFrequency: frequency });
    } else {
      setCurrentPosition({
        ...currentPosition,
        notificationFrequency: frequency,
      });
    }
  };

  // Validate the form
  const validateForm = () => {
    const newErrors: {
      conditions?: string[];
      channels?: string[];
    } = {};

    // Validate conditions
    const conditionErrors: string[] = [];
    currentPosition.conditions.forEach((condition, index) => {
      if ('thresholdLow' in condition && condition.conditionType === 'APR_OUTSIDE_RANGE') {
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
      newErrors.conditions = conditionErrors;
    }

    // Validate channels
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
      newErrors.channels = channelErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    onSubmit(currentPosition, channels);
  };

  // Get position details for display
  const getPositionDetails = () => {
    if (positionType === 'market') {
      const marketPosition = currentPosition as MarketPosition;
      return (
        <>
          <span className="text-theme-primary">
            Chain: {marketPosition.chain} | Market: {marketPosition.assetSymbol}
          </span>
          {marketPosition.walletAddress && (
            <div className="mt-2">
              <span className="text-theme-primary">Wallet Address: {marketPosition.walletAddress}</span>
            </div>
          )}
        </>
      );
    } else {
      const comparisonPosition = currentPosition as ComparisonPosition;
      return (
        <span className="text-theme-primary">
          {comparisonPosition.market} on {comparisonPosition.chain} - {toSentenceCase(comparisonPosition.platform)}
          {comparisonPosition.rate && ` (Current rate: ${comparisonPosition.rate})`}
        </span>
      );
    }
  };

  return (
    <div>
      {/* Position Information */}
      <Card className="mb-6 border-theme-primary bg-block border-primary-color">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg text-theme-primary">Position Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-primary-color border-primary-color">
              {currentPosition.actionType}
            </Badge>
            <div>{getPositionDetails()}</div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Status (only for edit mode) */}
      {mode === 'edit' && (
        <Card className="mb-6 border-theme-primary bg-block border-primary-color">
          <CardHeader className="pb-1">
            <CardTitle className="text-lg text-theme-primary">Alert Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-theme-muted mb-4">Enable or disable this alert.</p>

            <RadioGroup value={status} onValueChange={(v) => setStatus(v as 'ACTIVE' | 'PAUSED')} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ACTIVE" id="active" className="h-4 w-4 border border-default rounded-full radio-checked" />
                <Label htmlFor="active" className="text-theme-primary label-checked">
                  Active
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PAUSED" id="paused" className="h-4 w-4 border border-default rounded-full radio-checked" />
                <Label htmlFor="paused" className="text-theme-primary label-checked">
                  Paused
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Condition Editor */}
      <PositionConditionEditor
        editorType={positionType}
        actionType={currentPosition.actionType}
        platformName={positionType === 'comparison' ? (currentPosition as ComparisonPosition).platform : undefined}
        currentRate={positionType === 'comparison' ? (currentPosition as ComparisonPosition).rate : undefined}
        conditions={currentPosition.conditions}
        addCondition={addCondition}
        updateCondition={updateCondition}
        removeCondition={removeCondition}
        errors={errors}
      />

      {/* Notification Frequency */}
      <Card className="mb-6 border-theme-primary bg-block border-primary-color">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg text-theme-primary">Notification Frequency</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationFrequencySection notificationFrequency={currentPosition.notificationFrequency} setNotificationFrequency={updateNotificationFrequency} />
        </CardContent>
      </Card>

      {/* Delivery Channels */}
      <DeliveryChannelsCard
        channels={channels}
        addChannel={addChannel}
        updateChannel={updateChannel}
        removeChannel={removeChannel}
        errors={{ channels: errors.channels }}
        session={session}
      />

      {/* Action Buttons */}
      <div className="flex justify-end gap-x-5 mt-6">
        <Button onClick={onBack} className="border hover-border-primary">
          Back
        </Button>

        <Button onClick={handleSubmit} className="border text-primary-color hover-border-body" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : mode === 'create' ? 'Create Alert' : 'Update Alert'}
        </Button>
      </div>
    </div>
  );
}
