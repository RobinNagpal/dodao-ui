'use client';

import { ComparisonCondition } from '@/components/alerts/PositionConditionEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Plus, X } from 'lucide-react';
import { type ConditionType, type SeverityLevel, severityOptions, type NotificationFrequency, Channel } from '@/types/alerts';
import { NotificationFrequencySection, DeliveryChannelsCard, PositionConditionEditor } from './';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';
import { toSentenceCase } from '@/utils/getSentenceCase';

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

export default function PersonalizedComparisonPositionCard({
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
}: PersonalizedComparisonPositionCardProps) {
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
                  {position.market} on {position.chain} - {toSentenceCase(position.platform)}
                </div>
                <p className="text-sm text-theme-muted">
                  Current {toSentenceCase(position.platform)} APR: {position.rate}
                </p>
              </div>
            </div>
            <span className="text-primary-color">Configure Alert</span>
          </div>
        </AccordionTrigger>

        <AccordionContent className="px-6 pb-6">
          <div className="border-t border-theme-primary pt-4">
            {/* Rate Difference Thresholds */}
            <PositionConditionEditor
              editorType="comparison"
              actionType={position.actionType}
              platformName={position.platform}
              currentRate={position.rate}
              conditions={position.conditions as ComparisonCondition[]}
              addCondition={addCondition}
              updateCondition={updateCondition}
              removeCondition={removeCondition}
              errors={errors}
            />

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
