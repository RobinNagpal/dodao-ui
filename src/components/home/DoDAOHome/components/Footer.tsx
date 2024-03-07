import { GridPattern } from './GridPattern';

export function Footer() {
  return (
    <footer className="relative pb-20 pt-5 sm:pb-32 sm:pt-14">
      <div className="absolute inset-x-0 top-0 h-32 text-slate-900/10 [mask-image:linear-gradient(white,transparent)]">
        <GridPattern x="50%" />
      </div>
      <div className="relative text-center text-sm text-slate-600">
        <p className="mt-6 text-sm text-slate-500 sm:mt-0">Copyright &copy; {new Date().getFullYear()} DoDAO. All rights reserved.</p>
      </div>
    </footer>
  );
}
