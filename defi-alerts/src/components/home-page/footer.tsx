import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contact" className="bg-[#1e202d] py-8">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        {/* upper two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* left: brand + copy */}
          <div>
            <h3 className="text-[#f1f1f3] text-2xl font-bold mb-4">DeFiAlerts</h3>
            <p className="text-[#f1f1f3]/80 max-w-md">
              Enterprise-grade alerting solutions for DeFi protocols. Custom alerts on supply/borrow rates, on any chain.
            </p>
          </div>

          {/* right: connect + icons */}
          <div className="flex flex-col items-start md:items-end">
            <h4 className="text-[#f1f1f3] text-xl font-semibold mb-4">Connect</h4>
            <div className="flex space-x-4">
              <Link href="https://github.com/RobinNagpal/dodao-ui/" target="_blank" rel="noopener" className="text-[#f1f1f3] hover:text-[#00AD79] transition">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link href="https://x.com/dodao_io" target="_blank" rel="noopener" className="text-[#f1f1f3] hover:text-[#00AD79] transition">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="https://www.linkedin.com/company/dodao/" target="_blank" rel="noopener" className="text-[#f1f1f3] hover:text-[#00AD79] transition">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href="mailto:contact@defialerts.com" className="text-[#f1f1f3] hover:text-[#00AD79] transition">
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
          </div>
        </div>

        {/* divider + copyright */}
        <div className="mt-10 border-t border-[#d1d5da] pt-6">
          <p className="text-center text-[#f1f1f3]/80">© 2025 DeFiAlerts. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
