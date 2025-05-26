'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, Info, Plus, X } from 'lucide-react';
import { type ConditionType, type SeverityLevel, severityOptions, type NotificationFrequency } from '@/types/alerts';
import { NotificationFrequencySection } from './';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
  errors?: {
    conditions?: string[];
  };
}

export default function PersonalizedComparisonPositionCard({ position, updatePosition, errors }: PersonalizedComparisonPositionCardProps) {
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

  // Get contextual message for condition type
  const getConditionMessage = (conditionType: ConditionType) => {
    switch (conditionType) {
      case 'RATE_DIFF_ABOVE':
        return 'Alert when Compound rate is higher than competitor by your threshold (for supply comparison)';
      case 'RATE_DIFF_BELOW':
        return 'Alert when Compound rate is lower than competitor by your threshold (for borrow comparison)';
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
                  {position.market} on {position.chain} vs {position.platform}
                </div>
                <p className="text-sm text-theme-muted">
                  Current {position.platform} APR: {position.rate}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {position.conditions.length} condition{position.conditions.length !== 1 ? 's' : ''}
              </Badge>
            </div>
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
              Define when you want to be alerted about rate differences. You will receive an alert if <strong>any</strong> of the following conditions are met.
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
                            <SelectItem value="RATE_DIFF_ABOVE" className="hover:text-primary-color">
                              Rate difference above threshold
                            </SelectItem>
                          </div>
                          <div className="hover-border-primary hover-text-primary">
                            <SelectItem value="RATE_DIFF_BELOW">Rate difference below threshold</SelectItem>
                          </div>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Thresholds */}
                    <div className="col-span-4 flex flex-col">
                      <div className="flex items-center">
                        <Input
                          type="text"
                          placeholder={position.actionType === 'SUPPLY' ? 'Threshold (e.g., 1.2)' : 'Threshold (e.g., 0.5)'}
                          value={cond.thresholdValue || ''}
                          onChange={(e) => updateCondition(cond.id, 'thresholdValue', e.target.value)}
                          className={`border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                            errors?.conditions && errors.conditions[i] ? 'border-red-500' : ''
                          }`}
                        />
                        <span className="ml-2 text-theme-muted whitespace-nowrap flex-shrink-0">% APR difference</span>
                      </div>
                      {errors?.conditions && errors.conditions[i] && (
                        <div className="mt-1 flex items-center text-red-500 text-sm">
                          <AlertCircle size={14} className="mr-1" />
                          <span>{errors.conditions[i]}</span>
                        </div>
                      )}
                    </div>

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
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
