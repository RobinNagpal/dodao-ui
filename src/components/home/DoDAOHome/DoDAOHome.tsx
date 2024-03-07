import { Hero } from './components/Hero';
import { Introduction } from './components/Introduction';
import { NavBar } from './components/NavBar';
import { AcademySites } from './components/AcademySites';
import { TidbitsHub } from './components/TidbitsHub';
import { AIChatbot } from './components/AIChatbot';
import { BlockchainCourses } from './components/BlockchainCourses';
import { BlockchainDevelopmentTooling } from './components/BlockchainDevelopmentTooling';
import { Footer } from './components/Footer';

export default function DoDAOHome() {
  return (
    <>
      <Hero />
      <Introduction />
      <NavBar />
      <TidbitsHub />
      <AcademySites />
      <AIChatbot />
      <BlockchainCourses />
      <BlockchainDevelopmentTooling />
      <Footer />
    </>
  );
}
