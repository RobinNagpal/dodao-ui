import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ChainSelectProps {
  onValueChange: (value: string) => void;
  defaultValue?: string;
  chains: string[];
  className?: string;
  placeholder?: string;
}

/**
 * A reusable component for selecting chains
 */
const ChainSelect: React.FC<ChainSelectProps> = ({
  onValueChange,
  defaultValue = 'all',
  chains,
  className = 'w-full md:w-[180px]',
  placeholder = 'All Chains',
}) => {
  return (
    <Select onValueChange={onValueChange} defaultValue={defaultValue}>
      <SelectTrigger className={`${className} border-theme-border-primary`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-block">
        <div className="hover-border-primary hover-text-primary">
          <SelectItem value="all">All Chains</SelectItem>
        </div>
        {chains.map((chain) => (
          <div key={chain} className="hover-border-primary hover-text-primary">
            <SelectItem key={chain} value={chain.toLowerCase()}>
              {chain}
            </SelectItem>
          </div>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ChainSelect;
