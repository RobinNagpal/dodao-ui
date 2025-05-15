import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contact" className="bg-[#1e202d] py-12 border-t border-[#d1d5da]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold text-xl mb-4 text-[#f1f1f3]">DeFiAlerts</h3>
            <p className="text-[#f1f1f3]/80 max-w-md">
              Enterprise-grade alerting solutions for DeFi protocols. Custom alerts on supply/borrow rates, on any chain.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#f1f1f3]">Connect</h4>
            <div className="flex space-x-4">
              <Link
                href="https://github.com/RobinNagpal/dodao-ui/"
                className="text-[#f1f1f3] hover:text-[#00AD79] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link href="https://x.com/dodao_io" className="text-[#f1f1f3] hover:text-[#00AD79] transition-colors" target="_blank" rel="noopener noreferrer">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="https://www.linkedin.com/company/dodao/"
                className="text-[#f1f1f3] hover:text-[#00AD79] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href="mailto:contact@defialerts.com" className="text-[#f1f1f3] hover:text-[#00AD79] transition-colors">
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </Link>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold mb-2 text-[#f1f1f3]">Contact Us</h4>
              <Link href="mailto:contact@defialerts.com" className="text-[#f1f1f3] hover:text-[#00AD79] transition-colors">
                contact@defialerts.com
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#d1d5da]">
          <p className="text-center text-[#f1f1f3]/80">© 2025 DeFiAlerts. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
