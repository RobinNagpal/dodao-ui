import React from 'react';
import { AlertTriggerValuesInterface } from '@/types/prismaTypes';
import { Alert } from '@prisma/client';
import { AssetImageEmail, ChainImageEmail, PlatformImageEmail } from '@/utils/emailRendering';

interface TriggerValuesCellEmailProps {
  alert: Alert;
  triggerValues: AlertTriggerValuesInterface[] | null;
}

/**
 * Email-friendly version of AssetInfo component
 */
const AssetInfoEmail = ({ triggerValue }: { triggerValue: AlertTriggerValuesInterface }) => {
  const { assetAddress, asset, assetSymbol, chainName } = triggerValue;
  if (!assetAddress || !chainName) {
    return null;
  }

  const symbol = assetSymbol || asset;

  return (
    <>
      {' '}
      for <AssetImageEmail chain={chainName} assetAddress={assetAddress} assetSymbol={symbol} /> {symbol} on <ChainImageEmail chain={chainName} /> {chainName}.{' '}
    </>
  );
};

/**
 * Email-friendly version of CompareProtocols component
 */
const CompareProtocolsEmail = ({ protocols }: { protocols: string[] }) => {
  if (!protocols || protocols.length === 0) {
    return null;
  }

  return (
    <>
      {protocols.map((protocol, index) => (
        <React.Fragment key={index}>
          <PlatformImageEmail platform={protocol} />
          {index < protocols.length - 1 && ', '}
        </React.Fragment>
      ))}
    </>
  );
};

/**
 * Email-friendly version of TriggerValuesCell component for email rendering
 */
const TriggerValuesCellEmail: React.FC<TriggerValuesCellEmailProps> = ({ alert, triggerValues }) => {
  if (!triggerValues || triggerValues.length === 0) {
    return <div style={{ color: '#666666' }}>No trigger values available</div>;
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
    const actionVerb = actionType === 'SUPPLY' ? 'supply' : 'borrow';

    if (isComparison) {
      switch (condition.type) {
        case 'RATE_DIFF_ABOVE':
          return (
            <span>
              <PlatformImageEmail platform={'compound'} /> has a {actionVerb === 'supply' ? 'higher earning rate' : 'higher cost'} than{' '}
              <CompareProtocolsEmail protocols={protocol ? [protocol] : []} /> by {formatThresholdValue(condition.threshold)}%{' '}
              <AssetInfoEmail triggerValue={triggerValue} />
              Current difference: {diff}%
            </span>
          );
        case 'RATE_DIFF_BELOW':
          return (
            <span>
              <PlatformImageEmail platform={'compound'} /> has a {actionVerb === 'supply' ? 'lower earning rate' : 'lower cost'} than{' '}
              <CompareProtocolsEmail protocols={protocol ? [protocol] : []} /> by {formatThresholdValue(condition.threshold)}%{' '}
              <AssetInfoEmail triggerValue={triggerValue} />
              Current difference: {diff}%
            </span>
          );
        default:
          return (
            <span>
              Rate comparison: <PlatformImageEmail platform={'compound'} /> ({compoundRate}%) vs{' '}
              <CompareProtocolsEmail protocols={protocol ? [protocol] : []} />({protocolRate}%)
              <AssetInfoEmail triggerValue={triggerValue} /> Difference: {diff}%
            </span>
          );
      }
    } else {
      const platform = protocol || 'compound';

      switch (condition.type) {
        case 'APR_RISE_ABOVE':
          return (
            <span>
              <PlatformImageEmail platform={platform} /> {actionVerb} rate has increased above {formatThresholdValue(condition.threshold)}%{' '}
              {actionVerb === 'supply' ? '(better returns)' : '(higher cost)'}. Current rate: {currentRate}% for {asset} on {chainName}
            </span>
          );
        case 'APR_FALLS_BELOW':
          return (
            <span>
              <PlatformImageEmail platform={platform} /> {actionVerb} rate has decreased below {formatThresholdValue(condition.threshold)}%{' '}
              {actionVerb === 'supply' ? '(lower returns)' : '(better rate)'}. Current rate: {currentRate}% for {asset} on {chainName}
            </span>
          );
        case 'APR_OUTSIDE_RANGE':
          return (
            <span>
              <PlatformImageEmail platform={platform} /> {actionVerb} rate is now outside the range of {formatThresholdValue(condition.threshold)}%. Current
              rate: {currentRate}% for {asset} on {chainName}
            </span>
          );
        default:
          return (
            <span>
              <PlatformImageEmail platform={platform} /> {actionVerb} rate for {asset} on {chainName} is {currentRate}%
            </span>
          );
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {triggerValues.map((triggerValue, index) => (
        <div key={index} style={{ marginBottom: '8px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <span style={{ fontWeight: 600, color: '#333333' }}>
            {getTriggerValueMessage(alert, triggerValue)}
            {triggerValue.severity && (
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: getSeverityColor(triggerValue.severity),
                  color: '#ffffff',
                  marginLeft: '8px',
                  fontSize: '12px',
                }}
              >
                {triggerValue.severity}
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
};

/**
 * Helper function to get color for severity
 */
function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'HIGH':
      return '#ef4444';
    case 'MEDIUM':
      return '#f59e0b';
    case 'LOW':
      return '#10b981';
    default:
      return '#6b7280';
  }
}

export default TriggerValuesCellEmail;
