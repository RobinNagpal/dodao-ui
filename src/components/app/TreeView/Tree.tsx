import React, { FC, useState } from 'react';
import { TreeNode, TreeNodeType } from './TreeNode';

interface TreeProps {
  data: TreeNodeType[];
}
export const Tree: FC<TreeProps> = ({ data }) => {
  const [openNodes, setOpenNodes] = useState<{ [key: string]: boolean }>({});

  const renderTreeNode = (node: TreeNodeType, level: number) => {
    return (
      <TreeNode
        key={node.component.key as string}
        node={node}
        openNodes={openNodes}
        setOpenNodes={setOpenNodes}
        level={level}
        // Pass isOpen prop
        isOpen={openNodes[node.component.key as string] || false}
        // isOpen={true}

      />
    );
  };

  const renderedNodes = data.map((node) => renderTreeNode(node, 1));

  return <div>{renderedNodes}</div>;
};
export type { TreeNodeType };

