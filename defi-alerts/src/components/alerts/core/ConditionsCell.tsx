import { PlatformImage } from '@/components/alerts/core/PlatformImage';
import SeverityBadge from '@/components/alerts/SeverityBadge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { type Alert, PrismaCondition, severityOptions } from '@/types/alerts';
import { Alert as PrismaAlert, AlertCondition, Asset, Chain, DeliveryChannel } from '@prisma/client';
import { Info } from 'lucide-react';
import React from 'react';

interface ConditionsCellProps {
  alert:
    | Alert
    | (PrismaAlert & {
        conditions: AlertCondition[];
        deliveryChannels: DeliveryChannel[];
        selectedChains: Chain[];
        selectedAssets: Asset[];
      });
}

/**
 * Component for displaying alert conditions in a table cell
 */
const ConditionsCell: React.FC<ConditionsCellProps> = ({ alert }) => {
  const conditions: (PrismaCondition | AlertCondition)[] = alert.conditions;

  // Format condition threshold values based on condition type
  const formatThresholdValue = (condition: PrismaCondition | AlertCondition) => {
    if (condition.conditionType === 'APR_OUTSIDE_RANGE') {
      if (condition.thresholdValueLow && condition.thresholdValueHigh) {
        try {
          const lowValue = typeof condition.thresholdValueLow === 'string' ? parseFloat(condition.thresholdValueLow) : condition.thresholdValueLow;
          const highValue = typeof condition.thresholdValueHigh === 'string' ? parseFloat(condition.thresholdValueHigh) : condition.thresholdValueHigh;

          if (!isNaN(lowValue) && !isNaN(highValue)) {
            return `${lowValue.toFixed(2)}–${highValue.toFixed(2)}`;
          } else {
            return `${condition.thresholdValueLow}–${condition.thresholdValueHigh}`;
          }
        } catch (error) {
          return `${condition.thresholdValueLow}–${condition.thresholdValueHigh}`;
        }
      } else {
        return '-';
      }
    } else {
      if (condition.thresholdValue) {
        try {
          const value = typeof condition.thresholdValue === 'string' ? parseFloat(condition.thresholdValue) : condition.thresholdValue;

          if (!isNaN(value)) {
            return value.toFixed(2);
          } else {
            return `${condition.thresholdValue}`;
          }
        } catch (error) {
          return `${condition.thresholdValue}`;
        }
      } else {
        return '-';
      }
    }
  };

  // Get severity label

  const getConditionMessage = (alert: Alert | PrismaAlert, condition: PrismaCondition | AlertCondition) => {
    if (alert.isComparison) {
      switch (condition.conditionType) {
        case 'APR_RISE_ABOVE':
          return (
            <span>
              Alert when <PlatformImage platform={'compound'} /> APR exceeds APR of{' '}
              {alert.compareProtocols.map((cp, index) => (
                <span key={index}>
                  <PlatformImage platform={cp} />
                  {index < alert.compareProtocols.length - 1 ? ', ' : ''}
                </span>
              ))}{' '}
              by {formatThresholdValue(condition)}
            </span>
          );
        case 'APR_FALLS_BELOW':
          return (
            <span>
              Alert when <PlatformImage platform={'compound'} /> APR drops below{' '}
              {alert.compareProtocols.map((cp, index) => (
                <span key={index}>
                  <PlatformImage platform={cp} />
                  {index < alert.compareProtocols.length - 1 ? ', ' : ''}
                </span>
              ))}{' '}
              APR by {formatThresholdValue(condition)}
            </span>
          );
        case 'APR_OUTSIDE_RANGE':
          return (
            <span>
              Alert when <PlatformImage platform={'compound'} /> APR moves outside {formatThresholdValue(condition)} of{' '}
              {alert.compareProtocols.map((cp, index) => (
                <span key={index}>
                  <PlatformImage platform={cp} />
                  {index < alert.compareProtocols.length - 1 ? ', ' : ''}
                </span>
              ))}{' '}
              APR
            </span>
          );
        case 'RATE_DIFF_ABOVE':
          return (
            <span>
              Alert when rate difference between <PlatformImage platform={'compound'} /> and{' '}
              {alert.compareProtocols.map((cp, index) => (
                <span key={index}>
                  <PlatformImage platform={cp} />
                  {index < alert.compareProtocols.length - 1 ? ', ' : ''}
                </span>
              ))}{' '}
              is above {formatThresholdValue(condition)}
            </span>
          );
        case 'RATE_DIFF_BELOW':
          return (
            <span>
              Alert when rate difference between <PlatformImage platform={'compound'} /> and{' '}
              {alert.compareProtocols.map((cp, index) => (
                <span key={index}>
                  <PlatformImage platform={cp} />
                  {index < alert.compareProtocols.length - 1 ? ', ' : ''}
                </span>
              ))}{' '}
              is below {formatThresholdValue(condition)}
            </span>
          );
      }
    } else {
      const platform = alert.compareProtocols && alert.compareProtocols.length > 0 ? alert.compareProtocols[0] : 'compound';

      switch (condition.conditionType) {
        case 'APR_RISE_ABOVE':
          return (
            <span>
              Alert when <PlatformImage platform={platform} /> APR rises above {formatThresholdValue(condition)}
            </span>
          );
        case 'APR_FALLS_BELOW':
          return (
            <span>
              Alert when <PlatformImage platform={platform} /> APR falls below {formatThresholdValue(condition)}
            </span>
          );
        case 'APR_OUTSIDE_RANGE':
          return (
            <span>
              Alert when <PlatformImage platform={platform} /> APR moves outside the range of {formatThresholdValue(condition)}
            </span>
          );
        case 'RATE_DIFF_ABOVE':
          return (
            <span>
              Alert when <PlatformImage platform={platform} /> rate difference is above {formatThresholdValue(condition)}
            </span>
          );
        case 'RATE_DIFF_BELOW':
          return (
            <span>
              Alert when <PlatformImage platform={platform} /> rate difference is below {formatThresholdValue(condition)}
            </span>
          );
      }
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {conditions.map((condition, index) => (
        <div key={index} className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-theme-muted">
            <SeverityBadge severity={condition.severity}>{condition.severity}</SeverityBadge> {getConditionMessage(alert, condition)}{' '}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" className="h-5 w-5 hover:text-primary">
                    <Info size={14} />
                    <span className="sr-only">View all channels</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-block p-3 border border-theme-primary">
                  <div className="space-y-2">
                    <p>{getConditionMessage(alert, condition)}</p>
                    <div>
                      Severity Level:&nbsp;
                      {condition.severity === 'NONE' ? (
                        <SeverityBadge severity="NONE">None</SeverityBadge>
                      ) : (
                        <SeverityBadge severity={condition.severity}>{condition.severity}</SeverityBadge>
                      )}
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

export default ConditionsCell;
