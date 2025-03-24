'use client';

import { IndustryGroupCriteriaDefinition, CriterionDefinition } from '@/types/public-equity/criteria-types';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import Link from 'next/link';
import React, { useState } from 'react';

interface CriteriaTableProps {
  sectorName: string;
  industryGroupName: string;
  customCriteria?: IndustryGroupCriteriaDefinition;
  ticker: string;
}

export default function CriteriaTable({ sectorName, industryGroupName, customCriteria, ticker }: CriteriaTableProps) {
  const [criteria, setCriteria] = useState<CriterionDefinition[]>(customCriteria?.criteria || []);

  return (
    <PageWrapper>
      <div className="flex justify-between">
        <div></div>
        <div className="text-4xl">Custom Criteria</div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }} className="mt-4">
        <thead>
          <tr className="text-color">
            <th style={tableCellStyle}>Key</th>
            <th style={tableCellStyle}>Name</th>
            <th style={tableCellStyle}>Short Description</th>
            <th style={tableCellStyle}>Matching Instruction</th>
            <th style={tableCellStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {criteria.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: '10px', fontStyle: 'italic' }}>
                No criteria added yet.
              </td>
            </tr>
          ) : (
            criteria.map((criterion) => (
              <tr key={criterion.key}>
                <td style={tableCellStyle}>{criterion.key}</td>
                <td style={tableCellStyle}>{criterion.name}</td>
                <td style={tableCellStyle}>{criterion.shortDescription}</td>
                <td style={tableCellStyle}>{criterion.matchingInstruction}</td>
                <td style={tableCellStyle} className="w-48">
                  <div>
                    <Link href={`/public-equities/debug/tickers/${ticker}/${criterion.key}`} className="text-blue-500 hover:underline w-full">
                      Debug Page
                    </Link>
                  </div>
                  <div>
                    <Link
                      href={`/public-equities/industry-group-criteria/${slugify(sectorName)}/${slugify(industryGroupName)}/create`}
                      className="text-blue-500 hover:underline"
                    >
                      Criteria Page
                    </Link>
                  </div>
                  <div>
                    <Link href={`/public-equities/tickers/${ticker}`} className="text-blue-500 hover:underline">
                      Report Page
                    </Link>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </PageWrapper>
  );
}

const tableCellStyle = { padding: '10px', border: '1px solid #ddd' };
