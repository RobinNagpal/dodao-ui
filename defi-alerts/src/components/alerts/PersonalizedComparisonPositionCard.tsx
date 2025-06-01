'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Plus, X } from 'lucide-react';
import { type ConditionType, type SeverityLevel, severityOptions, type NotificationFrequency, Channel } from '@/types/alerts';
import { NotificationFrequencySection, DeliveryChannelsCard } from './';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';
import { toSentenceCase } from '@/utils/getSentenceCase';

export interface PersonalizedComparisonPosition {
  id: string;
  platform: string;
  chain: string;
  market: string;
  rate: string;
  actionType: 'SUPPLY' | 'BORROW';
  notificationFrequency: NotificationFrequency;
  conditions: Array<{
    id: string;
    conditionType: ConditionType;
    severity: SeverityLevel;
    thresholdValue?: string;
    thresholdLow?: string;
    thresholdHigh?: string;
  }>;
}

interface PersonalizedComparisonPositionCardProps {
  position: PersonalizedComparisonPosition;
  updatePosition: (positionId: string, updates: Partial<PersonalizedComparisonPosition>) => void;
  onCreateAlert: (positionId: string) => void;
  isSubmitting: boolean;
  errors?: {
    conditions?: string[];
    channels?: string[];
  };
  channels: Channel[];
  updateChannel: (idx: number, field: keyof Channel, val: string) => void;
  addChannel: () => void;
  removeChannel: (idx: number) => void;
  session: DoDAOSession;
}

export default function PersonalizedComparisonPositionCard({
  position,
  updatePosition,
  errors,
  onCreateAlert,
  isSubmitting,
  channels,
  addChannel,
  updateChannel,
  removeChannel,
  session,
}: PersonalizedComparisonPositionCardProps) {
  const addCondition = () => {
    const newCondition = {
      id: `condition-${Date.now()}`,
      conditionType: position.actionType === 'SUPPLY' ? ('RATE_DIFF_ABOVE' as ConditionType) : ('RATE_DIFF_BELOW' as ConditionType),
      severity: 'NONE' as SeverityLevel,
      thresholdValue: '',
    };
    updatePosition(position.id, {
      conditions: [...position.conditions, newCondition],
    });
  };

  const updateCondition = (conditionId: string, field: string, value: string) => {
    const updatedConditions = position.conditions.map((cond) => (cond.id === conditionId ? { ...cond, [field]: value } : cond));
    updatePosition(position.id, { conditions: updatedConditions });
  };

  const removeCondition = (conditionId: string) => {
    const updatedConditions = position.conditions.filter((cond) => cond.id !== conditionId);
    updatePosition(position.id, { conditions: updatedConditions });
  };

  const updateNotificationFrequency = (frequency: NotificationFrequency) => {
    updatePosition(position.id, { notificationFrequency: frequency });
  };

  // Get contextual message for comparison logic
  const getComparisonMessage = (actionType: 'SUPPLY' | 'BORROW') => {
    if (actionType === 'SUPPLY') {
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

  return (
    <Accordion type="single" collapsible className="mb-6">
      <AccordionItem value={position.id} className="border-theme-primary bg-block border-primary-color rounded-lg">
        <AccordionTrigger className="px-6 py-4 hover:bg-theme-secondary transition-colors">
          <div className="flex items-center justify-between w-full mr-4">
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-primary-color border-primary-color">
                {position.actionType}
              </Badge>
              <div className="text-left">
                <div className="text-lg font-semibold text-theme-primary">
                  {position.market} on {position.chain} - {toSentenceCase(position.platform)}
                </div>
                <p className="text-sm text-theme-muted">
                  Current {toSentenceCase(position.platform)} APR: {position.rate}
                </p>
              </div>
            </div>
            <span className="text-primary-color">Configure Alert</span>
          </div>
        </AccordionTrigger>

        <AccordionContent className="px-6 pb-6">
          <div className="border-t border-theme-primary pt-4">
            {/* Header with Add Threshold Button */}
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-medium text-theme-primary">Rate Difference Thresholds</h4>
              <Button size="sm" onClick={addCondition} className="text-theme-primary border border-theme-primary hover-border-primary hover-text-primary">
                <Plus size={20} className="mr-1" /> Add Threshold
              </Button>
            </div>

            <p className="text-sm text-theme-muted mb-4">
              Set the minimum rate difference required to trigger an alert. You’ll be notified when Compound becomes competitively better by your specified
              threshold.
            </p>

            {/* Single Contextual Message for the action type */}
            <div className="mb-6 p-3 bg-theme-secondary rounded-lg border border-theme-primary">
              <p className="text-sm text-theme-muted">
                <span className="text-primary-color font-medium">How thresholds work:</span> {getComparisonMessage(position.actionType)}
              </p>
            </div>

            {/* Thresholds List */}
            {position.conditions.map((cond, i) => (
              <div key={cond.id} className="grid grid-cols-12 gap-4 mb-4 items-center border-t border-primary-color pt-4">
                <div className="col-span-1 flex items-center justify-center text-theme-muted">
                  <Badge variant="outline" className="h-8 w-8 flex items-center justify-center p-0 rounded-full text-primary-color">
                    {i + 1}
                  </Badge>
                </div>

                <div className="col-span-5 flex flex-col">
                  <div className="flex items-center">
                    <Input
                      type="text"
                      value={cond.thresholdValue || ''}
                      onChange={(e) => updateCondition(cond.id, 'thresholdValue', e.target.value)}
                      className={`w-22 border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                        errors?.conditions && errors.conditions[i] ? 'border-red-500' : ''
                      }`}
                      placeholder={position.actionType === 'SUPPLY' ? 'Threshold (e.g., 1.2)' : 'Threshold (e.g., 0.5)'}
                    />
                    <span className="ml-2 text-theme-muted">APR difference</span>
                  </div>
                  {errors?.conditions && errors.conditions[i] && (
                    <div className="mt-1 flex items-center text-red-500 text-sm">
                      <AlertCircle size={20} className="mr-2 flex-shrink-0" />
                      <span>{errors.conditions[i]}</span>
                    </div>
                  )}
                </div>

                <div className="col-span-5">
                  <Select
                    value={cond.severity === 'NONE' ? undefined : cond.severity}
                    onValueChange={(value) => updateCondition(cond.id, 'severity', value as SeverityLevel)}
                  >
                    <SelectTrigger className="w-full hover-border-primary">
                      <SelectValue placeholder="Severity Level" />
                    </SelectTrigger>
                    <SelectContent className="bg-block">
                      {severityOptions.map((opt) => (
                        <div key={opt.value} className="hover-border-primary hover-text-primary">
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {position.conditions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCondition(cond.id)}
                    className="col-span-1 text-red-500 h-10 w-10 flex items-center justify-center"
                  >
                    <X size={20} />
                  </Button>
                )}
              </div>
            ))}

            {/* Notification Frequency */}
            <NotificationFrequencySection notificationFrequency={position.notificationFrequency} setNotificationFrequency={updateNotificationFrequency} />

            {/* Delivery Channel Settings */}
            <div className="mt-8">
              <DeliveryChannelsCard
                channels={channels}
                addChannel={addChannel}
                updateChannel={updateChannel}
                removeChannel={removeChannel}
                errors={{ channels: errors?.channels }}
                session={session}
              />
            </div>

            {/* Create Alert Button */}
            <div className="mt-6 flex justify-end">
              <Button onClick={() => onCreateAlert(position.id)} className="border text-primary-color hover-border-body" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Personalized Alert'}
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
