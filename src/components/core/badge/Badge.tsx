import { PropsWithChildren } from 'react';
import styles from './Badge.module.scss';

export enum BadgeSize {
  sm = 'small',
  md = 'medium',
  lg = 'large',
}

export enum BadgeColor {
  base = 'base',
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
  size: BadgeSize;
  color: BadgeColor;
  blink?: boolean;
  onRemove?: (id: string) => void;
}

export default function Badge({ id, className, size, color, blink, children, onRemove }: BadgeProps) {
  const textSize = size === BadgeSize.sm ? 'text-xs' : size === BadgeSize.md ? 'text-sm' : 'text-base';
  const padding = size === BadgeSize.sm ? 'px-1 py-0.5' : size === BadgeSize.md ? 'px-2 py-1' : 'px-3 py-1.5';
  const fontWeight = size === BadgeSize.sm ? 'font-medium' : 'font-semibold';
  const colors = color === BadgeColor.base ? ` ${styles.baseColor}` : `bg-${color}-50 text-${color}-700  ring-${color}-700/10`;
  const blinkingClass = blink ? styles.blink : '';

  const sizeClasses = {
    [BadgeSize.sm]: 'text-xs px-1 py-0.5 font-medium',
    [BadgeSize.md]: 'text-sm px-2 py-1 font-semibold',
    [BadgeSize.lg]: 'text-base px-3 py-1.5 font-semibold',
  };

  const colorClasses = {
    [BadgeColor.base]: styles.baseColor,
    [BadgeColor.gray]: 'bg-gray-50 text-gray-700 ring-gray-700/10 ring-2 ring-inset',
    [BadgeColor.red]: 'bg-red-50 text-red-700 ring-red-700/10 ring-2 ring-inset',
    [BadgeColor.yellow]: 'bg-yellow-50 text-yellow-700 ring-yellow-700/10 ring-2 ring-inset',
    [BadgeColor.green]: 'bg-green-50 text-green-700 ring-green-700/10 ring-2 ring-inset',
    [BadgeColor.blue]: 'bg-blue-50 text-blue-700 ring-blue-700/10 ring-2 ring-inset',
    [BadgeColor.indigo]: 'bg-indigo-50 text-indigo-700 ring-indigo-700/10 ring-2 ring-inset',
    [BadgeColor.purple]: 'bg-purple-50 text-purple-700 ring-purple-700/10 ring-2 ring-inset',
    [BadgeColor.pink]: 'bg-pink-50 text-pink-700 ring-pink-700/10 ring-2 ring-inset',
  };

  return (
    <span className={`inline-flex items-center rounded-full mr-2 ${sizeClasses[size]} ${colorClasses[color]} ${className || ''} ${blinkingClass}`}>
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
