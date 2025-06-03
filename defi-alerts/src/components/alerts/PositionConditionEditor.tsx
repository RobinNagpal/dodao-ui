'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, Info, Plus, X } from 'lucide-react';
import { type Condition, type ConditionType, type SeverityLevel, severityOptions } from '@/types/alerts';
import { toSentenceCase } from '@/utils/getSentenceCase';

// Define the base condition interface
export interface BaseCondition {
  id: string;
  severity: SeverityLevel;
}

export type MarketConditionType = 'APR_RISE_ABOVE' | 'APR_FALLS_BELOW' | 'APR_OUTSIDE_RANGE';

// Market condition interface
export interface MarketCondition extends BaseCondition {
  conditionType: MarketConditionType;
  thresholdValue?: string;
  thresholdLow?: string;
  thresholdHigh?: string;
}

type ComparisonConditionType = 'RATE_DIFF_ABOVE' | 'RATE_DIFF_BELOW';

// Comparison condition interface
export interface ComparisonCondition extends BaseCondition {
  conditionType: ComparisonConditionType;
  thresholdValue: string;
}

// Union type for all condition types
export type PositionCondition = MarketCondition | ComparisonCondition;

// Props for the component
export interface PositionConditionEditorProps {
  // The type of editor: 'market' for APR conditions, 'comparison' for rate difference conditions
  editorType: 'market' | 'comparison';

  // For comparison conditions, the action type determines the condition type and messaging
  actionType?: 'SUPPLY' | 'BORROW';

  // For comparison conditions, the platform name is used in the messaging
  platformName?: string;

  // The current rate (for comparison conditions)
  currentRate?: string;

  // The conditions being edited
  conditions: PositionCondition[];

  // Function to add a new condition
  addCondition: () => void;

  // Function to update a condition
  updateCondition: (id: string, field: string, value: string) => void;

  // Function to remove a condition
  removeCondition: (id: string) => void;

  // Validation errors
  errors?: {
    conditions?: string[];
  };
}

