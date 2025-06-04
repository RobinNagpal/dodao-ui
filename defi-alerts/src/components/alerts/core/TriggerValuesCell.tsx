'use client';

import { PlatformImage } from '@/components/alerts/core/PlatformImage';
import SeverityBadge from '@/components/alerts/SeverityBadge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriggerValuesInterface } from '@/types/prismaTypes';
import { NotificationFrequency } from '@prisma/client';
import { Info } from 'lucide-react';
import React from 'react';
import CompareProtocols from '@/components/alerts/core/CompareProtocols';

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

  // Get trigger value message based on condition type and comparison flag
  const getTriggerValueMessage = (triggerValue: AlertTriggerValuesInterface) => {
    const { isComparison, condition, chainName, asset, currentRate, compoundRate, protocolRate, diff, protocol } = triggerValue;

    // Determine if this is a supply or borrow action based on the condition
    // Default to 'supply' if not specified
    const actionType = triggerValue.condition.type.includes('SUPPLY') ? 'SUPPLY' : triggerValue.condition.type.includes('BORROW') ? 'BORROW' : 'SUPPLY';

    if (isComparison) {
      switch (condition.type) {
        case 'RATE_DIFF_ABOVE':
          return (
            <span>
              Alert when {actionType === 'SUPPLY' ? 'supply' : 'borrow'} rate is {actionType === 'SUPPLY' ? 'more(better earnings)' : 'more(higher cost)'} on{' '}
              <PlatformImage platform={'compound'} /> by {formatThresholdValue(condition.threshold)} compared to{' '}
              <CompareProtocols protocols={protocol ? [protocol] : []} />. Current difference: {diff}
            </span>
          );
        case 'RATE_DIFF_BELOW':
          return (
            <span>
              Alert when {actionType === 'SUPPLY' ? 'supply' : 'borrow'} rate is {actionType === 'SUPPLY' ? 'less(worse earnings)' : 'less(better cost)'} on{' '}
              <PlatformImage platform={'compound'} /> by {formatThresholdValue(condition.threshold)} compared to{' '}
              <CompareProtocols protocols={protocol ? [protocol] : []} />. Current difference: {diff}
            </span>
          );
        default:
          return (
            <span>
              Comparison between <PlatformImage platform={'compound'} /> ({compoundRate}) and <CompareProtocols protocols={protocol ? [protocol] : []} /> (
              {protocolRate}) with difference of {diff}
            </span>
          );
      }
    } else {
      const platform = protocol || 'compound';

      switch (condition.type) {
        case 'APR_RISE_ABOVE':
          return (
            <span>
              Alert when <PlatformImage platform={platform} /> {actionType === 'SUPPLY' ? 'supply' : 'borrow'} APR rises above{' '}
              {formatThresholdValue(condition.threshold)} {actionType === 'SUPPLY' ? '(better earning opportunity)' : '(higher borrowing cost)'}. Current rate:{' '}
              {currentRate}
            </span>
          );
        case 'APR_FALLS_BELOW':
          return (
            <span>
              Alert when <PlatformImage platform={platform} /> {actionType === 'SUPPLY' ? 'supply' : 'borrow'} APR falls below{' '}
              {formatThresholdValue(condition.threshold)} {actionType === 'SUPPLY' ? '(worse earning opportunity)' : '(better borrowing rate)'}. Current rate:{' '}
              {currentRate}
            </span>
          );
        case 'APR_OUTSIDE_RANGE':
          return (
            <span>
              Alert when <PlatformImage platform={platform} /> {actionType === 'SUPPLY' ? 'supply' : 'borrow'} APR moves outside the range of{' '}
              {formatThresholdValue(condition.threshold)}{' '}
              {actionType === 'SUPPLY' ? '(significant change in earning opportunity)' : '(significant change in borrowing cost)'}. Current rate: {currentRate}
            </span>
          );
        default:
          return (
            <span>
              <PlatformImage platform={platform} /> APR for {asset} on {chainName} is {currentRate}
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
            {getTriggerValueMessage(triggerValue)} {triggerValue.severity && <SeverityBadge severity={triggerValue.severity} />}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TriggerValuesCell;
