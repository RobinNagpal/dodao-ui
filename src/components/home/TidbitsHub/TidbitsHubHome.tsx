import { Faqs } from './components/Faqs';
import { Hero } from './components/Hero';
import { PrimaryFeatures } from './components/PrimaryFeatures';
import { SecondaryFeatures } from './components/SecondaryFeatures';
import Footer from './components/Footer';

export default function TidbitsHubHome() {
  return (
    <>
      <Hero />
      <PrimaryFeatures />
      <SecondaryFeatures />
      <Faqs />
      <Footer />
    </>
  );
}