export default function PositionConditionEditor({
  editorType,
  actionType = 'SUPPLY',
  platformName = '',
  currentRate = '',
  conditions,
  addCondition,
  updateCondition,
  removeCondition,
  errors,
}: PositionConditionEditorProps) {
  // Get contextual message for market condition type
  const getMarketConditionMessage = (conditionType: ConditionType) => {
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

  // Get contextual message for comparison condition
  const getComparisonMessage = () => {
    if (actionType === 'SUPPLY') {
      if (platformName && currentRate) {
        return `If ${toSentenceCase(
          platformName
        )} offers ${currentRate} APY and you set 1.2% threshold, you'll be alerted when Compound's supply APR reaches ${(
          parseFloat(currentRate.replace('%', '')) + 1.2
        ).toFixed(1)}% (${toSentenceCase(platformName)} rate + Your set threshold)`;
      }
      return 'Set a threshold to be alerted when Compound supply APR exceeds other platforms by that amount';
    } else {
      if (platformName && currentRate) {
        return `If ${toSentenceCase(
          platformName
        )} charges ${currentRate} APY and you set 0.5% threshold, you'll be alerted when Compound's borrow APR drops to ${(
          parseFloat(currentRate.replace('%', '')) - 0.5
        ).toFixed(1)}% (${toSentenceCase(platformName)} rate - Your set threshold)`;
      }
      return 'Set a threshold to be alerted when Compound borrow APR is lower than other platforms by that amount';
    }
  };

  return (
    <Card className="mb-6 border-theme-primary bg-block border-primary-color">
      <CardHeader className="pb-1 flex flex-row items-center justify-between">
        <CardTitle className="text-lg text-theme-primary">{editorType === 'market' ? 'Condition Settings' : 'Rate Difference Thresholds'}</CardTitle>
        <Button size="sm" onClick={addCondition} className="text-theme-primary border border-theme-primary hover-border-primary hover-text-primary">
          <Plus size={16} className="mr-1" />
          {editorType === 'market' ? 'Add Condition' : 'Add Threshold'}
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-theme-muted mb-4">
          {editorType === 'market'
            ? 'Define when you want to be alerted about changes to this position. You will receive an alert if any of the set conditions are met.'
            : actionType === 'SUPPLY'
            ? 'Notify when Compound supply APR > other APR by threshold.'
            : 'Notify when Compound borrow APR < other APR by threshold.'}
        </p>

        {/* Contextual message for comparison conditions */}
        {editorType === 'comparison' && (
          <div className="mb-6 p-3 bg-theme-secondary rounded-lg border border-theme-primary">
            <p className="text-sm text-theme-muted">
              <span className="text-primary-color font-medium">How thresholds work:</span> {getComparisonMessage()}
            </p>
          </div>
        )}

        {/* Render each condition */}
        {conditions.map((condition, index) => (
          <div key={condition.id} className="grid grid-cols-12 gap-4 mb-4 items-center border-t border-primary-color pt-4">
            <div className="col-span-1 flex items-center text-theme-muted">
              <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0 rounded-full text-primary-color">
                {index + 1}
              </Badge>
            </div>

            {editorType === 'market' ? (
              <>
                {/* Market Condition Type */}
                <div className="col-span-3">
                  <Select value={condition.conditionType} onValueChange={(value) => updateCondition(condition.id, 'conditionType', value)}>
                    <SelectTrigger className="w-full hover-border-primary">
                      <SelectValue placeholder="Select condition type" />
                    </SelectTrigger>
                    <SelectContent className="bg-block">
                      <div className="hover-border-primary hover-text-primary">
                        <SelectItem value="APR_RISE_ABOVE">APR rises above threshold</SelectItem>
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

                {/* Market Condition Thresholds */}
                {condition.conditionType === 'APR_OUTSIDE_RANGE' ? (
                  <div className="col-span-4 flex flex-col">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="text"
                        placeholder="Min (e.g., 3)"
                        value={condition.thresholdLow || ''}
                        onChange={(e) => updateCondition(condition.id, 'thresholdLow', e.target.value)}
                        className={`border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                          errors?.conditions && errors.conditions[index] ? 'border-red-500' : ''
                        }`}
                      />
                      <Input
                        type="text"
                        placeholder="Max (e.g., 6)"
                        value={condition.thresholdHigh || ''}
                        onChange={(e) => updateCondition(condition.id, 'thresholdHigh', e.target.value)}
                        className={`border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                          errors?.conditions && errors.conditions[index] ? 'border-red-500' : ''
                        }`}
                      />
                      <span className="text-theme-muted whitespace-nowrap flex-shrink-0">APR</span>
                    </div>
                    {errors?.conditions && errors.conditions[index] && (
                      <div className="mt-1 flex items-center text-red-500 text-sm">
                        <AlertCircle size={14} className="mr-1" />
                        <span>{errors.conditions[index]}</span>
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
                        onChange={(e) => updateCondition(condition.id, 'thresholdValue', e.target.value)}
                        className={`border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                          errors?.conditions && errors.conditions[index] ? 'border-red-500' : ''
                        }`}
                      />
                      <span className="ml-2 text-theme-muted whitespace-nowrap flex-shrink-0">APR</span>
                    </div>
                    {errors?.conditions && errors.conditions[index] && (
                      <div className="mt-1 flex items-center text-red-500 text-sm">
                        <AlertCircle size={14} className="mr-1" />
                        <span>{errors.conditions[index]}</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              // Comparison Condition Threshold
              <div className="col-span-5 flex flex-col">
                <div className="flex items-center">
                  <Input
                    type="text"
                    value={condition.thresholdValue || ''}
                    onChange={(e) => updateCondition(condition.id, 'thresholdValue', e.target.value)}
                    className={`w-22 border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                      errors?.conditions && errors.conditions[index] ? 'border-red-500' : ''
                    }`}
                    placeholder={actionType === 'SUPPLY' ? 'Threshold (e.g., 1.2)' : 'Threshold (e.g., 0.5)'}
                  />
                  <span className="ml-2 text-theme-muted">% APR difference</span>
                </div>
                {errors?.conditions && errors.conditions[index] && (
                  <div className="mt-1 flex items-center text-red-500 text-sm">
                    <AlertCircle size={14} className="mr-1" />
                    <span>{errors.conditions[index]}</span>
                  </div>
                )}
              </div>
            )}

            {/* Severity for both types */}
            <div className="col-span-5">
              <Select
                value={condition.severity === 'NONE' ? undefined : condition.severity}
                onValueChange={(value) => updateCondition(condition.id, 'severity', value as SeverityLevel)}
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
              {editorType === 'market' && (
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
              )}
            </div>

            {/* Remove button for both types */}
            {conditions.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCondition(condition.id)}
                className="col-span-1 text-red-500 h-10 w-10 flex items-center justify-center"
              >
                <X size={20} />
              </Button>
            )}

            {/* Contextual message for market conditions */}
            {editorType === 'market' && (
              <div className="col-span-11 col-start-2 px-3 py-2">
                <p className="text-sm text-theme-muted">
                  <span className="text-primary-color font-medium">Condition {index + 1}:</span> {getMarketConditionMessage(condition.conditionType)}
                </p>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
