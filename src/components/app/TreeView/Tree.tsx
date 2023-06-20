// Tree.tsx
import React, { FC, useState } from 'react';
import { TreeNode, TreeNodeType } from './TreeNode';

interface TreeProps {
  data: TreeNodeType[];
  openNodes: { [key: string]: string };
  setOpenNodes: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
}

export const Tree: FC<TreeProps> = ({ data, openNodes, setOpenNodes }) => {
  return (
    <div>
      {data.map((node) => (
        <TreeNode key={node.component.key as string} node={node} openNodes={openNodes} setOpenNodes={setOpenNodes} level={1} />
      ))}
    </div>
  );
};
