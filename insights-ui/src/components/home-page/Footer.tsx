export function Footer() {
  return (
    <footer className="relative bg-gray-800 pt-4 pb-4 sm:pt-12 sm:pb-12">
      <div className="relative text-center text-sm text-gray-400">
        <p>
          Copyright &copy; {new Date().getFullYear()} <strong className="text-white">KoalaGains.com</strong>. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
