import React, { FC, useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

export interface TreeNodeType {
  component: JSX.Element;
  children?: TreeNodeType[];
}

interface TreeNodeProps {
  node: TreeNodeType;
  openNodes: { [key: string]: boolean };
  setOpenNodes: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  level: number;
  isOpen: boolean; // Add isOpen prop
}

export const TreeNode: FC<TreeNodeProps> = ({ node, openNodes, setOpenNodes, level, isOpen }) => {
  const handleClick = () => {
    setOpenNodes((prevOpenNodes) => ({
      ...prevOpenNodes,
      [node.component.key as string]: !prevOpenNodes[node.component.key as string],
    }));
  };
  

  const isQuestionsNode = node.component.props.href?.includes('/questions'); // Check if it is the "Questions" node
  const isChapterSubmissionsNode = node.component.props.href?.includes('/submission'); // Check if it is the "Chapter Submissions" node

  return (
    <div className="px-4 py-2">
      <div className="flex items-center cursor-pointer" onClick={handleClick}>
        {node.children && !isQuestionsNode && !isChapterSubmissionsNode && ( // Add condition to exclude "Questions" and "Chapter Submissions"
          isOpen ? (
            <ChevronDownIcon className="h-5 w-5 mr-2" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 mr-2" />
          )
        )}
        {node.component}
      </div>
      {isOpen && node.children && (
        <div className="ml-4">
          {node.children.map((childNode) => (
            <TreeNode
              key={childNode.component.key as string}
              node={childNode}
              openNodes={openNodes}
              setOpenNodes={setOpenNodes}
              level={level + 1}
              isOpen={openNodes[childNode.component.key as string] || false} // Pass isOpen prop to sub-nodes
            />
          ))}
        </div>
      )}
    </div>
  );
};
