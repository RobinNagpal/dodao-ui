import Link from 'next/link';
import clsx from 'clsx';

const baseStyles = {
  solid: 'inline-flex justify-center rounded-md py-1 px-4 text-base font-semibold tracking-tight shadow-sm focus:outline-none',
  outline:
    'inline-flex justify-center rounded-md border py-[calc(theme(spacing.1)-1px)] px-[calc(theme(spacing.4)-1px)] text-base font-semibold tracking-tight focus:outline-none',
};

const variantStyles = {
  solid: {
    slate:
      'bg-surface-3 text-heading hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border active:bg-surface-2 active:text-heading/80 disabled:opacity-30 disabled:hover:bg-surface-3',
    blue: 'bg-primary text-primary-text hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:bg-primary/75 active:text-primary-text/80 disabled:opacity-30 disabled:hover:bg-primary',
    white:
      'bg-primary-text text-primary hover:text-primary/80 focus-visible:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-text active:bg-primary-text/90 active:text-primary/80 disabled:opacity-40 disabled:hover:text-primary',
  },
  outline: {
    slate:
      'border-border text-heading hover:border-border hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border active:border-border active:bg-surface active:text-heading/70 disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-transparent',
    blue: 'border-primary/40 text-primary hover:border-primary hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:text-primary/70 disabled:opacity-40 disabled:hover:border-primary/40 disabled:hover:bg-transparent',
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

  className = clsx(
    baseStyles[props.variant],
    props.variant === 'outline' ? variantStyles.outline[props.color] : props.variant === 'solid' ? variantStyles.solid[props.color] : undefined,
    className
  );

  return typeof props.href === 'undefined' ? <button className={className} {...props} /> : <Link className={className} {...props} />;
}
