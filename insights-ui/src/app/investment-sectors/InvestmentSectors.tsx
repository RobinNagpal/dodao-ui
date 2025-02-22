'use client';

import dynamic from 'next/dynamic';
import { themeColors } from '@/util/theme-colors';
import React from 'react';
import styles from './InvestmentSectors.module.scss';
import rawJsonData from './investment-sectors.json';

// Dynamically import the Tree component and disable SSR
const Tree = dynamic(() => import('react-d3-tree'), { ssr: false });

interface Node {
  name: string;
  id: string;
  children?: Node[];
}

interface TreeGraphNode {
  name: string;
  attributes?: { id: string };
  children?: TreeGraphNode[];
  isExpanded?: boolean;
}

const convertToTreeRecursive = (node: Node): TreeGraphNode => {
  const children: TreeGraphNode[] | undefined = node.children?.map(convertToTreeRecursive);

  return {
    name: node.name,
    attributes: { id: node.id },
    children,
  };
};

const gicsData: TreeGraphNode = convertToTreeRecursive(rawJsonData);

export default function InvestmentSectors() {
  return (
    <div className={styles.investmentSectorsContainer} style={{ ...themeColors }}>
      <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
        <Tree
          data={gicsData}
          translate={{ x: 100, y: 50 }}
          pathFunc="diagonal"
          orientation="horizontal"
          collapsible
          zoomable
          nodeSize={{ x: 300, y: 200 }}
          depthFactor={500}
          separation={{ siblings: 1, nonSiblings: 1 }}
          initialDepth={1}
          shouldCollapseNeighborNodes={true}
          renderCustomNodeElement={({ nodeDatum, toggleNode }) => (
            <g>
              <rect
                width="200"
                height="60"
                x="-100"
                y="-30" // Centered vertically
                className={styles.nodeRect}
                onClick={toggleNode}
              />
              <foreignObject
                x="-100"
                y="-30" // Matching the rect's position
                width="200"
                height="60"
                style={{ overflow: 'visible' }}
              >
                <div
                  style={{
                    color: 'var(--text-color)',
                    fontSize: '15px',
                    lineHeight: '1.2',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                  }}
                  onClick={toggleNode}
                >
                  <div>{nodeDatum.name}</div>
                </div>
              </foreignObject>
            </g>
          )}
        />
      </div>
    </div>
  );
}
