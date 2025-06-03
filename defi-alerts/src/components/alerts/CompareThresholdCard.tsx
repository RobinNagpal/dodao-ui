'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PositionConditionEditor } from './';
import { ComparisonCondition } from './PositionConditionEditor';
import { type GeneralComparisonRow, NotificationFrequency, type SeverityLevel } from '@/types/alerts';
import { NotificationFrequencySection } from './';

interface CompareThresholdCardProps {
  thresholds: GeneralComparisonRow[];
  addThreshold: () => void;
  updateThreshold: (idx: number, field: keyof GeneralComparisonRow, val: string) => void;
  removeThreshold: (idx: number) => void;
  notificationFrequency: string;
  setNotificationFrequency: (frequency: NotificationFrequency) => void;
  errors: {
    thresholds?: string[];
  };
  alertType: 'supply' | 'borrow';
}

export default function CompareThresholdCard({
  thresholds,
  addThreshold,
  updateThreshold,
  removeThreshold,
  notificationFrequency,
  setNotificationFrequency,
  errors,
  alertType,
}: CompareThresholdCardProps) {
  // Get contextual message for comparison logic

  return (
    <Card className="mb-6 border-theme-primary bg-block border-primary-color">
      <CardHeader className="pb-1">
        <CardTitle className="text-lg text-theme-primary">Rate Difference Thresholds</CardTitle>
      </CardHeader>
      <CardContent>
        <PositionConditionEditor
          editorType="comparison"
          actionType={alertType.toUpperCase() as 'SUPPLY' | 'BORROW'}
          conditions={thresholds.map(
            (th, i): ComparisonCondition => ({
              id: `threshold-${i}`,
              conditionType: alertType === 'supply' ? 'RATE_DIFF_ABOVE' : 'RATE_DIFF_BELOW',
              severity: th.severity as SeverityLevel,
              thresholdValue: th.threshold,
            })
          )}
          addCondition={addThreshold}
          updateCondition={(id, field, value) => {
            const index = parseInt(id.split('-')[1]);
            updateThreshold(index, field as keyof GeneralComparisonRow, value);
          }}
          removeCondition={(id) => {
            const index = parseInt(id.split('-')[1]);
            removeThreshold(index);
          }}
          errors={{ conditions: errors.thresholds }}
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
