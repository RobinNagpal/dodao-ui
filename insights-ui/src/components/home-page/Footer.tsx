import { GridPattern } from '@/components/home-page/GridPattern';

export function Footer() {
  return (
    <footer className="relative bg-gray-800 pt-5 pb-20 sm:pt-14 sm:pb-32">
      <div className="relative text-center text-sm text-gray-400">
        <p>
          Copyright &copy; {new Date().getFullYear()} <strong className="text-white">KoalaGains.com</strong>. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
