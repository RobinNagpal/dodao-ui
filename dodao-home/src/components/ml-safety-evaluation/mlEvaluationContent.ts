/**
 * Content for /ml-safety-evaluation: ML evaluation tasks DoDAO performs as a subcontractor
 * to notified bodies under the EU Machinery Regulation (EU) 2023/1230.
 *
 * Audience: notified bodies, not robot makers (robot makers have /robot-safety).
 * Keep facts in line with the printable PDF (source: reports/service-overview-source/ml-evaluation-notified-bodies.html).
 */

export const ML_EVAL_PDF = {
  href: '/ml-safety-evaluation/dodao-ml-safety-evaluation-for-notified-bodies.pdf',
  fileName: 'DoDAO - ML safety evaluation for notified bodies.pdf',
  details: 'PDF · 3 pages · 367 KB',
};

export const ML_EVAL_CONTACT_MAILTO = 'mailto:info@dodao.com?subject=ML%20safety%20evaluation%20for%20notified%20bodies';

export const REGULATION_URL = 'https://eur-lex.europa.eu/eli/reg/2023/1230/oj';

/** The two Annex I Part A items that make a notified body mandatory for ML safety functions. */
export const scopeItems = [
  {
    ref: 'Annex I, Part A, item 5',
    text: 'Safety components with fully or partially self-evolving behaviour using machine learning approaches ensuring safety functions.',
  },
  {
    ref: 'Annex I, Part A, item 6',
    text: 'Machinery with embedded systems of that kind, not placed on the market separately, for those systems only.',
  },
];

/** Why ML files are hard for a notified body to assess today. */
export const challenges = [
  {
    title: 'No harmonised standard for ML',
    text: 'No harmonised machinery standard covers machine learning yet. Where none applies, the notified body decides the tests, so each ML file needs its own test design.',
  },
  {
    title: 'Test evidence is the hardest part',
    text: 'Annex IV asks for test results (point g) and for the data, development, testing and validation processes behind sensor-based safety functions (point n). For a learned model, these take the most work to check.',
  },
  {
    title: 'Models keep changing',
    text: 'A retrained model can be a change to the approved type. Each release may need re-testing before an addition to the certificate.',
  },
];

export type RoleColumn = { name: string; role: string; duties: string[] };

/** Who does what in a subcontracted ML evaluation. */
export const roles: RoleColumn[] = [
  {
    name: 'Manufacturer',
    role: 'Applies for the certificate',
    duties: ['Technical file, frozen model and data versions', 'Access to the specimen and test data', 'Written consent to the subcontracting'],
  },
  {
    name: 'DoDAO',
    role: 'Subcontractor for specific technical tasks',
    duties: ['Detailed test plan for the assigned tasks', 'File review, testing and verification', 'Test report with raw data, no conformity statement'],
  },
  {
    name: 'Notified body',
    role: 'Keeps the assessment and the decision',
    duties: ['Contract review and the overall evaluation plan', 'Approval of our test plan, review of our report', 'Conformity decision and certificate'],
  },
];

export type Package = {
  id: string;
  number: number;
  title: string;
  summary: string;
  basis: string;
  groups: { name: string; checks: string[] }[];
  output: string;
};

