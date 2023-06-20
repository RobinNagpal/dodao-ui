// TreeNode.tsx
import React, { FC } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import styled from 'styled-components';
import ReadingIcon from '@/components/core/icons/ReadingIcon';
export interface TreeNodeType {
  component: JSX.Element;
  children?: TreeNodeType[];
}

interface TreeNodeProps {
  node: TreeNodeType;
  openNodes: { [key: string]: string };
  setOpenNodes: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  level: number;
}

export const TreeNode: FC<TreeNodeProps> = ({ node, openNodes, setOpenNodes, level }) => {
  const handleClick = () => {
    if (openNodes[level] === (node.component.key as string)) {
      setOpenNodes({ ...openNodes, [level]: '' });
    } else {
      setOpenNodes({ ...openNodes, [level]: node.component.key as string });
    }
  };

  const isOpen = openNodes[level] === (node.component.key as string);
  const CheckMark = styled.div`
    position: relative;
    height: 20px;
    width: 20px;
    text-align: center;
    background-color: #00813a;
    border: 1px solid #00813a;
    border-radius: 50%;
    z-index: 1;

    &:after {
      content: '';
      left: 6px;
      top: 3px;
      width: 6px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
      position: absolute;
    }
  `;
  return (
    <div className="px-4 py-2">
      <div className="flex items-center cursor-pointer" onClick={handleClick}>
        {node.children && node.children.length > 0 ? (
          isOpen ? (
            <ChevronDownIcon className="h-5 w-5 mr-2" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 mr-2" />
          )
        ) : null}
        {/* <div className="icon mr-3">
            <CheckMark />
          </div> */}
        {node.component}
      </div>
      {isOpen && node.children && (
        <div className="ml-4">
          {node.children.map((childNode) => (
            <TreeNode key={childNode.component.key as string} node={childNode} openNodes={openNodes} setOpenNodes={setOpenNodes} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
