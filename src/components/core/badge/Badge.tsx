import { PropsWithChildren } from 'react';

export enum BadgeSize {
  sm = 'small',
  md = 'medium',
  lg = 'large',
}

export enum BadgeColor {
  gray = 'gray',
  red = 'red',
  yellow = 'yellow',
  green = 'green',
  blue = 'blue',
  indigo = 'indigo',
  purple = 'purple',
  pink = 'pink',
}

interface BadgeProps extends PropsWithChildren {
  id?: string;
  className?: string;
  size?: BadgeSize;
  color?: BadgeColor;
  onRemove?: (id: string) => void;
}

export default function Badge({ id, className, size, color, children, onRemove }: BadgeProps) {
  const textSize = size === BadgeSize.sm ? 'text-xs' : size === BadgeSize.md ? 'text-sm' : 'text-base';
  const padding = size === BadgeSize.sm ? 'px-1 py-0.5' : size === BadgeSize.md ? 'px-2 py-1' : 'px-3 py-1.5';
  const fontWeight = size === BadgeSize.sm ? 'font-medium' : 'font-semibold';
  return (
    <span
      className={`inline-flex items-center rounded-full bg-${color}-50 ${padding} mr-2 ${textSize} ${fontWeight} text-${color}-700 ring-1 ring-inset ring-${color}-700/10 ${
        className || ''
      }`}
    >
      {children}
      {onRemove && (
        <button type="button" className="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-gray-500/20" onClick={() => onRemove(id!)}>
          <span className="sr-only">Remove</span>
          <svg viewBox="0 0 14 14" className="h-3.5 w-3.5 stroke-gray-600/50 group-hover:stroke-gray-600/75">
            <path d="M4 4l6 6m0-6l-6 6" />
          </svg>
          <span className="absolute -inset-1" />
        </button>
      )}
    </span>
  );
}
