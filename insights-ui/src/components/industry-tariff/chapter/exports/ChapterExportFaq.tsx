import ChapterFaqApproach2 from '@/components/industry-tariff/chapter/faq/ChapterFaqApproach2';
import type { TariffExportFaqContent } from '@/types/tariff-chapter-exports';
import React from 'react';

// Export FAQ: real search questions about this chapter's U.S. exports, answered from the other four
// export pages. Same layout and FAQPage structured data as the import FAQ.

export default function ChapterExportFaq({ faq }: { faq: TariffExportFaqContent }): React.JSX.Element {
  return <ChapterFaqApproach2 chapterSlug={faq.chapter.slug} intro={faq.intro} keyTakeaways={faq.keyTakeaways} faqs={faq.faqs} />;
}
