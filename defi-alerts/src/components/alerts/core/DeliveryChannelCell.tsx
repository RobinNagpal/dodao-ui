import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Mail, Globe, SendHorizonal } from 'lucide-react';
import { Channel } from '@/types/alerts';

interface DeliveryChannelCellProps {
  deliveryChannels: Channel[];
  isMini?: boolean;
}

/**
 * Component for displaying delivery channels in a table cell
 * @param isMini - When true, shows only icons with tooltip for details
 */
const DeliveryChannelCell: React.FC<DeliveryChannelCellProps> = ({ deliveryChannels, isMini = false }) => {
  if (!deliveryChannels || deliveryChannels.length === 0) {
    return <span className="text-xs text-theme-muted">Not set</span>;
  }

  const chan = deliveryChannels[0];
  const hasMultipleChannels = deliveryChannels.length > 1;

  // Mini version - show only icons with tooltip
  if (isMini) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              {hasMultipleChannels ? (
                <Button size="icon" className="h-5 w-5 p-0 hover-text-primary">
                  <SendHorizonal size={14} />
                  <span className="sr-only">View delivery channels details</span>
                </Button>
              ) : (
                <Button size="icon" className="h-5 w-5 p-0 hover-text-primary">
                  {chan.channelType === 'EMAIL' ? <Mail size={14} /> : <Globe size={14} />}
                  <span className="sr-only">View delivery channel details</span>
                </Button>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs bg-block p-3 border border-theme-primary">
            <div className="space-y-2">
              <h4 className="font-medium text-primary-color">Delivery {hasMultipleChannels ? 'Channels' : 'Channel'}</h4>
              <ul className="space-y-1">
                {deliveryChannels.map((c, i) => (
                  <li key={i} className="text-xs text-theme-muted">
                    <span className="font-medium">{c.channelType.charAt(0).toUpperCase() + c.channelType.slice(1).toLowerCase()}:</span>{' '}
                    {c.channelType === 'EMAIL' ? c.email : c.webhookUrl}
                  </li>
                ))}
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Regular version - show all channels directly
  return (
    <div className="rounded-md border border-theme-border bg-theme-card p-3 shadow-sm">
      <div className="flex items-center mb-2">
        <SendHorizonal size={16} className="mr-2 text-theme-primary" />
        <span className="text-sm font-medium text-theme-primary">Delivery Channels ({deliveryChannels.length})</span>
      </div>
      <div className="space-y-2">
        {deliveryChannels.map((channel, index) => (
          <div key={index} className="flex items-center p-2 rounded-md bg-theme-background hover:bg-theme-hover transition-colors">
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center mr-2 rounded-full bg-theme-primary/10">
              {channel.channelType === 'EMAIL' ? <Mail size={14} className="text-theme-primary" /> : <Globe size={14} className="text-theme-primary" />}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-theme-primary">{channel.channelType === 'EMAIL' ? 'Email' : 'Webhook'}</span>
              <span className="text-xs text-theme-muted truncate max-w-[180px]">{channel.channelType === 'EMAIL' ? channel.email : channel.webhookUrl}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliveryChannelCell;
