'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Plus, X } from 'lucide-react';
import { type GeneralComparisonRow, NotificationFrequency, type SeverityLevel, severityOptions } from '@/types/alerts';
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
  const getComparisonMessage = (alertType: 'supply' | 'borrow') => {
    if (alertType === 'supply') {
      return `If Aave offers 6.5% supply rate and you set 1.2% threshold, you'll be alerted when Compound's supply rate reaches 7.7%`;
    } else {
      return `If Aave charges 4.0% borrow rate and you set 0.5% threshold, you'll be alerted when Compound's borrow rate drops to 3.5%`;
    }
  };

  return (
    <Card className="mb-6 border-theme-primary bg-block border-primary-color">
      <CardHeader className="pb-1 flex flex-row items-center justify-between">
        <CardTitle className="text-lg text-theme-primary">Rate Difference Thresholds</CardTitle>
        <Button size="sm" onClick={addThreshold} className="text-theme-primary border border-theme-primary hover-border-primary hover-text-primary">
          <Plus size={16} className="mr-1" /> Add Threshold
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-theme-muted">
          Set the minimum rate difference required to trigger an alert. You’ll be notified when Compound becomes competitively better by your specified
          threshold.
        </p>

        {/* Single Contextual Message for the alert type */}
        <div>
          <p className="text-sm text-theme-muted">
            <span className="text-primary-color font-medium">How thresholds work:</span> {getComparisonMessage(alertType)}
          </p>
        </div>

        {thresholds.map((th, i) => (
          <div key={i} className="grid grid-cols-12 gap-4 my-4 items-center">
            <div className="col-span-1 flex items-center text-theme-muted">
              <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0 rounded-full text-primary-color">
                {i + 1}
              </Badge>
            </div>

            <div className="col-span-5 flex flex-col">
              <div className="flex items-center">
                <Input
                  type="text"
                  value={th.threshold}
                  onChange={(e) => updateThreshold(i, 'threshold', e.target.value)}
                  className={`w-22 border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                    errors.thresholds && errors.thresholds[i] ? 'border-red-500' : ''
                  }`}
                  placeholder={alertType === 'supply' ? 'Threshold (e.g., 1.2)' : 'Threshold (e.g., 0.5)'}
                />
                <span className="ml-2 text-theme-muted">APR difference</span>
              </div>
              {errors.thresholds && errors.thresholds[i] && (
                <div className="mt-1 flex items-center text-red-500 text-sm">
                  <AlertCircle size={14} className="mr-1" />
                  <span>{errors.thresholds[i]}</span>
                </div>
              )}
            </div>

            <div className="col-span-5">
              <Select
                value={th.severity === 'NONE' ? undefined : th.severity}
                onValueChange={(value) => updateThreshold(i, 'severity', value as SeverityLevel)}
              >
                <SelectTrigger className="w-full hover-border-primary">
                  <SelectValue placeholder="Severity Level" />
                </SelectTrigger>
                <SelectContent className="bg-block">
                  {severityOptions.map((opt) => (
                    <div key={opt.value} className="hover-border-primary hover-text-primary">
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {thresholds.length > 1 && (
              <Button variant="ghost" size="icon" onClick={() => removeThreshold(i)} className="col-span-1 text-red-500 h-8 w-8">
                <X size={16} />
              </Button>
            )}
          </div>
        ))}

        <hr></hr>

        {/* Notification Frequency */}
        <NotificationFrequencySection
          notificationFrequency={notificationFrequency as NotificationFrequency}
          setNotificationFrequency={setNotificationFrequency}
        />
      </CardContent>
    </Card>
  );
}
