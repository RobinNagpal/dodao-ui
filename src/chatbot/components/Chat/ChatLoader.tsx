import CommandLineIcon from '@heroicons/react/24/outline/CommandLineIcon';
import { FC } from 'react';

interface Props {}

export const ChatLoader: FC<Props> = () => {
  return (
    <div className="group border-b border-black/10   dark:border-gray-900/50" style={{ overflowWrap: 'anywhere' }}>
      <div className="m-auto flex gap-4 p-4 text-base md:max-w-2xl md:gap-6 md:py-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
        <div className="min-w-[40px] items-end">
          <CommandLineIcon width={30} height={30} className="mr-4" />
        </div>
        <span className="animate-pulse cursor-default mt-1">▍</span>
      </div>
    </div>
  );
};
