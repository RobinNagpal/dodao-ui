'use client';

import { ChainImage } from '@/components/alerts/core/ChainImage';
import CompareProtocols from '@/components/alerts/core/CompareProtocols';
import { PlatformImage } from '@/components/alerts/core/PlatformImage';
import SeverityBadge from '@/components/alerts/SeverityBadge';
import { AlertTriggerValuesInterface } from '@/types/prismaTypes';
import { Alert } from '@prisma/client';
import React from 'react';
import { AssetImage } from './AssetImage';

interface TriggerValuesCellProps {
  alert: Alert;
  triggerValues: AlertTriggerValuesInterface[] | null;
}

/**
 * Component for displaying alert trigger values in a table cell
 */

const AssetInfo = ({ triggerValue }: { triggerValue: AlertTriggerValuesInterface }) => {
  const { assetAddress, assetSymbol, chainName } = triggerValue;
  if (!assetAddress || !assetSymbol || !chainName) {
    return null;
  }
  return (
    <>
      {' '}
      for <AssetImage chain={chainName} assetAddress={assetAddress} assetSymbol={assetSymbol} /> on <ChainImage chain={chainName} />.{' '}
    </>
  );
};
const TriggerValuesCell: React.FC<TriggerValuesCellProps> = ({ alert, triggerValues }) => {
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
  const getTriggerValueMessage = (alert: Alert, triggerValue: AlertTriggerValuesInterface) => {
    const { isComparison, condition, chainName, asset, assetSymbol, currentRate, compoundRate, protocolRate, diff, protocol } = triggerValue;

    // Determine if this is a supply or borrow action based on the condition
    // Default to 'supply' if not specified
    const actionType = alert.actionType;

    if (isComparison) {
      switch (condition.type) {
        case 'RATE_DIFF_ABOVE':
          return (
            <span>
              Alert when {actionType === 'SUPPLY' ? 'supply' : 'borrow'} rate is {actionType === 'SUPPLY' ? 'more(better earnings)' : 'more(higher cost)'} on{' '}
              <PlatformImage platform={'compound'} /> by {formatThresholdValue(condition.threshold)} compared to{' '}
              <CompareProtocols protocols={protocol ? [protocol] : []} /> <AssetInfo triggerValue={triggerValue} />
              Current difference: {diff}
            </span>
          );
        case 'RATE_DIFF_BELOW':
          return (
            <span>
              Alert when {actionType === 'SUPPLY' ? 'supply' : 'borrow'} rate is {actionType === 'BORROW' ? 'less(better cost)' : 'more(better earnings)'} on{' '}
              <PlatformImage platform={'compound'} /> by {formatThresholdValue(condition.threshold)} compared to{' '}
              <CompareProtocols protocols={protocol ? [protocol] : []} />
              <AssetInfo triggerValue={triggerValue} />. Current difference: {diff}
            </span>
          );
        default:
          return (
            <span>
              Comparison between <PlatformImage platform={'compound'} /> ({compoundRate}) and <CompareProtocols protocols={protocol ? [protocol] : []} />
              <AssetInfo triggerValue={triggerValue} /> ({protocolRate}) with difference of {diff}
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
            {getTriggerValueMessage(alert, triggerValue)} {triggerValue.severity && <SeverityBadge severity={triggerValue.severity} />}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TriggerValuesCell;
