import Link from 'next/link';
import clsx from 'clsx';

const baseStyles = {
  solid: 'inline-flex justify-center rounded-lg py-2 px-3 text-sm font-semibold outline-2 outline-offset-2 transition-colors',
  outline:
    'inline-flex justify-center rounded-lg border py-[calc(theme(spacing.2)-1px)] px-[calc(theme(spacing.3)-1px)] text-sm outline-2 outline-offset-2 transition-colors',
};

const variantStyles = {
  solid: {
    cyan: 'relative overflow-hidden bg-cyan-500 before:absolute before:inset-0 active:before:bg-transparent hover:before:bg-white/10 active:bg-cyan-600 before:transition-colors',
    white: 'bg-white hover:bg-white/90 active:bg-white/90',
    gray: 'bg-gray-800 hover:bg-gray-900 active:bg-gray-800',
  },
  outline: {
    gray: 'border-gray-300 hover:border-gray-400 active:bg-gray-100',
  },
};

type VariantKey = keyof typeof variantStyles;
type ColorKey<Variant extends VariantKey> = keyof (typeof variantStyles)[Variant];

type ButtonProps<Variant extends VariantKey, Color extends ColorKey<Variant>> = {
  variant?: Variant;
  color?: Color;
} & (
  | Omit<React.ComponentPropsWithoutRef<typeof Link>, 'color'>
  | (Omit<React.ComponentPropsWithoutRef<'button'>, 'color'> & {
      href?: undefined;
    })
);

export function Button<Color extends ColorKey<Variant>, Variant extends VariantKey = 'solid'>({
  variant,
  color,
  className,
  ...props
}: ButtonProps<Variant, Color>) {
  variant = variant ?? ('solid' as Variant);
  color = color ?? ('gray' as Color);

  className = clsx(baseStyles[variant], (variantStyles as any)[variant][color], className);

  return typeof props.href === 'undefined' ? <button className={className} {...props} /> : <Link className={className} {...props} />;
}
