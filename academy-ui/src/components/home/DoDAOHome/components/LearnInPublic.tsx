import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { ActionLink, SectionIntro } from './SiteUi';

type DocLink = {
  title: string;
  description: string;
  href: string;
};

const docLinks: DocLink[] = [
  {
    title: 'Vision-language-action models',
    description: 'π0, GR00T, SmolVLA, OpenVLA and more: size, hardware needed and licence for each.',
    href: 'https://docs.dodao.io/learned-models/language-models/most-used--vision-language-action-models/',
  },
  {
    title: 'Evaluation and failure',
    description: 'How many trials it takes before a success rate means anything.',
    href: 'https://docs.dodao.io/learned-models/making-models-work-on-an-arm/most-used--evaluation-and-failure/',
  },
  {
    title: 'Depth cameras compared',
    description: 'Published accuracy, working range and price for the cameras we use on arms.',
    href: 'https://docs.dodao.io/perception/object-perception/sensors/',
  },
  {
    title: 'Six-DoF grasp models',
    description: 'Which grasp models fit which grippers, and which licences let you ship them.',
    href: 'https://docs.dodao.io/learned-models/grasp-models/most-used--six-dof-grasps/',
  },
  {
    title: 'Licences and platforms',
    description: 'Which motion-planning and arm-control tools you can actually ship in a product.',
    href: 'https://docs.dodao.io/frameworks/arm-movement/licences-and-platforms/',
  },
];

// From the docs.dodao.io index page.
const stats = [
  { value: '9', label: 'books' },
  { value: '70', label: 'chapters' },
  { value: '334', label: 'sections' },
  { value: '117 h', label: 'of reading' },
];

export default function LearnInPublic() {
  return (
    <section id="docs" className="dodao-light scroll-mt-20 bg-bg py-24 sm:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-5">
          <SectionIntro
            title="We learn in public"
            lead="Our robotics notes cover simulation, perception, grasping, motion and learned policies, with every model's hardware needs and licence written down. They are the best preview of how we will think about your project."
          />
          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-border ring-1 ring-border">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-surface px-5 py-5">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="font-display block text-3xl font-semibold text-heading">{stat.value}</span>
                  <span className="text-sm text-muted">{stat.label}</span>
                </dd>
              </div>
            ))}
          </dl>
          <ActionLink href="https://docs.dodao.io" external variant="secondary" className="mt-8">
            Open docs.dodao.io
          </ActionLink>
        </div>

        <ul className="space-y-3 lg:col-span-6 lg:col-start-7">
          {docLinks.map((doc) => (
            <li key={doc.title}>
              <a
                href={doc.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start justify-between gap-6 rounded-2xl bg-surface p-6 ring-1 ring-border transition hover:ring-primary/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                <span>
                  <span className="block text-lg font-semibold text-heading group-hover:text-link">{doc.title}</span>
                  <span className="mt-1 block text-base leading-7 text-body">{doc.description}</span>
                </span>
                <ArrowUpRightIcon className="mt-1 h-5 w-5 flex-none text-muted transition group-hover:text-primary" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