/** The three task packages (tasks 4.2 to 4.11 of our internal ML evaluation plan). */
export const packages: Package[] = [
  {
    id: 'file-review',
    number: 1,
    title: 'ML technical file review',
    summary: 'We check the scope and the ML parts of the Annex IV technical file, and send you a gap list before testing starts.',
    basis: 'Annex I, Part A, items 5 and 6; Annex IV, Part A, points (b), (f), (g) and (n)',
    groups: [
      {
        name: 'Scope check',
        checks: [
          'Which functions use ML, and which of those ensure safety',
          'Whether the model can change its behaviour from learning, before or after sale',
          'A written scope memo, for your decision on items 5 and 6',
        ],
      },
      {
        name: 'For each ML safety function, we check the file describes',
        checks: [
          'The model, its sensor inputs, its outputs and its place in the control system',
          'The task and movement space in measurable terms: zones, speeds, forces, joint limits',
          'ML failure modes in the risk assessment: wrong outputs, missed detections, drift, and the risks of intended evolution',
          'The training, validation and test data, and how the model was developed and validated',
          'Test plans and results, the logging design, and the update and retraining process',
        ],
      },
    ],
    output: 'Gap list per requirement, with no view on overall conformity',
  },
  {
    id: 'data-model-testing',
    number: 2,
    title: 'Data, performance and robustness testing',
    summary: 'We test the frozen model and its data independently of the manufacturer’s own results.',
    basis: 'Annex IV point (g); Annex III 1.2.1; method from ISO/IEC TR 5469:2024',
    groups: [
      {
        name: 'Data review',
        checks: [
          'Training and test data cover the operating conditions stated in the instructions',
          'Test data is kept apart from training data',
          'Label error rate measured on a sample',
          'The tested model traces to the exact data version used',
        ],
      },
      {
        name: 'Performance',
        checks: [
          'Frozen model run on a held-out test set',
          'Missed detections and false alarms reported separately, per condition',
          'A confidence bound on every number, compared with the manufacturer’s target',
        ],
      },
      {
        name: 'Robustness',
        checks: [
          'Glare, dust, partial blocking, unusual objects and body positions, and small input changes that should not change the output',
          'Sensor faults: noise, dropped frames, delay, a dead sensor',
          'The machine goes to a safe state when the model is uncertain',
        ],
      },
    ],
    output: 'Test report with results per condition and their confidence',
  },
  {
    id: 'requirement-verification',
    number: 3,
    title: 'Verification of the ML safety requirements',
    summary: 'We test, on the machine and in simulation, each Annex III requirement that applies to self-evolving control systems.',
    basis: 'Annex III 1.1.9 and 1.2.1; Annex VII on changes to an approved type',
    groups: [
      {
        name: 'Limits, logging and correction',
        checks: [
          'Movement limits: we try to drive the ML past its task and movement space, at maximum speed and load',
          'Logging: safety decisions can be rebuilt from a log kept for one year, and uploaded safety software versions are logged for five years',
          'Correction: stops work in every mode while the ML is active, and a bad model can be rolled back',
        ],
      },
      {
        name: 'Separation, updates and security',
        checks: [
          'An ML failure cannot disable the conventional safety functions (EN ISO 13849-1, EN IEC 62061)',
          'Each update is re-tested against the same test set and limits before release, and any learning in use stays bounded',
          'Model weights, data and safety settings are protected, changes are recorded, and an untested model cannot be pushed remotely (IEC 62443)',
        ],
      },
    ],
    output: 'Verification report with pass or fail against each agreed criterion',
  },
];

/** Requirement to test to evidence, as it appears in our reports. */
export const traceRows = [
  {
    requirement: 'Stay within the defined task and movement space',
    ref: 'Annex III 1.2.1',
    test: 'Commanded and provoked limit violations, at the edges of the space, before and after a simulated model change',
    evidence: 'Pass or fail per limit, largest overshoot',
  },
  {
    requirement: 'Record safety-related decisions, keep them for one year',
    ref: 'Annex III 1.2.1',
    test: 'Trigger decisions, export the log, try to edit or delete entries',
    evidence: 'Rebuilt decisions, retention and tamper results',
  },
  {
    requirement: 'Allow the machine to be corrected at all times',
    ref: 'Annex III 1.2.1',
    test: 'Emergency and protective stops in every mode with the ML active; rollback to the last safe version',
    evidence: 'Stop times, rollback result',
  },
  {
    requirement: 'Identify and protect safety software and data',
    ref: 'Annex III 1.1.9',
    test: 'Read installed model versions and checksums; attempt to load an unsigned model',
    evidence: 'Checksums, accepted or blocked',
  },
  {
    requirement: 'Test results for the ML safety function',
    ref: 'Annex IV (g)',
    test: 'Held-out test set, per lighting, distance, body size and other conditions',
    evidence: 'Missed detections, false alarms, 95% confidence bounds',
  },
];

