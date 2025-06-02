'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type NotificationFrequency, frequencyOptions } from '@/types/alerts';

interface NotificationFrequencySectionProps {
  notificationFrequency: NotificationFrequency;
  setNotificationFrequency: (frequency: NotificationFrequency) => void;
  description?: string;
}

export default function NotificationFrequencySection({
  notificationFrequency,
  setNotificationFrequency,
  description = 'Note: This limits how often you’ll receive notifications for this alert.',
}: NotificationFrequencySectionProps) {
  return (
    <div className="mt-6">
      <Label htmlFor="frequency" className="block text-sm font-medium mb-2 text-theme-primary">
        Notification Frequency
      </Label>
      <Select value={notificationFrequency} onValueChange={(value) => setNotificationFrequency(value as NotificationFrequency)}>
        <SelectTrigger className="w-full hover-border-primary" id="frequency">
          <SelectValue placeholder="Select frequency" />
        </SelectTrigger>
        <SelectContent className="bg-block">
          {frequencyOptions.map((opt) => (
            <div key={opt.value} className="hover-border-primary hover-text-primary">
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            </div>
          ))}
        </SelectContent>
      </Select>
      <p className="text-sm text-theme-muted mt-4">{description}</p>
    </div>
  );
}
