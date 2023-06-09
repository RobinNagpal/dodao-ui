import { PropsWithChildren } from '@/types/PropsWithChildren';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import ChevronDown from '@/components/app/Icons/ChevronDown';

const StyledDropdown = styled.div`
  position: relative;
  display: block;
  width: 100%;
  .button {
    cursor: pointer;

    &:hover {
      color: var(--link-color);
    }
  }

  li {
    list-style: none;
    display: block;
    white-space: nowrap;
    padding-left: 18px;
    padding-right: 18px;
    padding-top: 3px;
    line-height: 34px;
    cursor: pointer;

    &.disabled {
      cursor: not-allowed;
    }

    &.selected,
    &:hover {
      background-color: var(--border-color);
      color: var(--link-color);
    }
  }
`;

const StyledSubMenuWrapper = styled.div`
  position: absolute;
  left: 110px;
  float:right;
  top: var(--top);
  width: auto;
  background-color: var(--header-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 0 20px -6px var(--border-color);
  z-index: 1;

  &.hidden {
    display: none;
  }

  .sub-menu {
    margin-left: 0;
  }

  .sub-menu::before {
    content: '';
    position: absolute;
    top: -0.45rem;
    right: var(--right);
    height: 0.75rem;
    width: 0.75rem;
    background-color: var(--header-bg);
    border-top: 1px solid var(--border-color);
    border-left: 1px solid var(--border-color);
    transform: rotate(45deg);
    z-index: 10;
    opacity: 1;
    transition-delay: 0.3s;
  }
`;

const Icon = ({ name, size = '21', className = '' }: { name: string; size?: string; className?: string }) => {
  // Add your icon rendering logic here
  return <i className={className}>{name}</i>;
};

export interface DropdownItemType {
  action: string;
  icon?: string;
  text: string;
  selected?: boolean;
}

interface DropdownProps extends PropsWithChildren {
  items: Array<DropdownItemType>;
  top?: string;
  right?: string;
  left?: string;
  subMenuClass?: string;
  hideDropdown?: boolean;
  onSelect?: (action: string) => void;
  onClickedNoDropdown?: () => void;
  className: string;
}

function Dropdown({
  items,
  top = '0',
  // right = '0',
  left = '0',
  subMenuClass = '',
  hideDropdown = false,
  onSelect,
  onClickedNoDropdown,
  children,
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownEl = useRef<HTMLDivElement>(null);

  const cssVars = {
    top: top,
    left: left,
  };

  const handleClick = (action: string) => {
    if (onSelect) {
      onSelect(action);
    }
    setOpen(false);
  };

  const close = (e: MouseEvent) => {
    if (dropdownEl.current && !dropdownEl.current.contains(e.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener('click', close);

    return () => {
      window.removeEventListener('click', close);
    };
  }, []);

  return (
    <StyledDropdown
      className={className}
      ref={dropdownEl}
      onClick={(e) => {
        if (hideDropdown) {
          if (onClickedNoDropdown) {
            onClickedNoDropdown();
          }
        } else {
          setOpen(!open);
        }
      }}
      style={cssVars}
    >
      <div className="button flex items-center">{children}<ChevronDown /></div>
      <StyledSubMenuWrapper className={open ? '' : 'hidden'}>
        <ul className={`sub-menu my-2 ${subMenuClass}`}>
          {items.map((item, index) => (
            <li key={index} onClick={() => handleClick(item.action)} className={item.selected ? 'selected' : ''}>
              {item.icon && <Icon name={item.icon} size="21" className="align-middle mr-2" />}
              {item.text}
            </li>
          ))}
        </ul>
      </StyledSubMenuWrapper>
    </StyledDropdown>
  );
}

export default Dropdown;