/** Worked statistics example used on the page and in the PDF. */
export const trialsExample = {
  claim: 'The manufacturer claims a 99.9% success rate.',
  answer: 'To show a failure rate below 0.1% with 95% confidence, and with zero failures, takes about 3,000 trials.',
  method: 'This is the "rule of three": 3 ÷ 0.001 = 3,000.',
  how: 'Simulation finds the conditions that matter and runs the bulk of the search. The trials you rely on run on the specimen.',
};

export const engagementSteps = [
  {
    title: 'Framework agreement',
    text: 'You qualify us and sign a contract covering scope, methods, confidentiality and liability. You inform your notifying authority.',
  },
  { title: 'Per-job checks', text: 'We sign an independence declaration for the product. The manufacturer agrees in writing to the subcontracting.' },
  { title: 'Test plan', text: 'You plan the overall evaluation. We propose a detailed plan for our tasks, with pass criteria. You approve it.' },
  {
    title: 'Testing',
    text: 'On one frozen model version and one data version, in simulation and on the specimen at the manufacturer’s site or your lab.',
  },
  { title: 'Report', text: 'Results against each requirement, with raw data, scripts and checksums. Gaps stated as facts. No conformity statement.' },
  { title: 'Review and updates', text: 'You review the report and may ask for retests. Later model updates are re-tested against the same plan.' },
];

/** What every test report contains. */
export const reportContents = [
  'Product, software version, model file checksum and data version tested',
  'The requirement each test addresses',
  'Method, equipment, environment and test set size',
  'Results with pass or fail against the agreed criterion, and the confidence in each number',
  'Deviations from the plan, and why',
  'Gaps stated as facts, with no conformity statement',
  'Names and signatures of the testers and the reviewer',
];

/** Commitments that make our work usable inside your assessment. */
export const safeguards = [
  {
    title: 'Independence',
    text: 'The independence rules of Article 30 apply to us as to you. We do not test a product that we designed, built, sold or advised on, and we sign a declaration for every job.',
  },
  {
    title: 'Separate from our readiness work',
    text: 'DoDAO also helps robot makers prepare for safety checks. Any product we have worked on in that role is excluded, and our client list is open to you.',
  },
  {
    title: 'Confidentiality',
    text: 'Source code, models and data are used only for the job, held as the contract sets out, and returned or deleted at the end.',
  },
  {
    title: 'Records you can audit',
    text: 'Staff qualifications, test plans, raw data, scripts and checksums are kept so that every test can be repeated and inspected.',
  },
];

/** Open points we expect to agree with each notified body. */
export const openPoints = [
  'How you read "self-evolving behaviour" for a model trained before sale that does not learn in use',
  'Which method documents you accept for ML testing while no harmonised standard covers it',
  'Pass criteria for ML performance, since no standard sets the numbers',
  'Whether you require ISO/IEC 17025 accreditation for the ML test scope, or accept work under your own quality system',
];

/** What we bring. */
export const strengths = [
  {
    title: 'We build and break ML for robots',
    text: 'We train and evaluate perception models and learned arm policies, including imitation learning, VLA fine-tuning and reinforcement learning. We know where they fail.',
  },
  {
    title: 'Simulation of real cells',
    text: 'We model real arms, grippers and cells in Gazebo, MuJoCo and Isaac Sim. That lets us search thousands of conditions before using time on the specimen.',
  },
  {
    title: 'Evidence in your format',
    text: 'Every test links to the clause it addresses, with the raw data and checksums needed to repeat it.',
  },
];

export const keyDates = [
  { date: '20 Jan 2024', text: 'Rules on notified bodies apply' },
  { date: '20 Jan 2027', text: 'Regulation applies; ML safety functions need a notified body' },
  { date: 'Up to 5 years', text: 'Validity of a Module B certificate, with additions for type changes' },
];
