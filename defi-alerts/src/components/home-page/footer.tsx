// defi-alerts/src/components/home-page/footer.tsx
import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const FG = 'hsl(240_10%_3.9%)'; // --foreground
const FG_MUTED = 'hsl(240_3.8%_46.1%)'; // --muted-foreground
const BG_MUTED = 'hsl(240_4.8%_95.9%)'; // --muted
const BORDER = 'hsl(240_5.9%_90%)'; // --border
const PRIMARY = 'hsl(270_50%_40%)'; // --primary

const Footer = () => (
  <footer id="contact" className={`py-12 border-t bg-[${BG_MUTED}] border-[${BORDER}]`}>
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h3 className="mb-4 text-xl font-bold">DeFiAlerts</h3>
          <p className={`max-w-md text-[${FG_MUTED}]`}>
            Enterprise-grade alerting solutions for DeFi protocols.&nbsp; Custom alerts on supply / borrow rates, on any chain.
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-semibold">Connect</h4>
          <div className="flex space-x-4">
            {(
              [
                ['https://github.com/RobinNagpal/dodao-ui/', Github],
                ['https://x.com/dodao_io', Twitter],
                ['https://www.linkedin.com/company/dodao/', Linkedin],
                ['mailto:contact@defialerts.com', Mail],
              ] as [string, React.ElementType][]
            ).map(([href, Icon]) => (
              <Link key={href} href={href} className={`transition-colors text-[${FG_MUTED}] hover:text-[${FG}]`}>
                <Icon className="h-5 w-5" />
                <span className="sr-only">{href}</span>
              </Link>
            ))}
          </div>

          <div className="mt-6">
            <h4 className="mb-2 font-semibold">Contact&nbsp;Us</h4>
            <Link href="mailto:contact@defialerts.com" className={`transition-colors text-[${FG_MUTED}] hover:text-[${FG}]`}>
              contact@defialerts.com
            </Link>
          </div>
        </div>
      </div>

      <div className={`mt-12 border-t pt-8 border-[${BORDER}]`}>
        <p className={`text-center text-[${FG_MUTED}]`}>© 2025 DeFiAlerts. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
