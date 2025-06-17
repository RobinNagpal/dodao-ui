import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { SecFilingAttachment } from '@prisma/client';
import AttachementTableActions from './AttachmentTableActions';
import { IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import PrivateWrapper from '@/components/auth/PrivateWrapper';

export default async function SecFilingPage({ params }: { params: Promise<{ tickerKey: string; secFilingId: string }> }) {
  const { tickerKey, secFilingId } = await params;
  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: 'Public Equities',
      href: `/public-equities/tickers`,
      current: false,
    },
    {
      name: tickerKey,
      href: `/public-equities/tickers/${tickerKey}/sec-filings`,
      current: true,
    },
  ];

  const filingsResponse = await fetch(`${getBaseUrl()}/api/tickers/${tickerKey}/sec-filings/${secFilingId}`, { cache: 'no-cache' });

  const attachments = (await filingsResponse.json()) as SecFilingAttachment[];
  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <table className="w-full border-collapse border border-gray-300 text-left mt-6">
        <thead>
          <tr>
            <th className="p-3 border text-left">Sequence #</th>
            <th className="p-3 border text-left">Description</th>
            <th className="p-3 border text-left">Name</th>
            <th className="p-3 border text-left">URL</th>
            <th className="p-3 border text-left">Doc Type</th>
            <PrivateWrapper>
              <th className="p-3 border text-left">Actions</th>
            </PrivateWrapper>
          </tr>
        </thead>
        <tbody>
          {attachments.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-3 border text-center italic">
                No attachments found.
              </td>
            </tr>
          ) : (
            attachments.map((attach) => {
              return (
                <tr key={attach.id} className="border">
                  <td className="p-3 border text-left">{attach.sequenceNumber}</td>
                  <td className="p-3 border text-left">{attach.description ?? ''}</td>
                  <td className="p-3 border text-left">{attach.purpose ?? ''}</td>
                  <td className="p-3 border text-left link-color hover:underline">
                    <a href={attach.url} target="_blank">
                      {attach.url}
                    </a>
                  </td>
                  <td className="p-3 border text-left">{attach.documentType}</td>
                  <PrivateWrapper>
                    <td className="p-3 border text-left flex gap-2">
                      <AttachementTableActions tickerKey={tickerKey} attachment={attach} />
                    </td>
                  </PrivateWrapper>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </PageWrapper>
  );
}
