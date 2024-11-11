'use client';

import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import CreditUnion from './credit-union.mdx';
import { useState } from 'react';
import { ResearchIframeViewModal } from '@/components/home/DoDAOHome/components/ResearchFullScreenModel';

export default function CreditUnionPage() {
  const [isClickedReport, setIsClickedReport] = useState(false);

  const handleClickReport = () => {
    setIsClickedReport(true);
  };
  const handleCloseReport = () => {
    setIsClickedReport(false);
  };

  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <CreditUnion />
      </div>
      <p onClick={handleClickReport} className="mt-2 text-base font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer">
        See Report →
      </p>

      {isClickedReport && (
        <ResearchIframeViewModal
          onClose={handleCloseReport}
          title="Our Research Report"
          src="https://www.canva.com/design/DAGV6ZRPKLc/UTqlxBAyMnYwi5RamMDF2Q/view?embed"
        />
      )}
    </PageWrapper>
  );
}
