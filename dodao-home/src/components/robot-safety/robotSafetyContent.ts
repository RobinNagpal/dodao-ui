/**
 * Content for /robot-safety (robot safety & security readiness).
 *
 * A short web overview of the service. The longer PDF version carries the detail;
 * keep facts here in line with it and with the research in reports/Robot safety compliance offering.
 */

export const SAFETY_CONTACT_MAILTO = 'mailto:info@dodao.com?subject=Robot%20safety%20%26%20security%20readiness';

/** The four checks a robot passes between the factory and daily use. */
export const approvalChecks = [
  { name: 'The robot', signedBy: 'Robot maker', question: 'Is the robot itself built to the safety standards?' },
  { name: 'The cell', signedBy: 'Integrator', question: 'Is this task safe, with this gripper, speed and layout?' },
  { name: 'The site', signedBy: 'Inspector or test lab', question: 'Can it be switched on at this site?' },
  { name: 'Daily use', signedBy: 'Employer', question: 'Are people trained, and are changes recorded?' },
];

export type SafetyArea = {
  /** Anchor id on /robot-safety, also used by the nav and the homepage section. */
  id: string;
  number: number;
  /** Short name used in chips, nav and the self-check. */
  short: string;
  label: string;
  question: string;
  whyNow: string;
  whatWeDo: string;
  youGet: string[];
  standards: string[];
};

export const safetyAreas: SafetyArea[] = [
  {
    id: 'physical-safety',
    number: 1,
    short: 'Safe to work next to',
    label: 'Physical safety',
    question: 'Is it safe to work next to?',
    whyNow:
      'ISO 10218 was rewritten in 2025 and is far longer. A "cobot" label is not enough any more: each task, gripper and speed needs its own risk check, with force limits for each part of the body.',
    whatWeDo:
      'We run the risk assessment task by task. Simulation shows which contact points matter, so fewer need measuring on the real robot. Then we plan the force and stop-time tests and draft the technical file.',
    youGet: ['Risk assessment', 'Force test plan', 'Technical file draft'],
    standards: ['ISO 10218-1/-2', 'ISO 12100', 'ISO 13849', 'ANSI/A3 R15.06'],
  },
  {
    id: 'ai-behaviour',
    number: 2,
    short: 'Safe AI',
    label: 'AI behaviour',
    question: 'Does the AI stay safe after every update?',
    whyNow:
      'A model update can change how the robot moves near people, but most safety files assume a machine that never changes. From January 2027, if the AI itself keeps people safe, an outside body must review it in the EU.',
    whatWeDo:
      'We separate what the AI decides from what a safety layer always enforces. Then we re-run normal and rare test scenes in simulation after every update, and test the riskiest ones on the real robot.',
    youGet: ['Safety design note', 'Test scenes', 'Report per model version'],
    standards: ['ISO 10218-2', 'EU Machinery Regulation', 'EU AI Act'],
  },
  {
    id: 'cybersecurity',
    number: 3,
    short: 'Hard to hack',
    label: 'Product cybersecurity',
    question: 'Can someone hack the robot?',
    whyNow:
      'Robot security flaws now make the news. Since September 2026 the EU requires makers to report exploited flaws within 24 hours, and buyers increasingly ask for IEC 62443.',
    whatWeDo:
      'We review threats to the robot, controller, apps and remote access, and run a penetration test where experts try to break in. Then we list every software part and set up the reporting process.',
    youGet: ['Pen test report', 'Software parts list', 'Reporting playbook'],
    standards: ['EU Cyber Resilience Act', 'IEC 62443'],
  },
  {
    id: 'company-security',
    number: 4,
    short: 'Data safe',
    label: 'Company security',
    question: 'Is our data safe with your company?',
    whyNow:
      'The first large customer often asks for a SOC 2 report before signing. Their IT team asks where robot video is stored and who can log in remotely, and standard audit tools miss these robot parts.',
    whatWeDo:
      'We set the audit scope, close the gaps and set up controls in a tool such as Vanta or Drata, robot items included. Then we support the audit and answer buyer questionnaires.',
    youGet: ['Audit-ready controls', 'Audit support', 'Buyer security pack'],
    standards: ['SOC 2', 'ISO 27001'],
  },
];

export type Milestone = { date: string; iso: string; title: string; law: string };

