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
        return 'Alert when interest rate rises above your set threshold (e.g., alert when interest rate goes above 5.00). Enter the absolute interest rate value.';
      case 'APR_FALLS_BELOW':
        return 'Alert when interest rate falls below your set threshold (e.g., alert when interest rate goes below 2.00). Enter the absolute interest rate value.';
      case 'APR_OUTSIDE_RANGE':
        return 'Alert when interest rate moves outside the range of your specified thresholds (e.g., alert when interest rate is below 3.00 or above 6.00). Enter the absolute interest rate values for both minimum and maximum.';
      default:
        return 'Select a condition type to see its description';
    }
  };

  // Get contextual message for comparison condition
  const getComparisonMessage = () => {
    if (actionType === 'SUPPLY') {
      if (platformName && currentRate) {
        const currentRateValue = parseFloat(currentRate.replace('%', ''));
        const thresholdExample = 1.2;
        const resultRate = (currentRateValue + thresholdExample).toFixed(1);

        return `Alert when interest rate difference between Compound and ${toSentenceCase(platformName)} is above your threshold. Example: If ${toSentenceCase(
          platformName
        )} offers ${currentRate} interest rate and you set ${thresholdExample.toFixed(
          1
        )} threshold, you'll be alerted when Compound's supply interest rate reaches ${resultRate}. Enter the difference value you want to use as threshold, not the absolute rate.`;
      }
      return 'Alert when interest rate difference between Compound and other platforms is above your threshold. Enter the difference value (e.g., 1.20), not the absolute rate.';
    } else {
      if (platformName && currentRate) {
        const currentRateValue = parseFloat(currentRate.replace('%', ''));
        const thresholdExample = 0.5;
        const resultRate = (currentRateValue - thresholdExample).toFixed(1);

        return `Alert when interest rate difference between Compound and ${toSentenceCase(platformName)} is below your threshold. Example: If ${toSentenceCase(
          platformName
        )} charges ${currentRate} interest rate and you set ${thresholdExample.toFixed(
          1
        )} threshold, you'll be alerted when Compound's borrow interest rate drops to ${resultRate}. Enter the difference value you want to use as threshold, not the absolute rate.`;
      }
      return 'Alert when interest rate difference between Compound and other platforms is below your threshold. Enter the difference value (e.g., 0.50), not the absolute rate.';
    }
  };

  return (
    <Card className="mb-6 border-theme-primary bg-block border-primary-color">
      <CardHeader className="pb-1 flex flex-row items-center justify-between">
        <CardTitle className="text-lg text-theme-primary">{editorType === 'market' ? 'Alert Conditions' : 'Rate Difference Alert Thresholds'}</CardTitle>
        <Button size="sm" onClick={addCondition} className="text-theme-primary border border-theme-primary hover-border-primary hover-text-primary">
          <Plus size={16} className="mr-1" />
          {editorType === 'market' ? 'Add Condition' : 'Add Threshold'}
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-theme-muted mb-4">
          {editorType === 'market'
            ? 'Define specific conditions that will trigger alerts for this position. You will be notified when any of these conditions are met. Enter absolute interest rate values (e.g., 5.00 for 5% interest rate).'
            : actionType === 'SUPPLY'
            ? 'Set thresholds to be alerted when Compound supply interest rate exceeds other platforms by your specified amount. Enter the difference value (e.g., 1.20 for 1.2% difference), not the absolute rate.'
            : 'Set thresholds to be alerted when Compound borrow interest rate is lower than other platforms by your specified amount. Enter the difference value (e.g., 0.50 for 0.5% difference), not the absolute rate.'}
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
          <div key={condition.id} className="flex flex-col mb-4 border-t border-primary-color pt-4">
            <div className="flex gap-4 items-center">
              <div className="flex items-center text-theme-muted">
                <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0 rounded-full text-primary-color">
                  {index + 1}
                </Badge>
              </div>

              {editorType === 'market' ? (
                <>
                  {/* Market Condition Type */}
                  <div className="w-64">
                    <Select value={condition.conditionType} onValueChange={(value) => updateCondition(condition.id, 'conditionType', value)}>
                      <SelectTrigger className="w-full hover-border-primary">
                        <SelectValue placeholder="Select condition type" />
                      </SelectTrigger>
                      <SelectContent className="bg-block">
                        <div className="hover-border-primary hover-text-primary">
                          <SelectItem value="APR_RISE_ABOVE">Alert when APR rises above threshold</SelectItem>
                        </div>
                        <div className="hover-border-primary hover-text-primary">
                          <SelectItem value="APR_FALLS_BELOW">Alert when APR falls below threshold</SelectItem>
                        </div>
                        <div className="hover-border-primary hover-text-primary">
                          <SelectItem value="APR_OUTSIDE_RANGE">Alert when APR moves outside a range</SelectItem>
                        </div>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Market Condition Thresholds */}
                  {condition.conditionType === 'APR_OUTSIDE_RANGE' ? (
                    <div className="flex-1 flex flex-col">
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
                        <span className="text-theme-muted whitespace-nowrap flex-shrink-0">interest rate</span>
                      </div>
                      {errors?.conditions && errors.conditions[index] && (
                        <div className="mt-1 flex items-center text-red-500 text-sm">
                          <AlertCircle size={14} className="mr-1" />
                          <span>{errors.conditions[index]}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col">
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
                        <span className="ml-2 text-theme-muted whitespace-nowrap flex-shrink-0">interest rate</span>
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
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center">
                    <Input
                      type="text"
                      value={condition.thresholdValue || ''}
                      onChange={(e) => updateCondition(condition.id, 'thresholdValue', e.target.value)}
                      className={`w-40 border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                        errors?.conditions && errors.conditions[index] ? 'border-red-500' : ''
                      }`}
                      placeholder={actionType === 'SUPPLY' ? 'Threshold (e.g., 1.2)' : 'Threshold (e.g., 0.5)'}
                    />
                    <span className="ml-2 text-theme-muted">interest rate difference</span>
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
              <div className="w-64 flex-shrink-0">
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
                  className="text-red-500 h-10 w-10 flex items-center justify-center flex-shrink-0"
                >
                  <X size={20} />
                </Button>
              )}
            </div>

            {/* Contextual message for market conditions */}
            {editorType === 'market' && (
              <div className="mt-2 px-3 py-2 ml-10">
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
