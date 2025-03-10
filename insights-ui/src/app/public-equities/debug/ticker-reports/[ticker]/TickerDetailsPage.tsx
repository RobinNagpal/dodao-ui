'use client';

import { Button } from '@/components/home-page/Button';
import { IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import {
  CreateSingleReportsRequest,
  CriterionEvaluation,
  CriterionReportItem,
  RegenerateSingleCriterionReportsRequest,
  TickerReport,
} from '@/types/public-equity/ticker-report-types';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
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
  const [showRegenerateAllConfirmModal, setShowRegenerateAllConfirmModal] = useState(false);
  const [selectedCriterionForRegeneration, setSelectedCriterionForRegeneration] = useState<CriterionEvaluation | null>();
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
        criterion.reports?.forEach((report: CriterionReportItem) => {
          const { reportKey: criterionReportKey, outputFileUrl } = report;
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

  const { data: industryGroupCriteria } = useFetchData<IndustryGroupCriteriaDefinition>(
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
  const {
    data: singleCriterionReportsResponse,
    postData: regenerateSingleCriterionReports,
    loading: singleCriterionReportsLoading,
    error: singleCriterionReportsError,
  } = usePostData<{ message: string }, RegenerateSingleCriterionReportsRequest>({
    errorMessage: 'Failed to regenerate criterion reports',
    successMessage: 'Criterion regeneration started successfully',
    redirectPath: ``,
  });
  const {
    data: allCriteriaReportsResponse,
    postData: regenerateAllCriteriaReports,
    loading: allCriteriaReportsLoading,
    error: allCriteriaReportsError,
  } = usePostData<{ message: string }, {}>({
    errorMessage: 'Failed to regenerate all criteria reports',
    successMessage: 'All criteria reports regeneration started successfully',
    redirectPath: ``,
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

  const handleRegenerateSingleCriterionReport = async (criterionKey: string) => {
    regenerateSingleCriterionReports(`${baseURL}/api/public-equities/US/single-criterion-report`, {
      ticker,
      criterionKey,
    });
  };
  const handleRegenerateAllCriteriaReport = async () => {
    regenerateAllCriteriaReports(`${baseURL}/api/public-equities/US/all-criterion-report`, {
      ticker,
    });
    setShowRegenerateAllConfirmModal(false);
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
              <a
                href={`https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/tickers/${ticker}/latest-10q-report.json`}
                target="_blank"
              >
                {`/public-equities/US/tickers/${ticker}/latest-10q-report.json`}
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
            <h1 className="mb-8">Matching Attachments</h1>
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
            <div className="my-5 flex justify-end">
              <Button onClick={() => setShowRegenerateAllConfirmModal(true)}>Regenerate All</Button>
            </div>
            <h1 className="mb-2">Criterion Evaluation</h1>
            {report.evaluationsOfLatest10Q?.map((criterion) => {
              return (
                <div key={criterion.criterionKey + '_report_criterion_key'}>
                  <div className="my-5 flex justify-end">
                    <Button onClick={() => setSelectedCriterionForRegeneration(criterion)}>Regenerate (3m)</Button>
                  </div>

                  {selectedCriterionForRegeneration && (
                    <ConfirmationModal
                      open={true}
                      onClose={() => setSelectedCriterionForRegeneration(null)}
                      onConfirm={() => {
                        handleRegenerateSingleCriterionReport(selectedCriterionForRegeneration.criterionKey);
                        setSelectedCriterionForRegeneration(null);
                      }}
                      title="Regenerate Criterion Reports"
                      confirmationText={`Are you sure you want to regenerate reports for ${selectedCriterionForRegeneration.criterionKey}?`}
                      askForTextInput={true}
                    />
                  )}
                  {showRegenerateAllConfirmModal && (
                    <ConfirmationModal
                      open={showRegenerateAllConfirmModal}
                      onClose={() => setShowRegenerateAllConfirmModal(false)}
                      onConfirm={() => handleRegenerateAllCriteriaReport()}
                      title="Regenerate All Criteria Reports"
                      confirmationText="Are you sure you want to regenerate all reports for this criteria?"
                      askForTextInput={true}
                    />
                  )}
                  <Accordion
                    label={criterion.criterionKey}
                    isOpen={selectedCriterionAccodian === `reports_${criterion.criterionKey}`}
                    onClick={() =>
                      setSelectedCriterionAccodian(
                        selectedCriterionAccodian === `reports_${criterion.criterionKey}` ? null : `reports_${criterion.criterionKey}`
                      )
                    }
                  >
                    <div key={criterion.criterionKey + '_report_criterion_key'} className="mt-8">
                      <h2>Performance Checklist</h2>
                      <div className="block-bg-color m-8">
                        <div className="overflow-x-auto">
                          {criterion.performanceChecklistEvaluation?.performanceChecklist?.length && (
                            <ul className="list-disc mt-2">
                              {criterion.performanceChecklistEvaluation?.performanceChecklist?.map((item, index) => (
                                <li key={index} className="mb-1 flex items-start">
                                  <div className="flex flex-col">
                                    <div className="mr-2">
                                      {item.score === 1 ? '✅' : '❌'} {item.checklistItem}
                                    </div>
                                    <ol className="pl-8">
                                      <li>{item.oneLinerExplanation}</li>
                                      <li>{item.detailedExplanation}</li>
                                      <li>{item.evaluationLogic}</li>
                                    </ol>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                      <div className="block-bg-color m-8">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse border border-gray-30 p-2">
                            <thead>
                              <tr>
                                <th className="px-4">Key</th>
                                <th className="px-4">Value</th>
                              </tr>
                            </thead>
                            <tbody className="w-full">
                              {criterion.importantMetrics?.metrics?.map((metric) => {
                                return (
                                  <tr key={metric.metricKey} className="w-full">
                                    <td className="px-4">{metric.metricKey}</td>
                                    <td className="px-4">{metric.value}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <h2>Reports</h2>
                      {criterion.reports?.map((report, index) => {
                        return (
                          <div key={(report.reportKey || index) + '_report_key'} className="mt-2">
                            <h2 className="font-bold text-xl mt-5">
                              📄{index + 1}. {report.reportKey}
                            </h2>

                            {reportContentMap[`${criterion.criterionKey}__${report.reportKey}`] ? (
                              <div
                                className="markdown-body text-md"
                                dangerouslySetInnerHTML={{ __html: getMarkdownContent(reportContentMap[`${criterion.criterionKey}__${report.reportKey}`]) }}
                              />
                            ) : (
                              <div>No content</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Accordion>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