/** Key dates. Status (in force / coming) is worked out against the build date. */
export const milestones: Milestone[] = [
  { date: 'Feb 2025', iso: '2025-02-01', title: 'New robot safety standard published', law: 'ISO 10218' },
  { date: '11 Sep 2026', iso: '2026-09-11', title: 'Report exploited security flaws within 24 hours', law: 'EU Cyber Resilience Act' },
  { date: '9 Dec 2026', iso: '2026-12-09', title: 'Software counts as a product in damage claims', law: 'EU Product Liability Directive' },
  { date: '20 Jan 2027', iso: '2027-01-20', title: 'New machinery law; safety AI needs outside review', law: 'EU Machinery Regulation' },
  { date: '11 Dec 2027', iso: '2027-12-11', title: 'Full product security rules, including CE marking', law: 'EU Cyber Resilience Act' },
];

export const keyFacts = [
  { value: '20 months', text: 'for one robot maker to get its robot listed by a US test lab.' },
  { value: '7–12 months', text: 'for a first SOC 2 report, often asked for before a deal is signed.' },
  { value: '€15M or 2.5%', text: 'of yearly turnover: the top fine under the EU Cyber Resilience Act.' },
];

export const markets = [
  {
    region: 'EU',
    title: 'A factory in Germany',
    summary: 'Safety is law.',
    points: [
      'CE marking under the new Machinery Regulation from January 2027.',
      'If the AI itself keeps people safe, an outside body reviews it first.',
      'Exploited security flaws are reported within 24 hours, starting now.',
    ],
  },
  {
    region: 'US',
    title: 'A warehouse in the US',
    summary: 'Buyers and inspectors set the bar.',
    points: [
      'No robot-specific law; after accidents, OSHA points to the voluntary standards.',
      'A local inspector approves the cell before power-on, often through a lab check.',
      "The buyer's IT team sends a security questionnaire and asks for SOC 2.",
    ],
  },
];

export const sharedEvidence = ['Risk assessment', 'Force tests', 'AI test scenes', 'Threat review', 'Software parts list'];

/** Self-check: if a statement is true, these areas apply. Mirrors the table in the PDF. */
export type Relevance = 'needed' | 'maybe';
export const selfCheckStatements: { text: string; areas: Partial<Record<SafetyArea['id'], Relevance>> }[] = [
  { text: 'Your robot works close to people, or in the same space', areas: { 'physical-safety': 'needed', 'ai-behaviour': 'maybe' } },
  { text: 'An AI model decides how the robot moves', areas: { 'physical-safety': 'needed', 'ai-behaviour': 'needed' } },
  { text: 'You sell, or plan to sell, in the EU', areas: { 'physical-safety': 'needed', 'ai-behaviour': 'maybe', cybersecurity: 'needed' } },
  { text: 'Your robot is online, or your team can log in to it remotely', areas: { cybersecurity: 'needed', 'company-security': 'maybe' } },
  { text: 'Robot data such as video, maps or logs goes to your cloud', areas: { cybersecurity: 'maybe', 'company-security': 'needed' } },
  {
    text: 'A large customer sent you a safety or security questionnaire',
    areas: { 'physical-safety': 'maybe', cybersecurity: 'maybe', 'company-security': 'needed' },
  },
];

export const engagementSteps = [
  { title: 'Short call', when: '30 min · free', text: 'You tell us what you sell, where and to whom. We tell you which of the four questions apply.' },
  { title: 'Gap check', when: '2–4 weeks · fixed fee', text: 'We review what you already have and list what is missing, sorted by deadline and risk.' },
  { title: 'Plan', when: '1 week', text: 'Tasks, owners and dates, and which tests need an outside lab and when to book them.' },
  { title: 'Test and collect evidence', when: 'Depends on scope', text: 'Simulation, real-robot and security tests, each one linked to the risk it covers.' },
  {
    title: 'Documents ready',
    when: 'Depends on scope',
    text: 'Technical file, test reports and security pack, in the format the lab, auditor or buyer expects.',
  },
  { title: 'Keep it current', when: 'Ongoing', text: 'When the gripper, software or AI model changes, we show what needs checking again.' },
];

export const roles = [
  {
    name: 'You',
    role: 'The robot company',
    duties: ['Share designs and software', 'Make the design decisions', 'Provide the robot for tests', 'Sign your own declarations'],
  },
  {
    name: 'Us',
    role: 'Preparation and evidence',
    duties: ['Find the gaps and plan the work', 'Draft risk checks and documents', 'Run simulation and security tests', 'Keep the evidence current'],
  },
  {
    name: 'Lab or auditor',
    role: 'Independent final check',
    duties: ['Independent testing', 'Site inspections', 'Certificates and audit reports'],
  },
];
