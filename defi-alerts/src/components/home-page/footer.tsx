import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail, BookOpen, Code, LifeBuoy } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contact" className="bg-[#1e202d] py-8">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        {/* upper two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* left: brand + copy */}
          <div>
            <h3 className="text-[#f1f1f3] text-2xl font-bold mb-4">DeFiAlerts</h3>
            <p className="text-[#f1f1f3]/80 max-w-md mb-4">
              Proactive notification platform for DeFi opportunities and risks across all chains and protocols. Alerts for higher yields, rewards, governance
              events, position health, and unused funds.
            </p>
            <p className="text-[#00AD79] text-sm">Serving everyday users, power users, DAO treasuries, and developers.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#f1f1f3]">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-[#f1f1f3]/80 hover:text-[#00AD79] transition-colors flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[#f1f1f3]/80 hover:text-[#00AD79] transition-colors flex items-center">
                  <Code className="h-4 w-4 mr-2" />
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[#f1f1f3]/80 hover:text-[#00AD79] transition-colors flex items-center">
                  <LifeBuoy className="h-4 w-4 mr-2" />
                  Support Center
                </Link>
              </li>
            </ul>

            <h4 className="font-semibold mt-6 mb-2 text-[#f1f1f3]">Contact Us</h4>
            <Link href="mailto:contact@defialerts.com" className="text-[#f1f1f3]/80 hover:text-[#00AD79] transition-colors">
              contact@defialerts.com
            </Link>
          </div>

          {/* right: connect + icons */}
          <div className="flex flex-col items-start md:items-end">
            <h4 className="text-[#f1f1f3] text-xl font-semibold mb-4">Connect</h4>
            <div className="flex space-x-4 mb-6">
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
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-[#f1f1f3]/80 mb-4 md:mb-0">© 2025 DeFiAlerts. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link href="#" className="text-[#f1f1f3]/80 hover:text-[#00AD79] text-sm">
                Privacy Policy
              </Link>
              <Link href="#" className="text-[#f1f1f3]/80 hover:text-[#00AD79] text-sm">
                Terms of Service
              </Link>
              <Link href="#" className="text-[#f1f1f3]/80 hover:text-[#00AD79] text-sm">
                GDPR Compliance
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
