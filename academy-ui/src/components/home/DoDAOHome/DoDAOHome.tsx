import DoDAOHomeHero from './components/DoDAOHomeHero';
import EarlierWork from './components/EarlierWork';
import EngagementSteps from './components/EngagementSteps';
import { Footer } from './components/Footer';
import HowWeHelp from './components/HowWeHelp';
import LearnInPublic from './components/LearnInPublic';
import ModelOrCodeMap from './components/ModelOrCodeMap';
import StartProject from './components/StartProject';
import WhatWeBuild from './components/WhatWeBuild';

export default function DoDAOHome() {
  return (
    <div>
      {/* Robotics first: what we do, how we help, and the model-vs-code call */}
      <DoDAOHomeHero />
      <HowWeHelp />
      <ModelOrCodeMap />

      {/* The ten technical areas (linking to /robotics/[area]) and how a project runs */}
      <WhatWeBuild />
      <EngagementSteps />
      <LearnInPublic />

      {/* Earlier AI agent + DeFi work, linking out to each product page */}
      <EarlierWork />

      <StartProject />
      <Footer showSiteLinks />
    </div>
  );
}
