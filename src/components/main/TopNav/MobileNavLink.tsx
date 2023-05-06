import { Disclosure } from '@headlessui/react';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';
import styled from 'styled-components';

const StyledNavLink = styled.a<{ isActive: boolean }>`
  border-color: ${(props) => (props.isActive ? 'var(--primary-color)' : '')};
  color: ${(props) => (props.isActive ? 'var(--primary-color)' : '')};
`;
export function MobileNavLink({ label, href }: { label: string; isActive?: boolean; href: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Disclosure.Button as={Fragment}>
      <StyledNavLink
        isActive={isActive}
        href="#"
        className={
          isActive
            ? 'block border-l-4 bg-gray-100 py-2 pl-3 pr-4 text-base font-medium sm:pl-5 sm:pr-6'
            : 'block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 sm:pl-5 sm:pr-6'
        }
      >
        {label}
      </StyledNavLink>
    </Disclosure.Button>
  );
}
