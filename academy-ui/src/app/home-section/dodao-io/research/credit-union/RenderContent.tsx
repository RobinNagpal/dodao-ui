import CreditUnion from './credit-union.mdx';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';

export const RenderContent = () => {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <CreditUnion />
      </div>
      <a
        href="https://www.canva.com/design/DAGV6ZRPKLc/UTqlxBAyMnYwi5RamMDF2Q/view"
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-block text-base font-medium text-link hover:text-primary"
      >
        See Report →
      </a>
    </PageWrapper>
  );
};
