import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';

export interface PopupProps {
  children: React.ReactNode;
  IconComponent: React.ComponentType<{ className?: string }>;
  IconClasses?: string;
  IconButtonTitle?: string;
}

export default function Popup({ children, IconComponent, IconClasses, IconButtonTitle }: PopupProps) {
  return (
    <Popover className="relative inline">
      <PopoverButton className="text-color focus:outline-none" title={IconButtonTitle}>
        <IconComponent className={IconClasses ?? 'size-5 mt-1'} />
      </PopoverButton>

      <PopoverPanel className="absolute z-10 p-4" anchor="bottom">
        <div className="max-w-sm flex-auto rounded-3xl background-color p-4 text-sm/6 ring-1 text-left">{children}</div>
      </PopoverPanel>
    </Popover>
  );
}
