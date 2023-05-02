import { ChartBarSquareIcon, Cog6ToothIcon, FolderIcon, GlobeAltIcon, ServerIcon, SignalIcon } from '@heroicons/react/24/outline';
import styled from 'styled-components';

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

const navigation = [
  { name: 'Projects', href: '#', icon: FolderIcon, current: false },
  { name: 'Deployments', href: '#', icon: ServerIcon, current: true },
  { name: 'Activity', href: '#', icon: SignalIcon, current: false },
  { name: 'Domains', href: '#', icon: GlobeAltIcon, current: false },
  { name: 'Usages', href: '#', icon: ChartBarSquareIcon, current: false },
  { name: 'Settings', href: '#', icon: Cog6ToothIcon, current: false },
];

const StyledNav = styled.nav`
  background-color: var(--bg-color);
  color: var(--text-color);

  .active-link {
    background-color: var(--primary-color);
    color: #fff;
  }
`;
export function MainNav() {
  return (
    <StyledNav className="flex flex-1 flex-col">
      <ul role="list" className="flex flex-1 flex-col gap-y-7">
        <li>
          <ul role="list" className="-mx-2 space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  className={classNames(item.current ? 'active-link' : '', 'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold')}
                >
                  <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </li>

        <li className="-mx-6 mt-auto">
          <a href="#" className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white ">
            <img
              className="h-8 w-8 rounded-full"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt=""
            />
            <span className="sr-only">Your profile</span>
            <span aria-hidden="true">Tom Cook</span>
          </a>
        </li>
      </ul>
    </StyledNav>
  );
}
