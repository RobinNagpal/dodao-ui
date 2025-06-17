'use client';

import { Dialog, DialogPanel, Disclosure, DisclosureButton, DisclosurePanel, Popover, PopoverButton, PopoverGroup, PopoverPanel } from '@headlessui/react';
import { ChevronDownIcon, PhoneIcon, PlayCircleIcon } from '@heroicons/react/20/solid';
import {
  AcademicCapIcon,
  Bars3Icon,
  ClipboardIcon,
  FingerPrintIcon,
  XMarkIcon,
  CodeBracketIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  CpuChipIcon,
  PresentationChartLineIcon,
  ComputerDesktopIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  UserGroupIcon,
  LifebuoyIcon,
  ChatBubbleLeftEllipsisIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

const products = [
  {
    name: 'KoalaGains',
    description: 'Use AI Agents to get deeper investing insights on crowdfunding and REITs',
    href: '/home-section/dodao-io/products/koalagains',
    icon: ChartBarIcon,
  },
  {
    name: 'Tidbits Hub',
    description: 'Empower your customers with quick educational tidbits.',
    href: '/home-section/dodao-io/products/tidbitshub',
    icon: ClipboardIcon,
  },
  {
    name: 'Academy Sites',
    description: 'Build immersive educational platforms for your audience.',
    href: '/home-section/dodao-io/products/academy-sites',
    icon: AcademicCapIcon,
  },
  {
    name: 'DeFi Alerts',
    description: 'Receive real-time alerts for yield, rates, and position health across DeFi protocol.',
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

const aiAgentServices = [
  {
    name: 'Custom AI Agent Development',
    description: 'Create powerful, personalized AI agent solutions for your business.',
    href: '/home-section/dodao-io/services/custom-ai-agent-dev',
    icon: CpuChipIcon,
  },
  {
    name: 'Maintenance and Support',
    description: 'Optimize and sustain your AI agents with expert maintenance and support.',
    href: '/home-section/dodao-io/services/maintenance-support',
    icon: LifebuoyIcon,
  },
];

const blockchainServices = [
  {
    name: 'Smart Contract Development',
    description: 'Craft secure and efficient decentralized applications.',
    href: '/home-section/dodao-io/services/smart-contract',
    icon: CodeBracketIcon,
  },
  {
    name: 'Custom DeFi Tooling',
    description: 'Enhance your development process with cutting-edge tools.',
    href: '/home-section/dodao-io/services/defi-tooling',
    icon: WrenchScrewdriverIcon,
  },
  {
    name: 'DeFi Analytics',
    description: 'Gain deep insights with advanced DeFi analytics.',
    href: '/home-section/dodao-io/services/defi-analytics',
    icon: ChartBarIcon,
  },
];

export default function DoDAOHomeTopNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white">
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
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
        <PopoverGroup className="hidden lg:flex lg:gap-x-12">
          <Popover className="relative">
            <PopoverButton className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900 p-1 data-[open]:text-indigo-600 data-[open]:bg-gray-50 rounded-md transition-colors duration-200">
              Products
              <ChevronDownIcon
                aria-hidden="true"
                className="h-5 w-5 flex-none text-gray-400 data-[open]:text-indigo-600 data-[open]:rotate-180 transition-all duration-200"
              />
            </PopoverButton>

            <PopoverPanel
              transition
              className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="p-4">
                {products.map((item) => (
                  <div key={item.name} className="group relative flex gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-50">
                    <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                      <item.icon aria-hidden="true" className="h-6 w-6 text-gray-600 group-hover:text-indigo-600" />
                    </div>
                    <div className="flex-auto">
                      <a href={item.href} className="block font-semibold text-gray-900">
                        {item.name}
                        <span className="absolute inset-0" />
                      </a>
                      <p className="mt-1 text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </PopoverPanel>
          </Popover>
          <Popover className="relative">
            <PopoverButton className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900 p-1 data-[open]:text-indigo-600 data-[open]:bg-gray-50 rounded-md transition-colors duration-200">
              Services
              <ChevronDownIcon
                aria-hidden="true"
                className="h-5 w-5 flex-none text-gray-400 data-[open]:text-indigo-600 data-[open]:rotate-180 transition-all duration-200"
              />
            </PopoverButton>
            <PopoverPanel
              transition
              className="absolute left-1/2 z-10 mt-3 flex w-screen max-w-max -translate-x-1/2 px-4
                         data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="w-screen max-w-3xl flex-auto overflow-hidden rounded-3xl bg-white text-sm/6 shadow-lg ring-1 ring-gray-900/5">
                <div className="grid grid-cols-1 gap-6 p-4 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-2 text-base font-semibold text-gray-900 text-center">Blockchain Services</h3>
                    {blockchainServices.map((item) => (
                      <div key={item.name} className="group relative mb-2 flex gap-x-4 rounded-lg p-4 hover:bg-gray-50">
                        <div className="mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                          <item.icon aria-hidden="true" className="h-6 w-6 text-gray-600 group-hover:text-indigo-600" />
                        </div>
                        <div>
                          <a href={item.href} className="font-semibold text-gray-900">
                            {item.name}
                            <span className="absolute inset-0" />
                          </a>
                          <p className="mt-1 text-gray-600">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 className="mb-2 text-base font-semibold text-gray-900 text-center">AI Agent Services</h3>
                    {aiAgentServices.map((item) => (
                      <div key={item.name} className="group relative mb-2 flex gap-x-4 rounded-lg p-4 hover:bg-gray-50">
                        <div className="mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                          <item.icon aria-hidden="true" className="h-6 w-6 text-gray-600 group-hover:text-indigo-600" />
                        </div>
                        <div>
                          <a href={item.href} className="font-semibold text-gray-900">
                            {item.name}
                            <span className="absolute inset-0" />
                          </a>
                          <p className="mt-1 text-gray-600">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverPanel>
          </Popover>
          <Popover className="relative">
            <PopoverButton className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900 p-1 data-[open]:text-indigo-600 data-[open]:bg-gray-50 rounded-md transition-colors duration-200">
              Education
              <ChevronDownIcon
                aria-hidden="true"
                className="h-5 w-5 flex-none text-gray-400 data-[open]:text-indigo-600 data-[open]:rotate-180 transition-all duration-200"
              />
            </PopoverButton>
            <PopoverPanel
              transition
              className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="p-4">
                {educationAreas.map((item) => (
                  <div key={item.name} className="group relative flex gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-50">
                    <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                      <item.icon aria-hidden="true" className="h-6 w-6 text-gray-600 group-hover:text-indigo-600" />
                    </div>
                    <div className="flex-auto">
                      <a href={item.href} className="block font-semibold text-gray-900">
                        {item.name}
                        <span className="absolute inset-0" />
                      </a>
                      <p className="mt-1 text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </PopoverPanel>
          </Popover>
          <Popover className="relative">
            <PopoverButton className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900 p-1 data-[open]:text-indigo-600 data-[open]:bg-gray-50 rounded-md transition-colors duration-200">
              Research
              <ChevronDownIcon
                aria-hidden="true"
                className="h-5 w-5 flex-none text-gray-400 data-[open]:text-indigo-600 data-[open]:rotate-180 transition-all duration-200"
              />
            </PopoverButton>

            <PopoverPanel
              transition
              className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="p-4">
                {researchAreas.map((item) => (
                  <div key={item.name} className="group relative flex gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-50">
                    <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                      <item.icon aria-hidden="true" className="h-6 w-6 text-gray-600 group-hover:text-indigo-600" />
                    </div>
                    <div className="flex-auto">
                      <a href={item.href} className="block font-semibold text-gray-900">
                        {item.name}
                        <span className="absolute inset-0" />
                      </a>
                      <p className="mt-1 text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </PopoverPanel>
          </Popover>
        </PopoverGroup>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end"></div>
      </nav>
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-10" />
        <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">DoDAO</span>
              <img
                alt="DoDAO logo"
                src="https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png"
                className="h-8 w-auto"
              />
            </a>
            <button type="button" onClick={() => setMobileMenuOpen(false)} className="-m-2.5 rounded-md p-2.5 text-gray-700">
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                <Disclosure as="div" className="-mx-3">
                  <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                    Product
                    <ChevronDownIcon aria-hidden="true" className="h-5 w-5 flex-none group-data-[open]:rotate-180" />
                  </DisclosureButton>
                  <DisclosurePanel className="mt-2 space-y-2">
                    {products.map((item) => (
                      <DisclosureButton
                        key={item.name}
                        as="a"
                        href={item.href}
                        className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      >
                        {item.name}
                      </DisclosureButton>
                    ))}
                  </DisclosurePanel>
                </Disclosure>
                <Disclosure as="div" className="-mx-3">
                  <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                    Services
                    <ChevronDownIcon aria-hidden="true" className="h-5 w-5 flex-none group-data-[open]:rotate-180" />
                  </DisclosureButton>
                  <DisclosurePanel className="mt-2 space-y-2">
                    <div className="px-3 pb-2 pt-2 text-sm font-semibold text-gray-900">AI Agent Services</div>
                    {aiAgentServices.map((item) => (
                      <DisclosureButton
                        key={item.name}
                        as="a"
                        href={item.href}
                        className="block rounded-lg py-1 pl-6 pr-3 text-sm leading-7 text-gray-900 hover:bg-gray-50"
                      >
                        {item.name}
                      </DisclosureButton>
                    ))}

                    <div className="px-3 pb-2 pt-2 text-sm font-semibold text-gray-900">Blockchain Services</div>
                    {blockchainServices.map((item) => (
                      <DisclosureButton
                        key={item.name}
                        as="a"
                        href={item.href}
                        className="block rounded-lg py-1 pl-6 pr-3 text-sm leading-7 text-gray-900 hover:bg-gray-50"
                      >
                        {item.name}
                      </DisclosureButton>
                    ))}
                  </DisclosurePanel>
                </Disclosure>
                <Disclosure as="div" className="-mx-3">
                  <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                    Education
                    <ChevronDownIcon aria-hidden="true" className="h-5 w-5 flex-none group-data-[open]:rotate-180" />
                  </DisclosureButton>
                  <DisclosurePanel className="mt-2 space-y-2">
                    {educationAreas.map((item) => (
                      <DisclosureButton
                        key={item.name}
                        as="a"
                        href={item.href}
                        className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      >
                        {item.name}
                      </DisclosureButton>
                    ))}
                  </DisclosurePanel>
                </Disclosure>
                <Disclosure as="div" className="-mx-3">
                  <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                    Research
                    <ChevronDownIcon aria-hidden="true" className="h-5 w-5 flex-none group-data-[open]:rotate-180" />
                  </DisclosureButton>
                  <DisclosurePanel className="mt-2 space-y-2">
                    {researchAreas.map((item) => (
                      <DisclosureButton
                        key={item.name}
                        as="a"
                        href={item.href}
                        className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      >
                        {item.name}
                      </DisclosureButton>
                    ))}
                  </DisclosurePanel>
                </Disclosure>
              </div>
              <div className="py-6">
                <a href="#" className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                  Log in
                </a>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
