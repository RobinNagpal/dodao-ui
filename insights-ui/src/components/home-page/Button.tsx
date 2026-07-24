import clsx from 'clsx';
import Link from 'next/link';

const baseStyles = {
  solid: 'inline-flex justify-center rounded-md py-1 px-4 text-base font-semibold tracking-tight shadow-sm focus:outline-hidden',
  outline:
    'inline-flex justify-center rounded-md border py-[calc(--spacing(1)-1px)] px-[calc(--spacing(4)-1px)] text-base font-semibold tracking-tight focus:outline-hidden',
};

const variantStyles = {
  solid: {
    // You can keep 'slate' if you want a neutral/gray button
    slate:
      'bg-surface-3 text-heading hover:bg-surface-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700 active:bg-surface-2 active:opacity-80 disabled:opacity-30 disabled:hover:bg-surface-3',
    // Updated from 'blue' → 'indigo'
    indigo:
      'bg-primary text-primary-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:text-white/80 disabled:opacity-30',
    // Updated “white” variant to match darker theme
    // If you don’t need a “white” button in dark mode, remove or restyle as needed
    white:
      'bg-surface text-primary hover:text-primary hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-indigo-100 active:text-indigo-700/80 disabled:opacity-40 disabled:hover:bg-surface',
  },
  outline: {
    slate:
      'border-border text-body hover:border-border hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500 active:bg-surface-3 active:opacity-80 disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-transparent',
    // Updated from 'blue' → 'indigo'
    indigo:
      'border-primary text-link hover:border-primary hover:bg-indigo-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 active:text-indigo-300/80 disabled:opacity-40 disabled:hover:border-primary disabled:hover:bg-transparent',
  },
};

type ButtonProps = (
  | {
      variant?: 'solid';
      color?: keyof typeof variantStyles.solid;
    }
  | {
      variant: 'outline';
      color?: keyof typeof variantStyles.outline;
    }
) &
  (
    | Omit<React.ComponentPropsWithoutRef<typeof Link>, 'color'>
    | (Omit<React.ComponentPropsWithoutRef<'button'>, 'color'> & {
        href?: undefined;
      })
  );

export function Button({ className, ...props }: ButtonProps) {
  props.variant ??= 'solid';
  props.color ??= 'slate';

  className = clsx(baseStyles[props.variant], props.variant === 'outline' ? variantStyles.outline[props.color] : variantStyles.solid[props.color], className);

  return typeof props.href === 'undefined' ? <button className={className} {...props} /> : <Link className={className} {...props} />;
}
