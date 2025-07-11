import clsx from 'clsx';

export function SectionHeading({ number, children, className, ...props }: React.ComponentPropsWithoutRef<'h2'> & { number: string }) {
  return (
    <h2 className={clsx(className, 'inline-flex items-center rounded-full px-4 py-1 text-indigo-400 ring-1 ring-inset ring-indigo-400')} {...props}>
      <span className="font-mono text-sm" aria-hidden="true">
        {number.padStart(2, '0')}
      </span>
      <span className="ml-3 h-3.5 w-px bg-indigo-400/20" />
      <span className="ml-3 text-base font-medium tracking-tight">{children}</span>
    </h2>
  );
}
