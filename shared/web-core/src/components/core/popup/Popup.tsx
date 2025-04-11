import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';

export interface PopupProps {
  children: React.ReactNode;
  IconComponent: React.ComponentType<{ className?: string }>;
}

export default function Popup({ children, IconComponent }: PopupProps) {
  return (
    <Popover className="relative inline">
      <PopoverButton className="text-color focus:outline-none">
        <IconComponent className="size-5" />
      </PopoverButton>

      <PopoverPanel
        transition
        className="absolute left-1/2 z-10 mt-5 flex w-screen max-w-max -translate-x-1/2 px-4 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
      >
        <div className="w-screen max-w-sm flex-auto rounded-3xl background-color p-4 text-sm/6 ring-1 text-left">{children}</div>
      </PopoverPanel>
    </Popover>
  );
}
