import { roboticsAreas } from '@/components/robotics-page/areas/roboticsAreas';

const navigation = {
  social: [
    {
      name: 'X',
      href: 'https://twitter.com/dodao_io',
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/company/dodao/mycompany/',
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M0 0v24h24v-24h-24zm8 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.397-2.586 7-2.777 7 2.476v6.759z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ],
};

const siteColumns = [
  {
    title: 'Robotics',
    links: [
      { name: 'Model or no model', href: '/robotics/model-or-no-model' },
      ...roboticsAreas.map((area) => ({ name: area.name, href: `/robotics/${area.slug}` })),
      { name: 'Robotics services', href: '/robotics' },
    ],
  },
  {
    title: 'Products',
    links: [
      { name: 'KoalaGains', href: '/home-section/dodao-io/products/koalagains' },
      { name: 'DeFi Alerts', href: '/home-section/dodao-io/products/defi-alerts' },
      { name: 'Tidbits Hub', href: '/home-section/dodao-io/products/tidbitshub' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { name: 'Robotics notes', href: 'https://docs.dodao.io' },
      { name: 'AI Agent Bootcamp', href: '/home-section/dodao-io/education/ai-agent-bootcamp' },
      { name: 'Blockchain Bootcamp', href: '/home-section/dodao-io/education/blockchain-bootcamp' },
      { name: 'Research', href: '/home-section/dodao-io/research/real-world-assets' },
    ],
  },
];

/**
 * Site footer. `showSiteLinks` adds the dodao.io link columns (logo, robotics,
 * products, learning); without it this is the slim copyright + social bar
 * used by Tidbits Hub.
 */
export function Footer({ showSiteLinks = false }: { showSiteLinks?: boolean }) {
  return (
    <footer aria-labelledby="footer-heading" className={showSiteLinks ? 'bg-surface' : undefined}>
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 lg:px-8">
        {showSiteLinks && (
          <div className="grid grid-cols-2 gap-10 py-14 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <img src="/dodao-logo-dark.svg" alt="DoDAO" className="h-8 w-auto" />
              <p className="mt-4 max-w-xs text-sm leading-6 text-muted">Robotics engineering for manipulation, from simulation to the floor.</p>
              <a href="mailto:info@dodao.com" className="mt-3 inline-block text-sm font-medium text-link hover:underline">
                info@dodao.com
              </a>
            </div>
            {siteColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-semibold text-heading">{column.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.name}>
                      <a href={link.href} className="text-sm text-muted hover:text-heading">
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        <div className="border-t border-border pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            {navigation.social.map((item) => (
              <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-body">
                <span className="sr-only">{item.name}</span>
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </a>
            ))}
          </div>
          <p className="mt-8 text-xs leading-5 text-muted md:order-1 md:mt-0">
            Copyright &copy; {new Date().getFullYear()} Echofex Inc, Canada. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
