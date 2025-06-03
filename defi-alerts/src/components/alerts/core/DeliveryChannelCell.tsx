import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { Channel } from '@/types/alerts';

interface DeliveryChannelCellProps {
  deliveryChannels: Channel[];
}

/**
 * Component for displaying delivery channels in a table cell
 */
const DeliveryChannelCell: React.FC<DeliveryChannelCellProps> = ({ deliveryChannels }) => {
  if (!deliveryChannels || deliveryChannels.length === 0) {
    return <span className="text-xs text-theme-muted">Not set</span>;
  }

  const chan = deliveryChannels[0];
  const hasMultipleChannels = deliveryChannels.length > 1;

  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        <span className="text-xs font-medium text-theme-primary">{chan.channelType}</span>
        {hasMultipleChannels && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" className="h-5 w-5 p-0 hover-text-primary ml-2">
                  <Info size={14} />
                  <span className="sr-only">View all channels</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-block p-3 border border-theme-primary">
                <div className="space-y-2">
                  <h4 className="font-medium text-primary-color">All Delivery Channels</h4>
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
        )}
      </div>
      <span className="text-xs text-theme-muted truncate max-w-[180px]">{chan.channelType === 'EMAIL' ? chan.email : chan.webhookUrl}</span>
    </div>
  );
};

export default DeliveryChannelCell;
