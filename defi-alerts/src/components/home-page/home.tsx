// defi-alerts/src/components/home-page/home.tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Navbar from '@/components/home-page/navbar';
import Hero from '@/components/home-page/hero';
import FeatureCards from '@/components/home-page/feature-cards';
import TechnicalArchitecture from '@/components/home-page/technical-architecture';
import Benefits from '@/components/home-page/benefits';
import CaseStudy from '@/components/home-page/case-study';
import Footer from '@/components/home-page/footer';
import WhyDefiAlerts from '@/components/home-page/why-defi-alerts';

export default function Home() {
  return (
    /* 0 0% 100% = white background, 240 10% 3.9% = near-black text */
    <div className="min-h-screen bg-[hsl(0_0%_100%)] text-[hsl(240_10%_3.9%)]">
      <Navbar />

      {/* Main sections */}
      <main>
        <Hero />
        <WhyDefiAlerts />
        <FeatureCards />
        <TechnicalArchitecture />
        <Benefits />
        <CaseStudy />

        {/* FAQ */}
        <section id="faq" className="container mx-auto py-24">
          <h2 className="mb-12 text-center text-3xl font-bold">Frequently Asked Questions</h2>

          <div className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-medium">How do I onboard my protocol?</AccordionTrigger>
                {/* 240 3.8% 46.1% = muted-foreground */}
                <AccordionContent className="text-[hsl(240_3.8%_46.1%)]">
                  Our onboarding process is streamlined for DeFi teams. We start with a technical discovery call, followed by API integration and customization
                  of your alert parameters. Most protocols are fully onboarded within&nbsp;2 weeks, with dedicated support throughout the process.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg font-medium">Can I self-host?</AccordionTrigger>
                <AccordionContent className="text-[hsl(240_3.8%_46.1%)]">
                  Yes, we offer both cloud-hosted and self-hosted deployment options. Our self-hosted solution gives you complete control over your data while
                  still benefiting from our regular updates and security patches. We provide comprehensive documentation and support for self-hosted
                  deployments.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
