import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';

export interface PopupProps {
  children: React.ReactNode;
  IconComponent: React.ComponentType<{ className?: string }>;
}

export default function Popup({ children, IconComponent }: PopupProps) {
  return (
    <Popover className="relative inline">
      <PopoverButton className="text-color focus:outline-none">
        <IconComponent className="size-5 mt-1" />
      </PopoverButton>

      <PopoverPanel className="absolute z-10 p-4" anchor="top">
        <div className="w-screen max-w-sm flex-auto rounded-3xl background-color p-4 text-sm/6 ring-1 text-left">{children}</div>
      </PopoverPanel>
    </Popover>
  );
}
