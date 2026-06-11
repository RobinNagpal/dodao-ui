import { ChevronDownIcon } from '@heroicons/react/20/solid';
import {
  Bars3Icon,
  BeakerIcon,
  XMarkIcon,
  CodeBracketIcon,
  ChartBarIcon,
  CpuChipIcon,
  PresentationChartLineIcon,
  ComputerDesktopIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  LifebuoyIcon,
  ChatBubbleLeftEllipsisIcon,
  ShieldCheckIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

const products = [
  {
    name: 'KoalaGains',
    description: 'AI Agents that read filings, score projects, and give clear investing insights on crowdfunding and REITs.',
    href: '/home-section/dodao-io/products/koalagains',
    icon: ChartBarIcon,
  },
  {
    name: 'Ketchup HPLC Workflow',
    description: 'Gazebo simulation of the HPLC sample prep workflow for ketchup',
    href: '/home-section/dodao-io/products/ketchup-hplc-workflow',
    icon: BeakerIcon,
  },
  {
    name: 'DeFi Alerts',
    description: 'Real-time alerts on yields, rates, and position health across leading DeFi protocols and chains.',
    href: '/home-section/dodao-io/products/defi-alerts',
    icon: ShieldCheckIcon,
  },
];

const educationAreas = [
  {
    name: 'AI Agent Bootcamp',
    description: 'Hands-on training in AI agent design and deployment.',
    href: '/home-section/dodao-io/education/ai-agent-bootcamp',
    icon: CpuChipIcon,
  },
  {
    name: 'Prompt Engineering Guide',
    description: 'Learn prompt crafting and optimization techniques.',
    href: '/home-section/dodao-io/education/prompt-engineering-guide',
    icon: ChatBubbleLeftEllipsisIcon,
  },
  {
    name: 'Blockchain Bootcamp',
    description: 'Comprehensive training from basics to advanced blockchain technologies.',
    href: '/home-section/dodao-io/education/blockchain-bootcamp',
    icon: PresentationChartLineIcon,
  },
  {
    name: 'Educational Content',
    description: 'Customized educational websites to enhance learning.',
    href: '/home-section/dodao-io/education/educational-content',
    icon: ComputerDesktopIcon,
  },
];

const researchAreas = [
  {
    name: 'Real World Assets',
    description: 'Explore the integration of real-world assets on blockchain.',
    href: '/home-section/dodao-io/research/real-world-assets',
    icon: BuildingOfficeIcon,
  },
  {
    name: 'How Credit Unions Can Attract Gen Z',
    description: 'Strategies for credit unions to connect with Gen Z members.',
    href: '/home-section/dodao-io/research/credit-union',
    icon: UserGroupIcon,
  },
];

const roboticsServices = [
  {
    name: 'Simulation Setup',
    description: 'Gazebo and Isaac Sim worlds, modeled for your exact usecase.',
    href: '/home-section/dodao-io/services/simulation-setup',
    icon: BeakerIcon,
  },
  {
    name: 'Synthetic Data',
    description: 'Labeled images from simulation to train YOLO and other vision models.',
    href: '/home-section/dodao-io/services/synthetic-data',
    icon: EyeIcon,
  },
];

const aiAgentServices = [
  {
    name: 'AI Agent Development',
    description: 'Production AI agents that automate finance and ops workflows.',
    href: '/home-section/dodao-io/services/custom-ai-agent-dev',
    icon: CpuChipIcon,
  },
  {
    name: 'Maintenance & Support',
    description: 'Ongoing monitoring and support for AI agents in production.',
    href: '/home-section/dodao-io/services/maintenance-support',
    icon: LifebuoyIcon,
  },
];

const blockchainServices = [
  {
    name: 'Smart Contracts & DeFi Tooling',
    description: 'Secure smart contracts and custom DeFi tooling for protocols and DAOs.',
    href: '/home-section/dodao-io/services/smart-contract',
    icon: CodeBracketIcon,
  },
  {
    name: 'DeFi Analytics',
    description: 'Dashboards that turn on-chain data into clear, real-time decisions.',
    href: '/home-section/dodao-io/services/defi-analytics',
    icon: ChartBarIcon,
  },
];

interface MenuItem {
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<React.ComponentProps<'svg'>>;
}

function DesktopMenuItem({ item }: { item: MenuItem }) {
  return (
    <div className="group relative flex gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-surface-2">
      <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-surface-2 group-hover:bg-primary/20">
        <item.icon aria-hidden="true" className="h-6 w-6 text-muted group-hover:text-primary" />
      </div>
      <div className="flex-auto">
        <a href={item.href} className="block font-semibold text-heading">
          {item.name}
          <span className="absolute inset-0" />
        </a>
        <p className="mt-1 text-body">{item.description}</p>
      </div>
    </div>
  );
}

function DesktopServiceItem({ item }: { item: MenuItem }) {
  return (
    <div className="group relative mb-2 flex gap-x-4 rounded-lg p-4 hover:bg-surface-2">
      <div className="mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-surface-2 group-hover:bg-primary/20">
        <item.icon aria-hidden="true" className="h-6 w-6 text-muted group-hover:text-primary" />
      </div>
      <div>
        <a href={item.href} className="font-semibold text-heading">
          {item.name}
          <span className="absolute inset-0" />
        </a>
        <p className="mt-1 text-body">{item.description}</p>
      </div>
    </div>
  );
}

function DesktopDropdownTrigger({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex items-center gap-x-1 rounded-md p-1 text-sm font-semibold leading-6 text-heading transition-colors duration-200 group-hover/nav:bg-surface group-hover/nav:text-primary group-focus-within/nav:bg-surface group-focus-within/nav:text-primary"
    >
      {label}
      <ChevronDownIcon
        aria-hidden="true"
        className="h-5 w-5 flex-none text-muted transition-all duration-200 group-hover/nav:rotate-180 group-hover/nav:text-primary group-focus-within/nav:rotate-180 group-focus-within/nav:text-primary"
      />
    </button>
  );
}

export default function DoDAOHomeTopNav() {
  return (
    <header className="bg-bg">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        <div className="flex lg:flex-1">
          <a href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">DoDAO</span>
            <img
              alt="DoDAO logo"
              src="https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png"
              className="h-8 w-auto"
            />
          </a>
        </div>

        {/* Mobile menu (CSS-only via native <details>) */}
        <details className="group/mobile flex lg:hidden">
          <summary className="relative z-20 -m-2.5 inline-flex cursor-pointer list-none items-center justify-center rounded-md p-2.5 text-body [&::-webkit-details-marker]:hidden">
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6 group-open/mobile:hidden" />
            <XMarkIcon aria-hidden="true" className="hidden h-6 w-6 group-open/mobile:block" />
          </summary>
          <div className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-surface px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-border">
            <div className="flex items-center justify-between">
              <a href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">DoDAO</span>
                <img
                  alt="DoDAO logo"
                  src="https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png"
                  className="h-8 w-auto"
                />
              </a>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-border">
                <div className="space-y-2 py-6">
                  <details className="group -mx-3">
                    <summary className="flex w-full cursor-pointer list-none items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-heading hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
                      Product
                      <ChevronDownIcon aria-hidden="true" className="h-5 w-5 flex-none group-open:rotate-180" />
                    </summary>
                    <div className="mt-2 space-y-2">
                      {products.map((item) => (
                        <a key={item.name} href={item.href} className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-heading hover:bg-surface-2">
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </details>
                  <details className="group -mx-3">
                    <summary className="flex w-full cursor-pointer list-none items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-heading hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
                      Services
                      <ChevronDownIcon aria-hidden="true" className="h-5 w-5 flex-none group-open:rotate-180" />
                    </summary>
                    <div className="mt-2 space-y-2">
                      <a href="/robotics" className="block rounded-lg px-3 pb-2 pt-2 text-sm font-semibold text-heading hover:bg-surface-2">
                        Robotics
                      </a>
                      {roboticsServices.map((item) => (
                        <a key={item.name} href={item.href} className="block rounded-lg py-1 pl-6 pr-3 text-sm leading-7 text-body hover:bg-surface-2">
                          {item.name}
                        </a>
                      ))}

                      <div className="px-3 pb-2 pt-2 text-sm font-semibold text-heading">AI Agents</div>
                      {aiAgentServices.map((item) => (
                        <a key={item.name} href={item.href} className="block rounded-lg py-1 pl-6 pr-3 text-sm leading-7 text-body hover:bg-surface-2">
                          {item.name}
                        </a>
                      ))}

                      <div className="px-3 pb-2 pt-2 text-sm font-semibold text-heading">Blockchain</div>
                      {blockchainServices.map((item) => (
                        <a key={item.name} href={item.href} className="block rounded-lg py-1 pl-6 pr-3 text-sm leading-7 text-body hover:bg-surface-2">
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </details>
                  <details className="group -mx-3">
                    <summary className="flex w-full cursor-pointer list-none items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-heading hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
                      Education
                      <ChevronDownIcon aria-hidden="true" className="h-5 w-5 flex-none group-open:rotate-180" />
                    </summary>
                    <div className="mt-2 space-y-2">
                      {educationAreas.map((item) => (
                        <a key={item.name} href={item.href} className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-heading hover:bg-surface-2">
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </details>
                  <details className="group -mx-3">
                    <summary className="flex w-full cursor-pointer list-none items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-heading hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
                      Research
                      <ChevronDownIcon aria-hidden="true" className="h-5 w-5 flex-none group-open:rotate-180" />
                    </summary>
                    <div className="mt-2 space-y-2">
                      {researchAreas.map((item) => (
                        <a key={item.name} href={item.href} className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-heading hover:bg-surface-2">
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </details>
                </div>
                <div className="py-6">
                  <a href="#" className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-heading hover:bg-surface-2">
                    Log in
                  </a>
                </div>
              </div>
            </div>
          </div>
        </details>

        {/* Desktop dropdowns (CSS-only via hover / focus-within) */}
        <div className="hidden lg:flex lg:gap-x-12">
          <div className="group/nav relative">
            <DesktopDropdownTrigger label="Products" />
            <div className="absolute -left-8 top-full z-10 hidden w-screen max-w-md pt-3 group-hover/nav:block group-focus-within/nav:block">
              <div className="overflow-hidden rounded-3xl bg-surface shadow-lg ring-1 ring-border">
                <div className="p-4">
                  {products.map((item) => (
                    <DesktopMenuItem key={item.name} item={item} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="group/nav relative">
            <DesktopDropdownTrigger label="Services" />
            <div className="absolute left-1/2 top-full z-10 hidden w-screen max-w-max -translate-x-1/2 px-4 pt-3 group-hover/nav:flex group-focus-within/nav:flex">
              <div className="w-screen max-w-5xl flex-auto overflow-hidden rounded-3xl bg-surface text-sm/6 shadow-lg ring-1 ring-border">
                <div className="grid grid-cols-1 gap-6 p-4 lg:grid-cols-3">
                  <div>
                    <h3 className="mb-2 text-base font-semibold text-heading text-center">
                      <a href="/robotics" className="hover:text-primary transition-colors">
                        Robotics
                      </a>
                    </h3>
                    {roboticsServices.map((item) => (
                      <DesktopServiceItem key={item.name} item={item} />
                    ))}
                  </div>

                  <div>
                    <h3 className="mb-2 text-base font-semibold text-heading text-center">AI Agents</h3>
                    {aiAgentServices.map((item) => (
                      <DesktopServiceItem key={item.name} item={item} />
                    ))}
                  </div>

                  <div>
                    <h3 className="mb-2 text-base font-semibold text-heading text-center">Blockchain</h3>
                    {blockchainServices.map((item) => (
                      <DesktopServiceItem key={item.name} item={item} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="group/nav relative">
            <DesktopDropdownTrigger label="Education" />
            <div className="absolute -left-8 top-full z-10 hidden w-screen max-w-md pt-3 group-hover/nav:block group-focus-within/nav:block">
              <div className="overflow-hidden rounded-3xl bg-surface shadow-lg ring-1 ring-border">
                <div className="p-4">
                  {educationAreas.map((item) => (
                    <DesktopMenuItem key={item.name} item={item} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="group/nav relative">
            <DesktopDropdownTrigger label="Research" />
            <div className="absolute -left-8 top-full z-10 hidden w-screen max-w-md pt-3 group-hover/nav:block group-focus-within/nav:block">
              <div className="overflow-hidden rounded-3xl bg-surface shadow-lg ring-1 ring-border">
                <div className="p-4">
                  {researchAreas.map((item) => (
                    <DesktopMenuItem key={item.name} item={item} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end"></div>
      </nav>
    </header>
  );
}
