import { Footer } from '../DoDAOHome/components/Footer';
import { Faqs } from './components/Faqs';
import { Hero } from './components/Hero';
import { PrimaryFeatures } from './components/PrimaryFeatures';
import { SecondaryFeatures } from './components/SecondaryFeatures';

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
