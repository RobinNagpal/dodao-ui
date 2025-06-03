'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, Info, Plus, X } from 'lucide-react';
import { type Condition, type ConditionType, NotificationFrequency, type SeverityLevel, severityOptions } from '@/types/alerts';
import { NotificationFrequencySection } from './';

interface ConditionSettingsCardProps {
  conditions: Condition[];
  addCondition: () => void;
  updateCondition: (idx: number, field: keyof Condition, val: string) => void;
  removeCondition: (idx: number) => void;
  notificationFrequency: string;
  setNotificationFrequency: (frequency: NotificationFrequency) => void;
  errors: {
    conditions?: string[];
  };
}

export default function ConditionSettingsCard({
  conditions,
  addCondition,
  updateCondition,
  removeCondition,
  notificationFrequency,
  setNotificationFrequency,
  errors,
}: ConditionSettingsCardProps) {
  // Get contextual message for condition type
  const getConditionMessage = (conditionType: ConditionType) => {
    switch (conditionType) {
      case 'APR_RISE_ABOVE':
        return 'Alert when APR exceeds your set threshold (e.g., alert when APR goes above 5%)';
      case 'APR_FALLS_BELOW':
        return 'Alert when APR drops under your set threshold (e.g., alert when APR goes below 2%)';
      case 'APR_OUTSIDE_RANGE':
        return 'Alert when APR moves outside your specified range (e.g., alert when APR is below 3% or above 6%)';
      default:
        return 'Select a condition type to see its description';
    }
  };

  return (
    <Card className="mb-6 border-theme-primary bg-block border-primary-color">
      <CardHeader className="pb-1 flex flex-row items-center justify-between">
        <CardTitle className="text-lg text-theme-primary">Condition Settings</CardTitle>
        <Button size="sm" onClick={addCondition} className="text-theme-primary border border-theme-primary hover-border-primary hover-text-primary">
          <Plus size={16} className="mr-1" /> Add Condition
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-theme-muted mb-4">
          Define the conditions when you want to be alerted about market changes. You will receive an alert through the selected channel if any of the set
          conditions are met for any of the selected markets.
        </p>

        {/* Conditions List */}
        {conditions.map((cond, i) => (
          <div key={i} className="my-2">
            <div className="">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-1 flex items-center text-theme-muted">
                  <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0 rounded-full text-primary-color">
                    {i + 1}
                  </Badge>
                </div>

                {/* Type */}
                <div className="col-span-3">
                  <Select value={cond.conditionType} onValueChange={(value) => updateCondition(i, 'conditionType', value as ConditionType)}>
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
                        onChange={(e) => updateCondition(i, 'thresholdLow', e.target.value)}
                        className={`border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                          errors.conditions && errors.conditions[i] ? 'border-red-500' : ''
                        }`}
                      />
                      <Input
                        type="text"
                        placeholder="Max (e.g., 6)"
                        value={cond.thresholdHigh || ''}
                        onChange={(e) => updateCondition(i, 'thresholdHigh', e.target.value)}
                        className={`border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                          errors.conditions && errors.conditions[i] ? 'border-red-500' : ''
                        }`}
                      />
                      <span className="text-theme-muted whitespace-nowrap flex-shrink-0">APR</span>
                    </div>
                    {errors.conditions && errors.conditions[i] && (
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
                        onChange={(e) => updateCondition(i, 'thresholdValue', e.target.value)}
                        className={`border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                          errors.conditions && errors.conditions[i] ? 'border-red-500' : ''
                        }`}
                      />
                      <span className="ml-2 text-theme-muted whitespace-nowrap flex-shrink-0">APR</span>
                    </div>
                    {errors.conditions && errors.conditions[i] && (
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
                    onValueChange={(value) => updateCondition(i, 'severity', value as SeverityLevel)}
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
                {conditions.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeCondition(i)} className="col-span-1 text-red-500 h-8 w-8">
                    <X size={16} />
                  </Button>
                )}
              </div>
              {/* Contextual Message */}
              <div className="px-3 py-2">
                <p className="text-sm text-theme-muted">
                  <span className="text-primary-color font-medium">Condition {i + 1}:</span> {getConditionMessage(cond.conditionType)}
                </p>
              </div>
            </div>
          </div>
        ))}

        <hr></hr>

        {/* Notification Frequency */}
        <NotificationFrequencySection
          notificationFrequency={notificationFrequency as NotificationFrequency}
          setNotificationFrequency={setNotificationFrequency}
        />
      </CardContent>
    </Card>
  );
}
