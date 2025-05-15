import Navbar from '@/components/home-page/navbar';
import Hero from '@/components/home-page/hero';
import FeatureCards from '@/components/home-page/feature-cards';
import TechnicalArchitecture from '@/components/home-page/technical-architecture';
import Benefits from '@/components/home-page/benefits';
import CaseStudy from '@/components/home-page/case-study';
import Footer from '@/components/home-page/footer';
import WhyDefiAlerts from '@/components/home-page/why-defi-alerts';
import FAQ from '@/components/home-page/faq';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0D131A]">
      <Navbar />

      {/* Main content */}
      <main>
        <Hero />
        <WhyDefiAlerts />
        <FeatureCards />
        <TechnicalArchitecture />
        <Benefits />
        <CaseStudy />
        <FAQ />
      </main>

      <Footer />
    </div>
  );
}
