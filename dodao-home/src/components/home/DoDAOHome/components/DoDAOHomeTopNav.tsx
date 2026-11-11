import { ChevronDownIcon } from '@heroicons/react/20/solid';
import {
  AcademicCapIcon,
  ArrowPathIcon,
  Bars3Icon,
  BeakerIcon,
  FunnelIcon,
  XMarkIcon,
  CodeBracketIcon,
  ChartBarIcon,
  CpuChipIcon,
  LifebuoyIcon,
  ShieldCheckIcon,
  EyeIcon,
  LightBulbIcon,
  CubeTransparentIcon,
  HandRaisedIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { roboticsAreas as areas } from '@/components/robotics-page/areas/roboticsAreas';
import { useCases as allUseCases } from '@/components/robotics-page/use-cases/useCases';
import { CONTACT_MAILTO } from './DoDAOHomeHero';

interface MenuItem {
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<React.ComponentProps<'svg'>>;
}

const products: MenuItem[] = [
  {
    name: 'KoalaGains',
    description: 'AI Agents that read filings, score projects, and give clear investing insights on crowdfunding and REITs.',
    href: '/home-section/dodao-io/products/koalagains',
    icon: ChartBarIcon,
  },
  {
    name: 'DeFi Alerts',
    description: 'Real-time alerts on yields, rates, and position health across leading DeFi protocols and chains.',
    href: '/home-section/dodao-io/products/defi-alerts',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Tidbits Hub',
    description: 'Short step-by-step lessons, one-minute videos and clickable demos that teach a product in minutes.',
    href: '/home-section/dodao-io/products/tidbitshub',
    icon: AcademicCapIcon,
  },
];

const areaIcons: Record<string, MenuItem['icon']> = {
  simulation: CubeTransparentIcon,
  perception: EyeIcon,
  manipulation: HandRaisedIcon,
  learning: CpuChipIcon,
  integration: WrenchScrewdriverIcon,
};

const roboticsAreas: MenuItem[] = [
  {
    name: 'Model or no model',
    description: 'How we decide, stage by stage, where a learned model belongs.',
    href: '/robotics/model-or-no-model',
    icon: LightBulbIcon,
  },
  ...areas.map((area) => ({ name: area.name, description: area.summary, href: `/robotics/${area.slug}`, icon: areaIcons[area.slug] })),
];

const useCaseIcons: Record<string, MenuItem['icon']> = {
  'test-tube-pouring': FunnelIcon,
  'tube-uncapping': ArrowPathIcon,
  'glass-racking': BeakerIcon,
};

const useCases: MenuItem[] = allUseCases.map((useCase) => ({
  name: useCase.name,
  description: useCase.summary,
  href: `/robotics/use-cases/${useCase.slug}`,
  icon: useCaseIcons[useCase.slug] ?? BeakerIcon,
}));

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

function MenuLink({ item }: { item: MenuItem }) {
  return (
    <a href={item.href} className="group flex gap-x-3 rounded-lg p-3 hover:bg-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
      <item.icon aria-hidden="true" className="mt-0.5 h-5 w-5 flex-none text-muted group-hover:text-primary" />
      <span>
        <span className="block text-sm font-semibold text-heading">{item.name}</span>
        <span className="mt-0.5 block text-sm leading-5 text-muted">{item.description}</span>
      </span>
    </a>
  );
}

function MenuColumn({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <div>
      <p className="px-3 pb-1 text-xs font-medium text-muted">{title}</p>
      {items.map((item) => (
        <MenuLink key={item.name} item={item} />
      ))}
    </div>
  );
}

function DesktopDropdown({ label, children, panelClassName = 'w-[22rem]' }: { label: string; children: React.ReactNode; panelClassName?: string }) {
  return (
    <div className="group/nav relative">
      <button
        type="button"
        className="flex items-center gap-x-1 rounded-md px-2 py-1.5 text-sm font-medium text-heading hover:bg-surface-2/60 group-focus-within/nav:bg-surface-2/60"
      >
        {label}
        <ChevronDownIcon
          aria-hidden="true"
          className="h-4 w-4 flex-none text-muted transition-transform duration-150 group-hover/nav:rotate-180 group-focus-within/nav:rotate-180"
        />
      </button>
      <div className="absolute left-1/2 top-full z-30 hidden -translate-x-1/2 pt-2 group-hover/nav:block group-focus-within/nav:block">
        <div className={`rounded-xl bg-surface p-3 shadow-[0_12px_32px_-12px_rgb(var(--heading-rgb)/0.25)] ring-1 ring-border ${panelClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

function MobileGroup({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <details className="group -mx-3">
      <summary className="flex w-full cursor-pointer list-none items-center justify-between rounded-lg px-3 py-2.5 text-base font-semibold text-heading hover:bg-bg [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDownIcon aria-hidden="true" className="h-5 w-5 flex-none text-muted group-open:rotate-180" />
      </summary>
      <div className="mt-1 space-y-1 pb-2">
        {items.map((item) => (
          <a key={item.name} href={item.href} className="block rounded-lg py-2 pl-6 pr-3 text-sm text-body hover:bg-bg">
            {item.name}
          </a>
        ))}
      </div>
    </details>
  );
}

export default function DoDAOHomeTopNav() {
  const aiAndWeb3 = [...products, ...aiAgentServices, ...blockchainServices];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg">
      <nav aria-label="Global" className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <a href="/" className="-m-1.5 flex-none p-1.5">
          <span className="sr-only">DoDAO</span>
          <img alt="DoDAO logo" src="/brand/dodao-logo-dark.svg" className="h-7 w-auto" />
        </a>

        {/* Desktop menus (CSS-only via hover / focus-within) */}
        <div className="hidden items-center gap-x-2 lg:flex">
          <DesktopDropdown label="Robotics" panelClassName="w-[24rem]">
            <MenuColumn title="Capabilities" items={roboticsAreas} />
          </DesktopDropdown>
          <DesktopDropdown label="Use Cases" panelClassName="w-[24rem]">
            <MenuColumn title="Built end to end, in simulation" items={useCases} />
          </DesktopDropdown>
          <DesktopDropdown label="AI & Web3" panelClassName="w-[40rem]">
            <div className="grid grid-cols-2 gap-2">
              <MenuColumn title="Products" items={products} />
              <MenuColumn title="Services" items={[...aiAgentServices, ...blockchainServices]} />
            </div>
          </DesktopDropdown>
          <a
            href="https://docs.dodao.io"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md px-2 py-1.5 text-sm font-medium text-heading hover:bg-surface-2/60"
          >
            Docs
          </a>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={CONTACT_MAILTO}
            className="hidden rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-text hover:bg-link focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:inline-flex"
          >
            Start a project
          </a>

          {/* Mobile menu (CSS-only via native <details>) */}
          <details className="group/mobile lg:hidden">
            <summary className="relative z-50 -m-2 inline-flex cursor-pointer list-none items-center justify-center rounded-md p-2 text-heading [&::-webkit-details-marker]:hidden">
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="h-6 w-6 group-open/mobile:hidden" />
              <XMarkIcon aria-hidden="true" className="hidden h-6 w-6 group-open/mobile:block" />
            </summary>
            <div className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto border-t border-border bg-surface px-4 py-6 sm:px-6">
              <div className="space-y-1">
                <MobileGroup title="Robotics" items={roboticsAreas} />
                <MobileGroup title="Use Cases" items={useCases} />
                <MobileGroup title="AI & Web3" items={aiAndWeb3} />
                <a
                  href="https://docs.dodao.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold text-heading hover:bg-bg"
                >
                  Docs
                </a>
              </div>
              <a
                href={CONTACT_MAILTO}
                className="mt-6 flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-base font-semibold text-primary-text"
              >
                Start a project
              </a>
            </div>
          </details>
        </div>
      </nav>
    </header>
  );
}
