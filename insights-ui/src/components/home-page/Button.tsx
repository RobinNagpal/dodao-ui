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
      'bg-gray-600 text-white hover:bg-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700 active:bg-gray-700 active:text-white/80 disabled:opacity-30 disabled:hover:bg-gray-600',
    // Updated from 'blue' → 'indigo'
    indigo:
      'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:bg-indigo-700 active:text-white/80 disabled:opacity-30 disabled:hover:bg-indigo-600',
    // Updated “white” variant to match darker theme
    // If you don’t need a “white” button in dark mode, remove or restyle as needed
    white:
      'bg-white text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-indigo-100 active:text-indigo-700/80 disabled:opacity-40 disabled:hover:bg-white',
  },
  outline: {
    slate:
      'border-gray-600 text-gray-100 hover:border-gray-500 hover:bg-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500 active:bg-gray-600 active:text-gray-200/80 disabled:opacity-40 disabled:hover:border-gray-600 disabled:hover:bg-transparent',
    // Updated from 'blue' → 'indigo'
    indigo:
      'border-indigo-400 text-indigo-400 hover:border-indigo-300 hover:bg-indigo-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 active:text-indigo-300/80 disabled:opacity-40 disabled:hover:border-indigo-400 disabled:hover:bg-transparent',
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
