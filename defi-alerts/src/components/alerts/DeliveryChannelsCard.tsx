'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Plus, X } from 'lucide-react';
import { type Channel } from '@/types/alerts';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';

interface DeliveryChannelsCardProps {
  channels: Channel[];
  addChannel: () => void;
  updateChannel: (idx: number, field: keyof Channel, val: string) => void;
  removeChannel: (idx: number) => void;
  errors?: {
    channels?: string[];
  };
  session?: DoDAOSession;
}

export default function DeliveryChannelsCard({ channels, addChannel, updateChannel, removeChannel, errors = {}, session }: DeliveryChannelsCardProps) {
  return (
    <Card className="mb-6 border-theme-primary bg-block border-primary-color">
      <CardHeader className="pb-1 flex flex-row items-center justify-between">
        <CardTitle className="text-lg text-theme-primary">Delivery Channel Settings</CardTitle>
        <Button size="sm" onClick={addChannel} className="text-theme-primary border border-theme-primary hover-border-primary hover-text-primary">
          <Plus size={16} className="mr-1" /> Add Channel
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-theme-muted mb-4">Choose how you want to receive your alerts.</p>

        {channels.map((ch, i) => (
          <div key={i} className="mb-4 flex items-center gap-4">
            <Select
              value={ch.channelType}
              onValueChange={(value) => {
                updateChannel(i, 'channelType', value as Channel['channelType']);
                if (value === 'EMAIL' && session?.username) {
                  updateChannel(i, 'email', session.username);
                }
              }}
            >
              <SelectTrigger className="w-[150px] hover-border-primary">
                <SelectValue placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent className="bg-block">
                <div className="hover-border-primary hover-text-primary">
                  <SelectItem value="EMAIL">Email</SelectItem>
                </div>
                <div className="hover-border-primary hover-text-primary">
                  <SelectItem value="WEBHOOK">Webhook</SelectItem>
                </div>
              </SelectContent>
            </Select>

            {ch.channelType === 'EMAIL' ? (
              <div className="flex-1 flex flex-col">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={ch.email || ''}
                  onChange={(e) => updateChannel(i, 'email', e.target.value)}
                  readOnly={true}
                  className={`flex-1 border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                    errors?.channels && errors.channels[i] ? 'border-red-500' : ''
                  } ${ch.channelType === 'EMAIL' ? 'bg-block' : ''}`}
                />
                {errors?.channels && errors.channels[i] && (
                  <div className="mt-1 flex items-center text-red-500 text-sm">
                    <AlertCircle size={14} className="mr-1" />
                    <span>{errors.channels[i]}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <Input
                  type="url"
                  placeholder="https://webhook.site/..."
                  value={ch.webhookUrl || ''}
                  onChange={(e) => updateChannel(i, 'webhookUrl', e.target.value)}
                  className={`flex-1 border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                    errors?.channels && errors.channels[i] ? 'border-red-500' : ''
                  }`}
                />
                {errors?.channels && errors.channels[i] && (
                  <div className="mt-1 flex items-center text-red-500 text-sm">
                    <AlertCircle size={14} className="mr-1" />
                    <span>{errors.channels[i]}</span>
                  </div>
                )}
              </div>
            )}

            {channels.length > 1 && (
              <Button variant="ghost" size="icon" onClick={() => removeChannel(i)} className="text-red-500 h-8 w-8">
                <X size={16} />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
