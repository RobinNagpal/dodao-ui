import { ChainImage } from '@/components/alerts/core/ChainImage';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Chain } from '@/types/alerts';

interface ChainsCellProps {
  chains: Chain[];
}

/**
 * Component for displaying selected chains in a table cell
 */
const ChainsCell: React.FC<ChainsCellProps> = ({ chains }) => {
  return (
    <div className="flex gap-1 justify-center">
      {chains.map((chain) => (
        <Badge key={chain.chainId} variant="outline" className="border border-primary-color flex items-center gap-1">
          <ChainImage chain={chain.name} />
          {chain.name}
        </Badge>
      ))}
    </div>
  );
};

export default ChainsCell;
