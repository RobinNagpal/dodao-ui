'use client';

import { PlatformImage } from '@/components/alerts/core/PlatformImage';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriggerValuesInterface } from '@/types/prismaTypes';
import { NotificationFrequency } from '@prisma/client';
import { Info } from 'lucide-react';
import React from 'react';

interface TriggerValuesCellProps {
  triggerValues: AlertTriggerValuesInterface[] | null;
}

/**
 * Component for displaying alert trigger values in a table cell
 */
const TriggerValuesCell: React.FC<TriggerValuesCellProps> = ({ triggerValues }) => {
  if (!triggerValues || triggerValues.length === 0) {
    return <div className="text-theme-muted">No trigger values available</div>;
  }

  // Format threshold values based on condition type
  const formatThresholdValue = (threshold: number | { low: number; high: number }) => {
    if (typeof threshold === 'number') {
      return threshold.toFixed(2);
    } else {
      return `${threshold.low.toFixed(2)}–${threshold.high.toFixed(2)}`;
    }
  };

  // Format notification frequency for display
  const formatNotificationFrequency = (frequency: NotificationFrequency) => {
    switch (frequency) {
      case 'ONCE_PER_ALERT':
        return 'Once per alert';
      case 'AT_MOST_ONCE_PER_3_HOURS':
        return 'At most once per 3 hours';
      case 'AT_MOST_ONCE_PER_6_HOURS':
        return 'At most once per 6 hours';
      case 'AT_MOST_ONCE_PER_12_HOURS':
        return 'At most once per 12 hours';
      case 'AT_MOST_ONCE_PER_DAY':
        return 'At most once per day';
      case 'AT_MOST_ONCE_PER_WEEK':
        return 'At most once per week';
      default:
        return frequency;
    }
  };

  // Get trigger value message based on condition type and comparison flag
  const getTriggerValueMessage = (triggerValue: AlertTriggerValuesInterface) => {
    const { isComparison, condition, chainName, asset, currentRate, compoundRate, protocolRate, diff, protocol } = triggerValue;

    if (isComparison) {
      switch (condition.type) {
        case 'RATE_DIFF_ABOVE':
          return (
            <span>
              Rate difference between <PlatformImage platform={'compound'} /> ({compoundRate}%) and <PlatformImage platform={protocol || ''} /> ({protocolRate}
              %) is {diff}%, which is above the threshold of {formatThresholdValue(condition.threshold)}%
            </span>
          );
        case 'RATE_DIFF_BELOW':
          return (
            <span>
              Rate difference between <PlatformImage platform={'compound'} /> ({compoundRate}%) and <PlatformImage platform={protocol || ''} /> ({protocolRate}
              %) is {diff}%, which is below the threshold of {formatThresholdValue(condition.threshold)}%
            </span>
          );
        default:
          return (
            <span>
              Comparison between <PlatformImage platform={'compound'} /> ({compoundRate}%) and <PlatformImage platform={protocol || ''} /> ({protocolRate}%)
              with difference of {diff}%
            </span>
          );
      }
    } else {
      switch (condition.type) {
        case 'APR_RISE_ABOVE':
          return (
            <span>
              <PlatformImage platform={'compound'} /> APR for {asset} on {chainName} is {currentRate}%, which is above the threshold of{' '}
              {formatThresholdValue(condition.threshold)}%
            </span>
          );
        case 'APR_FALLS_BELOW':
          return (
            <span>
              <PlatformImage platform={'compound'} /> APR for {asset} on {chainName} is {currentRate}%, which is below the threshold of{' '}
              {formatThresholdValue(condition.threshold)}%
            </span>
          );
        case 'APR_OUTSIDE_RANGE':
          return (
            <span>
              <PlatformImage platform={'compound'} /> APR for {asset} on {chainName} is {currentRate}%, which is outside the range of{' '}
              {formatThresholdValue(condition.threshold)}%
            </span>
          );
        default:
          return (
            <span>
              <PlatformImage platform={'compound'} /> APR for {asset} on {chainName} is {currentRate}%
            </span>
          );
      }
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {triggerValues.map((triggerValue, index) => (
        <div key={index} className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-theme-muted">
            {getTriggerValueMessage(triggerValue)}{' '}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" className="h-5 w-5 hover:text-primary">
                    <Info size={14} />
                    <span className="sr-only">View details</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-block p-3 border border-theme-primary">
                  <div className="space-y-2">
                    <p>{getTriggerValueMessage(triggerValue)}</p>
                    <div>
                      <strong>Chain:</strong> {triggerValue.chainName}
                    </div>
                    <div>
                      <strong>Asset:</strong> {triggerValue.asset}
                    </div>
                    {triggerValue.isComparison ? (
                      <>
                        <div>
                          <strong>Protocol:</strong> {triggerValue.protocol}
                        </div>
                        <div>
                          <strong>Compound Rate:</strong> {triggerValue.compoundRate}%
                        </div>
                        <div>
                          <strong>Protocol Rate:</strong> {triggerValue.protocolRate}%
                        </div>
                        <div>
                          <strong>Difference:</strong> {triggerValue.diff}%
                        </div>
                      </>
                    ) : (
                      <div>
                        <strong>Current Rate:</strong> {triggerValue.currentRate}%
                      </div>
                    )}
                    <div>
                      <strong>Notification Frequency:</strong> {formatNotificationFrequency(triggerValue.notificationFrequency)}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </span>
        </div>
      ))}
    </div>
  );
};

export default TriggerValuesCell;
