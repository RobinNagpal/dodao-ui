'use client';

import { IndustryGroupCriteria } from '@/types/criteria/criteria';
import { CreateAllReportsRequest, CreateSingleReportsRequest, Report, TickerReport } from '@/types/public-equity/ticker-report';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import Accordion from '@dodao/web-core/utils/accordion/Accordion';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import { useEffect, useState } from 'react';

export default function TickerDetailsPage({ ticker }: { ticker: string }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reportExists, setReportExists] = useState(false);
  const [report, setReport] = useState<TickerReport>();
  const [selectedCriterionAccodian, setSelectedCriterionAccodian] = useState<string | null>(null);
  const [reportContentMap, setReportContentMap] = useState<{ [key: string]: string }>({});
  const checkReportExists = async () => {
    const response = await fetch(`https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/tickers/${ticker}/latest-10q-report.json`);
    if (response.status === 200) {
      setReportExists(true);
      const report: TickerReport = await response.json();
      setReport(report);
      report.evaluationsOfLatest10Q?.forEach((criterion) => {
        criterion.reports?.forEach((report: Report) => {
          const { key: criterionReportKey, outputFileUrl } = report;
          if (outputFileUrl) {
            const reportContentResponse = fetch(outputFileUrl);
            reportContentResponse
              .then((response) => {
                return response.text();
              })
              .then((text) => {
                setReportContentMap((prev) => {
                  return {
                    ...prev,
                    [`${criterion.criterionKey}__${criterionReportKey}`]: text,
                  };
                });
              });
          }
        });
      });
    } else {
      setReportExists(false);
    }
  };
  useEffect(() => {
    checkReportExists();
  }, []);

  const { data: industryGroupCriteria } = useFetchData<IndustryGroupCriteria>(
    `https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/gics/real-estate/equity-real-estate-investment-trusts-reits/custom-criteria.json`,
    {},
    'Failed to fetch criteria data'
  );
  const {
    data: reponse,
    postData,
    loading,
    error,
  } = usePostData<{ message: string }, CreateSingleReportsRequest>({
    errorMessage: 'Failed to create ticker report',
    successMessage: 'Ticker report created successfully',
    redirectPath: `/public-equities/debug/ticker-reports/${ticker}`,
  });
  const baseURL = process.env.NEXT_PUBLIC_AGENT_APP_URL?.toString() || '';

  const handleCreateSingleCriterionReport = async (criterionKey: string) => {
    postData(`${baseURL}/api/public-equities/US/upsert-ai-criteria`, {
      sectorId: 60,
      industryGroupId: 6010,
      ticker,
      criterionKey,
    });
  };

  const renderer = getMarkedRenderer();
  const getMarkdownContent = (content?: string) => {
    return content ? marked.parse(content, { renderer }) : 'No Information';
  };
  return (
    <PageWrapper>
      <table className="border-2 w-full">
        <thead>
          <tr>
            <th className="border-2 px-2">Name</th>
            <th className="border-2 px-2">Value</th>
            <th className="border-2 px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-2 px-2">Ticker</td>
            <td className="border-2 px-2">{ticker}</td>
            <td className="border-2 px-2"></td>
          </tr>
          <tr>
            <td className="border-2 px-2">Ticker Report Url</td>
            <td className="border-2 px-2">
              <a href={`https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/${ticker}/latest-10q-report.json`} target="_blank">
                {`/public-equities/US/${ticker}/latest-10q-report.json`}
              </a>
            </td>
            <td className="border-2 px-2">
              <IconButton
                iconName={IconTypes.PlusIcon}
                tooltip="Create Ticker Report"
                onClick={() => setShowConfirmModal(true)}
                disabled={loading}
                loading={loading}
                variant="text"
                removeBorder={true}
                className="link-color pointer-cursor"
              />
            </td>
          </tr>
          {industryGroupCriteria?.criteria?.map((item) => {
            return (
              <tr key={item.key}>
                <td className="border-2 px-2">
                  {item.key} - {item.name}
                </td>
                <td className="border-2 px-2">{item.shortDescription}</td>
                <td className="border-2 px-2">
                  <IconButton
                    iconName={IconTypes.Reload}
                    tooltip="Create Ticker Report"
                    onClick={() => handleCreateSingleCriterionReport(item.key)}
                    disabled={loading}
                    loading={loading}
                    variant="text"
                    removeBorder={true}
                    className="link-color pointer-cursor"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {reportExists && report && (
        <div>
          <div className="mt-8">
            {report.criteriaMatchesOfLatest10Q?.criterionMatches?.map((criterion) => {
              return (
                <Accordion
                  key={criterion.criterionKey}
                  label={criterion.criterionKey}
                  isOpen={selectedCriterionAccodian === `attachments_${criterion.criterionKey}`}
                  onClick={() =>
                    setSelectedCriterionAccodian(
                      selectedCriterionAccodian === `attachments_${criterion.criterionKey}` ? null : `attachments_${criterion.criterionKey}`
                    )
                  }
                >
                  <div key={criterion.criterionKey} className="mt-8">
                    <div>
                      <h3>Matching Attachments</h3>
                      {criterion.matchedAttachments.map((attachment) => {
                        return (
                          <table key={attachment.attachmentSequenceNumber} className="border-2 w-full mt-2">
                            <thead>
                              <tr>
                                <th className="border-2 px-2 w-32">Name</th>
                                <th className="border-2 px-2">Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border-2 px-2">Attachment SequenceNumber</td>
                                <td className="border-2 px-2">{attachment.attachmentSequenceNumber}</td>
                              </tr>
                              <tr>
                                <td className="border-2 px-2">Attachment Name</td>
                                <td className="border-2 px-2">{attachment.attachmentDocumentName}</td>
                              </tr>
                              <tr>
                                <td className="border-2 px-2">Attachment Purpose</td>
                                <td className="border-2 px-2">{attachment.attachmentPurpose}</td>
                              </tr>
                              <tr>
                                <td className="border-2 px-2">Matched Content Percentage</td>
                                <td className="border-2 px-2">{attachment.matchedPercentage}</td>
                              </tr>

                              <tr>
                                <td className="border-2 px-2">Attachment Url</td>
                                <td className="border-2 px-2">
                                  <a href={attachment.attachmentUrl} target="_blank">
                                    {attachment.attachmentUrl}
                                  </a>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        );
                      })}
                    </div>
                  </div>
                </Accordion>
              );
            })}
          </div>
          <div className="mt-8">
            {report.evaluationsOfLatest10Q?.map((criterion) => {
              return (
                <Accordion
                  key={criterion.criterionKey + '_report_criterion_key'}
                  label={criterion.criterionKey}
                  isOpen={selectedCriterionAccodian === `reports_${criterion.criterionKey}`}
                  onClick={() =>
                    setSelectedCriterionAccodian(selectedCriterionAccodian === `reports_${criterion.criterionKey}` ? null : `reports_${criterion.criterionKey}`)
                  }
                >
                  <div key={criterion.criterionKey + '_report_criterion_key'} className="mt-8">
                    <h3>Matching Attachments</h3>
                    {criterion.reports?.map((report) => {
                      return (
                        <div key={report.key + '_report_key'} className="mt-8">
                          <h2>{report.key}</h2>

                          {reportContentMap[`${criterion.criterionKey}__${report.key}`] ? (
                            <div
                              className="markdown-body text-md"
                              dangerouslySetInnerHTML={{ __html: getMarkdownContent(reportContentMap[`${criterion.criterionKey}__${report.key}`]) }}
                            />
                          ) : (
                            <div>No content</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Accordion>
              );
            })}
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
