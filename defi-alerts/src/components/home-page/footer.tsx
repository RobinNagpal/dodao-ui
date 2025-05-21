import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail, BookOpen, Code, LifeBuoy } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contact" className="bg-[#1e202d] py-12 border-t border-[#d1d5da]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-xl mb-4 text-[#f1f1f3]">DeFiAlerts</h3>
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

          <div>
            <h4 className="font-semibold mb-4 text-[#f1f1f3]">Connect</h4>
            <div className="flex space-x-4 mb-6">
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

            <div className="bg-[#0D131A] p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-[#f1f1f3]">Subscribe to Updates</h4>
              <p className="text-sm text-[#f1f1f3]/80 mb-3">Get notified about new integrations and features.</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="bg-[#1e202d] text-[#f1f1f3] py-2 px-3 rounded-l-md w-full focus:outline-none focus:ring-1 focus:ring-[#00AD79]"
                />
                <button className="bg-[#00AD79] text-white py-2 px-4 rounded-r-md">Subscribe</button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#d1d5da]">
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
