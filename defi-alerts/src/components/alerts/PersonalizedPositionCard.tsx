'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Info, Plus, X } from 'lucide-react';
import { type ConditionType, type SeverityLevel, severityOptions, type NotificationFrequency, Channel } from '@/types/alerts';
import { NotificationFrequencySection, DeliveryChannelsCard } from './';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';

export interface PersonalizedPosition {
  id: string;
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

interface PersonalizedPositionCardProps {
  position: PersonalizedPosition;
  updatePosition: (positionId: string, updates: Partial<PersonalizedPosition>) => void;
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

export default function PersonalizedPositionCard({
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
}: PersonalizedPositionCardProps) {
  const addCondition = () => {
    const newCondition = {
      id: `condition-${Date.now()}`,
      conditionType: 'APR_RISE_ABOVE' as ConditionType,
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
                  {position.market} on {position.chain}
                </div>
                <p className="text-sm text-theme-muted">Current APR: {position.rate}</p>
              </div>
            </div>
            <span className="text-primary-color">Configure Alert</span>
          </div>
        </AccordionTrigger>

        <AccordionContent className="px-6 pb-6">
          <div className="border-t border-theme-primary pt-4">
            {/* Header with Add Condition Button */}
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-medium text-theme-primary">Condition Settings</h4>
              <Button size="sm" onClick={addCondition} className="text-theme-primary border border-theme-primary hover-border-primary hover-text-primary">
                <Plus size={16} className="mr-1" /> Add Condition
              </Button>
            </div>

            <p className="text-sm text-theme-muted mb-4">
              Define when you want to be alerted about changes to this position. You will receive an alert if <strong>any</strong> of the following conditions
              are met.
            </p>

            {/* Conditions List */}
            {position.conditions.map((cond, i) => (
              <div key={cond.id} className="mb-6">
                <div className="border-t border-primary-color pt-4">
                  {/* Contextual Message */}
                  <div className="mb-4 p-3 bg-theme-secondary rounded-lg border border-theme-primary">
                    <p className="text-sm text-theme-muted">
                      <span className="text-primary-color font-medium">Condition {i + 1}:</span> {getConditionMessage(cond.conditionType)}
                    </p>
                  </div>

                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1 flex items-center text-theme-muted">
                      <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0 rounded-full text-primary-color">
                        {i + 1}
                      </Badge>
                    </div>

                    {/* Type */}
                    <div className="col-span-3">
                      <Select value={cond.conditionType} onValueChange={(value) => updateCondition(cond.id, 'conditionType', value)}>
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

                    {/* Thresholds */}
                    {cond.conditionType === 'APR_OUTSIDE_RANGE' ? (
                      <div className="col-span-4 flex flex-col">
                        <div className="flex items-center space-x-2">
                          <Input
                            type="text"
                            placeholder="Min (e.g., 3)"
                            value={cond.thresholdLow || ''}
                            onChange={(e) => updateCondition(cond.id, 'thresholdLow', e.target.value)}
                            className={`border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                              errors?.conditions && errors.conditions[i] ? 'border-red-500' : ''
                            }`}
                          />
                          <Input
                            type="text"
                            placeholder="Max (e.g., 6)"
                            value={cond.thresholdHigh || ''}
                            onChange={(e) => updateCondition(cond.id, 'thresholdHigh', e.target.value)}
                            className={`border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                              errors?.conditions && errors.conditions[i] ? 'border-red-500' : ''
                            }`}
                          />
                          <span className="text-theme-muted whitespace-nowrap flex-shrink-0">APR</span>
                        </div>
                        {errors?.conditions && errors.conditions[i] && (
                          <div className="mt-1 flex items-center text-red-500 text-sm">
                            <AlertCircle size={14} className="mr-1" />
                            <span>{errors.conditions[i]}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="col-span-4 flex flex-col">
                        <div className="flex items-center">
                          <Input
                            type="text"
                            placeholder={
                              cond.conditionType === 'APR_RISE_ABOVE'
                                ? 'Threshold (e.g., 5.0)'
                                : cond.conditionType === 'APR_FALLS_BELOW'
                                ? 'Threshold (e.g., 2.0)'
                                : 'Threshold value'
                            }
                            value={cond.thresholdValue || ''}
                            onChange={(e) => updateCondition(cond.id, 'thresholdValue', e.target.value)}
                            className={`border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                              errors?.conditions && errors.conditions[i] ? 'border-red-500' : ''
                            }`}
                          />
                          <span className="ml-2 text-theme-muted whitespace-nowrap flex-shrink-0">APR</span>
                        </div>
                        {errors?.conditions && errors.conditions[i] && (
                          <div className="mt-1 flex items-center text-red-500 text-sm">
                            <AlertCircle size={14} className="mr-1" />
                            <span>{errors.conditions[i]}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Severity */}
                    <div className="col-span-3 flex items-center">
                      <Select
                        value={cond.severity === 'NONE' ? undefined : cond.severity}
                        onValueChange={(value) => updateCondition(cond.id, 'severity', value)}
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
                              Severity level is used for visual indication only. It helps you categorize alerts by importance but does not affect notification
                              delivery or priority.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {/* Remove */}
                    {position.conditions.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeCondition(cond.id)} className="col-span-1 text-red-500 h-8 w-8">
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                </div>
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
