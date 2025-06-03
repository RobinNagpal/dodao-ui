'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Condition, type ConditionType, NotificationFrequency, type SeverityLevel } from '@/types/alerts';
import { NotificationFrequencySection, PositionConditionEditor } from './';
import { MarketCondition } from './PositionConditionEditor';

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
  // Convert index-based conditions to id-based conditions for PositionConditionEditor
  const conditionsWithIds = conditions.map((cond, index) => ({
    ...cond,
    id: `condition-${index}`,
  }));

  // Adapter functions to convert between index-based and id-based condition management
  const handleAddCondition = () => {
    addCondition();
  };

  const handleUpdateCondition = (id: string, field: string, value: string) => {
    // Find the index of the condition with the given id
    const index = conditionsWithIds.findIndex((cond) => cond.id === id);
    if (index !== -1) {
      updateCondition(index, field as keyof Condition, value);
    }
  };

  const handleRemoveCondition = (id: string) => {
    // Find the index of the condition with the given id
    const index = conditionsWithIds.findIndex((cond) => cond.id === id);
    if (index !== -1) {
      removeCondition(index);
    }
  };

  return (
    <Card className="mb-6 border-theme-primary bg-block border-primary-color">
      <CardHeader className="pb-1 flex flex-row items-center justify-between">
        <CardTitle className="text-lg text-theme-primary">Condition Settings</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Use PositionConditionEditor for condition editing */}
        <PositionConditionEditor
          editorType="market"
          conditions={conditionsWithIds as MarketCondition[]}
          addCondition={handleAddCondition}
          updateCondition={handleUpdateCondition}
          removeCondition={handleRemoveCondition}
          errors={errors}
        />

        <hr className="my-4"></hr>

        {/* Notification Frequency */}
        <NotificationFrequencySection
          notificationFrequency={notificationFrequency as NotificationFrequency}
          setNotificationFrequency={setNotificationFrequency}
        />
      </CardContent>
    </Card>
  );
}
