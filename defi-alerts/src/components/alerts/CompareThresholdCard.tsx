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
  return (
    <Card className="mb-6 border-theme-primary bg-block border-primary-color">
      <CardHeader className="pb-1 flex flex-row items-center justify-between">
        <CardTitle className="text-lg text-theme-primary">Rate Difference Thresholds</CardTitle>
        <Button size="sm" onClick={addThreshold} className="text-theme-primary border border-theme-primary hover-border-primary hover-text-primary">
          <Plus size={16} className="mr-1" /> Add Threshold
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-theme-muted mb-4">
          {alertType === 'supply' ? 'Notify when Compound supply APR > other APR by threshold.' : 'Notify when Compound borrow APR < other APR by threshold.'}
        </p>

        {thresholds.map((th, i) => (
          <div key={i} className="grid grid-cols-12 gap-4 mb-4 items-center border-t border-primary-color pt-4">
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
                  className={`w-20 border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                    errors.thresholds && errors.thresholds[i] ? 'border-red-500' : ''
                  }`}
                  placeholder="0.5"
                />
                <span className="ml-2 text-theme-muted">% APR</span>
              </div>
              {errors.thresholds && errors.thresholds[i] && (
                <div className="mt-1 flex items-center text-red-500 text-sm">
                  <AlertCircle size={14} className="mr-1" />
                  <span>{errors.thresholds[i]}</span>
                </div>
              )}
            </div>

            <div className="col-span-5">
              <Select value={th.severity} onValueChange={(value) => updateThreshold(i, 'severity', value as SeverityLevel)}>
                <SelectTrigger className="w-full hover-border-primary">
                  <SelectValue placeholder="Select severity" />
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

        {/* Notification Frequency */}
        <NotificationFrequencySection
          notificationFrequency={notificationFrequency as NotificationFrequency}
          setNotificationFrequency={setNotificationFrequency}
        />
      </CardContent>
    </Card>
  );
}
