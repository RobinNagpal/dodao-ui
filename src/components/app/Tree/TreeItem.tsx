import { PropsWithChildren } from '@/types/PropsWithChildren';
import React, { useState, useEffect, ReactNode } from 'react';
import styled from 'styled-components';

export interface TreeItemProps extends PropsWithChildren {
  id: string | number;
  open?: boolean;
  initialOpen?: boolean;
  onToggle?: (id: string | number, state: boolean) => void;
}

const IconContainer = styled.div<{ isOpen: boolean }>`
  transform: ${(props) => (props.isOpen ? 'rotate(-45deg)' : 'rotate(135deg)')};
  transition: transform 0.3s;
`;

const TreeItemGroup = styled.ul<{ isOpen: boolean }>`
  max-height: ${(props) => (props.isOpen ? 'auto' : '0')};
  transform: ${(props) => (props.isOpen ? 'scaleY(1)' : 'scaleY(0)')};
  transition: max-height 0.3s, transform 0.3s;
`;

const TreeItem: React.FC<TreeItemProps> = ({ id, open = null, initialOpen = false, onToggle = () => {}, children }) => {
  const [isCollapsed, setIsCollapsed] = useState(!initialOpen);
  const hasChildren = React.Children.count(children) > 0;

  useEffect(() => {
    if (open !== null) {
      setIsCollapsed(!open);
    }
  }, [open]);

  const handleClick = () => {
    if (open === null) {
      setIsCollapsed(!isCollapsed);
      onToggle(id, !isCollapsed);
    } else {
      onToggle(id, !open);
    }
  };

  return (
    <li className="treeItem">
      <div className={`itemContent ${hasChildren && 'border-b cursor-pointer'}`} onClick={handleClick}>
        <div className="itemLabel">{children}</div>
        {hasChildren && (
          <IconContainer className="iconContainer" isOpen={!isCollapsed}>
            <span />
          </IconContainer>
        )}
      </div>
      {hasChildren && (
        <TreeItemGroup className="treeItemGroup" isOpen={!isCollapsed}>
          <div className="collapseWrapper w-full">{children}</div>
        </TreeItemGroup>
      )}
    </li>
  );
};

export default TreeItem;
