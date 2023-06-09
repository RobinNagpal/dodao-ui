// Tree.tsx
import React, { FC, useState } from 'react';
import { TreeNode, TreeNodeType } from './TreeNode';

interface TreeProps {
  data: TreeNodeType[];
}

export const Tree: FC<TreeProps> = ({ data }) => {
  const [openNodes, setOpenNodes] = useState<{ [key: string]: string }>({});

  return (
    <div>
      {data.map((node) => (
        <TreeNode key={node.component.key as string} node={node} openNodes={openNodes} setOpenNodes={setOpenNodes} level={1} />
      ))}
    </div>
  );
};
