'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface AlertTypeCardProps {
  alertType: 'supply' | 'borrow';
  setAlertType: (type: 'supply' | 'borrow') => void;
  supplyLabel?: string;
  borrowLabel?: string;
}

export default function AlertTypeCard({ 
  alertType, 
  setAlertType,
  supplyLabel = 'Supply Alert',
  borrowLabel = 'Borrow Alert'
}: AlertTypeCardProps) {
  return (
    <Card className="mb-6 border-theme-primary bg-block border-primary-color">
      <CardHeader className="pb-1">
        <CardTitle className="text-lg text-theme-primary">Alert Type</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-theme-muted mb-4">Choose the type of alert you want to create.</p>

        <RadioGroup value={alertType} onValueChange={(value) => setAlertType(value as 'supply' | 'borrow')} className="space-y-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="supply" id="supply" className="h-4 w-4 border border-default rounded-full radio-checked" />
            <Label htmlFor="supply" className="text-theme-primary label-checked">
              {supplyLabel}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="borrow" id="borrow" className="h-4 w-4 border border-default rounded-full radio-checked" />
            <Label htmlFor="borrow" className="text-theme-primary label-checked">
              {borrowLabel}
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
