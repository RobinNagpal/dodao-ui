import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled from 'styled-components';

const StyledNavLink = styled(Link)<{ $isActive: boolean }>`
  border-bottom: ${(props) => (props.$isActive ? '3px solid var(--primary-color)' : '')};
  color: ${(props) => (props.$isActive ? 'var(--primary-color)' : 'var(--text-color)')};
`;

export function DesktopNavLink({ label, href }: { label: string; isActive?: boolean; href: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <StyledNavLink
      href={href}
      $isActive={isActive}
      className={
        isActive
          ? 'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium text-gray-900'
          : 'inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700'
      }
    >
      {label}
    </StyledNavLink>
  );
}
