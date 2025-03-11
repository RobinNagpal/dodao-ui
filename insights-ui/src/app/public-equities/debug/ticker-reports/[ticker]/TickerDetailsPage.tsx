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
import { CreateAllCriterionReportsRequest, CreateCriteriaRequest, CreateSingleCriterionReportRequest } from '@/types/public-equity/ticker-request-response';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import Input from '@dodao/web-core/components/core/input/Input';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import Accordion from '@dodao/web-core/utils/accordion/Accordion';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import { useEffect, useState } from 'react';
import { Spinner } from '@dodao/web-core/components/core/icons/Spinner';

export default function TickerDetailsPage({ ticker }: { ticker: string }) {
  // Modal flags for regeneration confirmation
  const [showCriterionConfirmModal, setShowCriterionConfirmModal] = useState(false);
  const [showSectionConfirmModal, setShowSectionConfirmModal] = useState(false);
  const [showRegenerateAllConfirmModal, setShowRegenerateAllConfirmModal] = useState(false);

  // Selected states remain set (they are not cleared when the modal closes)
  const [selectedCriterionForRegeneration, setSelectedCriterionForRegeneration] = useState<CriterionEvaluation | null>(null);
  const [selectedSectionForRegeneration, setSelectedSectionForRegeneration] = useState<{
    criterionKey: string;
    section: string;
    reportKey?: string;
  } | null>(null);

  const [reportExists, setReportExists] = useState(false);
  const [report, setReport] = useState<TickerReport>();
  const [selectedCriterionAccodian, setSelectedCriterionAccodian] = useState<string | null>(null);
  const [reportContentMap, setReportContentMap] = useState<{ [key: string]: string }>({});
  const [webhookUrl, setWebhookUrl] = useState(localStorage.getItem('webhookUrl') || '');

  const checkReportExists = async () => {
    const response = await fetch(`https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/tickers/${ticker}/latest-10q-report.json`, {
      cache: 'no-cache',
    });
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
  } = usePostData<{ message: string }, CreateCriteriaRequest>({
    errorMessage: 'Failed to create ticker report',
    successMessage: 'Ticker report created successfully',
    redirectPath: `/public-equities/debug/ticker-reports/${ticker}`,
  });
  const {
    data: allSingleCriterionReportsResponse,
    postData: regenerateAllSingleCriterionReports,
    loading: allSingleCriterionReportsLoading,
    error: allSingleCriterionReportsError,
  } = usePostData<{ message: string }, CreateAllCriterionReportsRequest>({
    errorMessage: 'Failed to regenerate criterion reports',
    successMessage: 'Criterion regeneration started successfully',
    redirectPath: ``,
  });
  const {
    data: singleCriterionReportsResponse,
    postData: regenerateSingleCriterionReports,
    loading: singleCriterionReportsLoading,
    error: singleCriterionReportsError,
  } = usePostData<{ message: string }, CreateSingleCriterionReportRequest>({
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
  // New hook for regeneration of matching criteria
  const {
    data: matchingCriteriaResponse,
    postData: regenerateMatchingCriteria,
    loading: matchingCriteriaLoading,
    error: matchingCriteriaError,
  } = usePostData<{ message: string }, {}>({
    errorMessage: 'Failed to regenerate matching criteria',
    successMessage: 'Matching criteria regeneration started successfully',
    redirectPath: ``,
  });
  const baseURL = process.env.NEXT_PUBLIC_AGENT_APP_URL?.toString() || '';

  // Criterion-level creation (if needed)
  const handleCreateSingleCriterionReport = async () => {
    postData(`${baseURL}/api/actions/ai-criteria`, {
      sectorId: 60,
      industryGroupId: 6010,
    });
  };

  const handleRegenerateAllSingleCriterionReports = async (criterionKey: string) => {
    regenerateAllSingleCriterionReports(`/api/actions/tickers/${ticker}/criterion/${criterionKey}/trigger-all-criterion-reports`, {
      langflowWebhookUrl: webhookUrl,
    });
  };

  // Handles section-specific regeneration (for checklist, metrics, or individual reports)
  const handleRegenerateSingleCriterionReports = async (criterionKey: string, reportKey: string) => {
    regenerateSingleCriterionReports(`/api/actions/tickers/${ticker}/criterion/${criterionKey}/trigger-single-criterion-reports`, {
      langflowWebhookUrl: webhookUrl,
      reportKey: reportKey,
    });
  };

  const handleRegenerateAllCriteriaReport = async () => {
    regenerateAllCriteriaReports(`${baseURL}/api/public-equities/US/all-criterion-report`, { ticker });
    setShowRegenerateAllConfirmModal(false);
  };

  const handleRegenerateMatchingCriteria = async () => {
    regenerateMatchingCriteria(`/api/actions/tickers/${ticker}/trigger-criteria-matching`);
  };

  const renderer = getMarkedRenderer();
  const getMarkdownContent = (content?: string) => {
    return content ? marked.parse(content, { renderer }) : 'No Information';
  };

  return (
    <PageWrapper>
      <Input
        modelValue={webhookUrl}
        placeholder="Enter Webhook URL"
        className="text-color"
        onUpdate={(e) => {
          const newWebhookUrl = e as string;
          setWebhookUrl(newWebhookUrl);
        }}
      >
        Webhook Url
      </Input>
      <div className="m-4">
        <Button
          className="mr-2"
          disabled={false}
          onClick={() => {
            localStorage.removeItem('webhookUrl');
            setWebhookUrl('');
          }}
        >
          Clear Webhook URL
        </Button>
        <Button
          disabled={false}
          onClick={() => {
            localStorage.setItem('webhookUrl', webhookUrl);
            console.log('Webhook URL saved:', webhookUrl);
          }}
        >
          Save Webhook URL
        </Button>
      </div>
      <h1>S3 File</h1>
      <div>
        <a href={`https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/tickers/${ticker}/latest-10q-report.json`} target="_blank">
          {`/public-equities/US/tickers/${ticker}/latest-10q-report.json`}
        </a>
      </div>
      {reportExists && report && (
        <div>
          {/* New button for regeneration of matching criteria */}
          <div className="flex justify-end mb-4">
            <Button disabled={matchingCriteriaLoading} onClick={handleRegenerateMatchingCriteria}>
              {matchingCriteriaLoading && <Spinner />}
              Regenerate Matching Criteria
            </Button>
          </div>
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
              <Button disabled={allCriteriaReportsLoading} onClick={() => setShowRegenerateAllConfirmModal(true)}>
                {allCriteriaReportsLoading && <Spinner />}
                Regenerate All
              </Button>
            </div>
            <h1 className="mb-2">Criterion Evaluation</h1>
            {report.evaluationsOfLatest10Q?.map((criterion) => {
              return (
                <div key={criterion.criterionKey + '_report_criterion_key'}>
                  <div className="my-5 flex justify-end">
                    <Button
                      disabled={selectedCriterionForRegeneration?.criterionKey === criterion.criterionKey && allSingleCriterionReportsLoading}
                      onClick={() => {
                        setSelectedCriterionForRegeneration(criterion);
                        setShowCriterionConfirmModal(true);
                      }}
                    >
                      {selectedCriterionForRegeneration?.criterionKey === criterion.criterionKey && allSingleCriterionReportsLoading && <Spinner />}
                      Regenerate (3m)
                    </Button>
                  </div>
                  {showCriterionConfirmModal && selectedCriterionForRegeneration && (
                    <ConfirmationModal
                      open={showCriterionConfirmModal}
                      onClose={() => setShowCriterionConfirmModal(false)}
                      onConfirm={async () => {
                        await handleRegenerateAllSingleCriterionReports(selectedCriterionForRegeneration.criterionKey);
                        setShowCriterionConfirmModal(false);
                        // Note: We intentionally do NOT clear selectedCriterionForRegeneration so that the loading spinner remains.
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
                      {/* Performance Checklist Section */}
                      <div className="flex justify-end">
                        <Button
                          disabled={
                            selectedSectionForRegeneration?.criterionKey === criterion.criterionKey &&
                            selectedSectionForRegeneration?.section === 'performanceChecklist' &&
                            singleCriterionReportsLoading
                          }
                          onClick={() => {
                            setSelectedSectionForRegeneration({
                              criterionKey: criterion.criterionKey,
                              section: 'performanceChecklist',
                            });
                            setShowSectionConfirmModal(true);
                          }}
                        >
                          {selectedSectionForRegeneration?.criterionKey === criterion.criterionKey &&
                          selectedSectionForRegeneration?.section === 'performanceChecklist' &&
                          singleCriterionReportsLoading ? (
                            <Spinner />
                          ) : null}
                          Regenerate Performance Checklist
                        </Button>
                      </div>
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

                      {/* Important Metrics Section */}
                      <div className="flex justify-end">
                        <Button
                          disabled={
                            selectedSectionForRegeneration?.criterionKey === criterion.criterionKey &&
                            selectedSectionForRegeneration?.section === 'importantMetrics' &&
                            singleCriterionReportsLoading
                          }
                          onClick={() => {
                            setSelectedSectionForRegeneration({
                              criterionKey: criterion.criterionKey,
                              section: 'importantMetrics',
                            });
                            setShowSectionConfirmModal(true);
                          }}
                        >
                          {selectedSectionForRegeneration?.criterionKey === criterion.criterionKey &&
                          selectedSectionForRegeneration?.section === 'importantMetrics' &&
                          singleCriterionReportsLoading ? (
                            <Spinner />
                          ) : null}
                          Regenerate Important Metrics
                        </Button>
                      </div>
                      <h2>Important Metrics</h2>
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
                              {criterion.importantMetrics?.metrics?.map((metric) => (
                                <tr key={metric.metricKey} className="w-full">
                                  <td className="px-4">{metric.metricKey}</td>
                                  <td className="px-4">{metric.value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Reports Section */}
                      <h2>Reports</h2>
                      {criterion.reports?.map((report, index) => {
                        return (
                          <div key={(report.reportKey || index) + '_report_key'} className="mt-2">
                            <div className="my-1 flex justify-end">
                              <Button
                                disabled={
                                  selectedSectionForRegeneration?.criterionKey === criterion.criterionKey &&
                                  selectedSectionForRegeneration?.section === 'report' &&
                                  selectedSectionForRegeneration.reportKey === report.reportKey &&
                                  singleCriterionReportsLoading
                                }
                                onClick={() => {
                                  setSelectedSectionForRegeneration({
                                    criterionKey: criterion.criterionKey,
                                    section: 'report',
                                    reportKey: report.reportKey,
                                  });
                                  setShowSectionConfirmModal(true);
                                }}
                              >
                                {selectedSectionForRegeneration?.criterionKey === criterion.criterionKey &&
                                selectedSectionForRegeneration?.section === 'report' &&
                                selectedSectionForRegeneration.reportKey === report.reportKey &&
                                singleCriterionReportsLoading ? (
                                  <Spinner />
                                ) : null}
                                Regenerate {report.reportKey} report
                              </Button>
                            </div>
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

      {/* Confirmation Modal for section-specific regeneration */}
      {showSectionConfirmModal && selectedSectionForRegeneration && (
        <ConfirmationModal
          open={showSectionConfirmModal}
          onClose={() => setShowSectionConfirmModal(false)}
          onConfirm={async () => {
            const { criterionKey, section, reportKey } = selectedSectionForRegeneration;
            await handleRegenerateSingleCriterionReports(criterionKey, section === 'report' && reportKey ? reportKey : section);
            setShowSectionConfirmModal(false);
            // Note: We do not clear selectedSectionForRegeneration so the loading spinner remains.
          }}
          title="Regenerate Section"
          confirmationText={`Are you sure you want to regenerate ${
            selectedSectionForRegeneration.section === 'report' && selectedSectionForRegeneration.reportKey
              ? `report ${selectedSectionForRegeneration.reportKey}`
              : selectedSectionForRegeneration.section
          } for criterion ${selectedSectionForRegeneration.criterionKey}?`}
          askForTextInput={true}
        />
      )}

      {/* Confirmation Modal for criterion-level regeneration */}
      {showCriterionConfirmModal && selectedCriterionForRegeneration && (
        <ConfirmationModal
          open={showCriterionConfirmModal}
          onClose={() => setShowCriterionConfirmModal(false)}
          onConfirm={async () => {
            await handleRegenerateAllSingleCriterionReports(selectedCriterionForRegeneration.criterionKey);
            setShowCriterionConfirmModal(false);
            // Note: We do not clear selectedCriterionForRegeneration.
          }}
          title="Regenerate Criterion Reports"
          confirmationText={`Are you sure you want to regenerate reports for ${selectedCriterionForRegeneration.criterionKey}?`}
          askForTextInput={true}
        />
      )}
    </PageWrapper>
  );
}
