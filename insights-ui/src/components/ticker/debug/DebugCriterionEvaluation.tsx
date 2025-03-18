'use client';

import { IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import { CriterionEvaluation, CriterionReportItem, TickerReport } from '@/types/public-equity/ticker-report-types';
import { CreateAllCriterionReportsRequest, CreateCriteriaRequest, CreateSingleCriterionReportRequest } from '@/types/public-equity/ticker-request-response';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { Spinner } from '@dodao/web-core/components/core/icons/Spinner';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import Accordion from '@dodao/web-core/utils/accordion/Accordion';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import WebhookUrlInput, { getWebhookUrlFromLocalStorage } from './WebhookUrlInput';

export interface DebugCriterionEvaluationProps {
  report: TickerReport;
  industryGroupCriteria: IndustryGroupCriteriaDefinition;
}
export default function DebugCriterionEvaluation({ report, industryGroupCriteria }: DebugCriterionEvaluationProps) {
  const ticker = report.ticker;

  const [showCriterionConfirmModal, setShowCriterionConfirmModal] = useState(false);
  const [showSectionConfirmModal, setShowSectionConfirmModal] = useState(false);
  const [showRegenerateAllConfirmModal, setShowRegenerateAllConfirmModal] = useState(false);
  const [reportContentMap, setReportContentMap] = useState<{ [key: string]: string }>({});
  const [selectedCriterionAccordian, setSelectedCriterionAccordian] = useState<string | null>(null);
  const [selectedCriterionForRegeneration, setSelectedCriterionForRegeneration] = useState<CriterionEvaluation | null>(null);
  // New state for section-specific regeneration confirmation
  const [selectedSectionForRegeneration, setSelectedSectionForRegeneration] = useState<{
    criterionKey: string;
    section: string;
    reportKey?: string;
  } | null>(null);

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

  const handleRegenerateAllSingleCriterionReports = async (criterionKey: string) => {
    regenerateAllSingleCriterionReports(`${getBaseUrl()}/api/actions/tickers/${ticker}/criterion/${criterionKey}/trigger-all-criterion-reports`, {
      langflowWebhookUrl: getWebhookUrlFromLocalStorage(report.selectedSector.id, report.selectedIndustryGroup.id, criterionKey),
    });
  };

  // Handles section-specific regeneration (for checklist, metrics, or individual reports)
  const handleRegenerateSingleCriterionReports = async (criterionKey: string, reportKey: string) => {
    regenerateSingleCriterionReports(`${getBaseUrl()}/api/actions/tickers/${ticker}/criterion/${criterionKey}/trigger-single-criterion-reports`, {
      langflowWebhookUrl: getWebhookUrlFromLocalStorage(report.selectedSector.id, report.selectedIndustryGroup.id, criterionKey),
      reportKey: reportKey,
    });
  };

  const handleRegenerateAllCriteriaReport = async () => {
    regenerateAllCriteriaReports(`${getBaseUrl()}/api/actions/tickers/${ticker}/trigger-all`, { ticker });
    setShowRegenerateAllConfirmModal(false);
  };

  const renderer = getMarkedRenderer();
  const getMarkdownContent = (content?: string) => {
    return content ? marked.parse(content, { renderer }) : 'No Information';
  };

  const fetchCriterionReports = async () => {
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
  };

  useEffect(() => {
    fetchCriterionReports();
  }, []);

  const evaluationOfLatest10QMap =
    (report.evaluationsOfLatest10Q && Object.fromEntries(report.evaluationsOfLatest10Q?.map((criterion) => [criterion.criterionKey, criterion]))) || {};

  return (
    <div className="mt-8">
      <PrivateWrapper>
        <div className="my-5 flex justify-end">
          <Button disabled onClick={() => setShowRegenerateAllConfirmModal(true)}>
            Regenerate All
          </Button>
        </div>
      </PrivateWrapper>
      <div className="flex justify-between">
        <h1 className="mb-2 font-bold text-xl">Criterion Evaluation</h1>
        <Link href={`/public-equities/industry-group-criteria/real-estate/equity-real-estate-investment-trusts-reits/create`}>View Criteria</Link>
      </div>
      {industryGroupCriteria.criteria?.map((criterionDefinition) => {
        const criterionKey = criterionDefinition.key;
        const criterion: CriterionEvaluation | undefined = evaluationOfLatest10QMap[criterionKey];
        return (
          <div key={criterionKey + '_report_criterion_key'}>
            <PrivateWrapper>
              <div className="my-5 flex justify-end space-x-5 items-center">
                <WebhookUrlInput
                  criterionDefinition={criterionDefinition}
                  sectorId={report.selectedSector.id}
                  industryGroupId={report.selectedIndustryGroup.id}
                />
                <Button
                  disabled={selectedCriterionForRegeneration?.criterionKey === criterionKey && allSingleCriterionReportsLoading}
                  onClick={() => {
                    setSelectedCriterionForRegeneration(criterion);
                    setShowCriterionConfirmModal(true);
                  }}
                  loading={selectedCriterionForRegeneration?.criterionKey === criterionKey && allSingleCriterionReportsLoading}
                  className="w-48"
                >
                  Regenerate (3m)
                </Button>
              </div>
            </PrivateWrapper>
            {showCriterionConfirmModal && selectedCriterionForRegeneration && (
              <ConfirmationModal
                open={showCriterionConfirmModal}
                onClose={() => setShowCriterionConfirmModal(false)}
                onConfirm={async () => {
                  await handleRegenerateAllSingleCriterionReports(criterionKey);
                  setShowCriterionConfirmModal(false);
                  // Note: We intentionally do NOT clear selectedCriterionForRegeneration so that the loading spinner remains.
                }}
                title="Regenerate Criterion Reports"
                confirmationText={`Are you sure you want to regenerate reports for ${criterionKey}?`}
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
              label={criterionKey}
              isOpen={selectedCriterionAccordian === `reports_${criterionKey}`}
              onClick={() => setSelectedCriterionAccordian(selectedCriterionAccordian === `reports_${criterionKey}` ? null : `reports_${criterionKey}`)}
            >
              <div key={criterionKey + '_report_criterion_key'} className="mt-8">
                {/* Performance Checklist Section */}
                <PrivateWrapper>
                  <div className="flex justify-end">
                    <Button
                      disabled={
                        selectedSectionForRegeneration?.criterionKey === criterionKey &&
                        selectedSectionForRegeneration?.section === 'performanceChecklist' &&
                        singleCriterionReportsLoading
                      }
                      onClick={() => {
                        setSelectedSectionForRegeneration({
                          criterionKey: criterionKey,
                          section: 'performanceChecklist',
                        });
                        setShowSectionConfirmModal(true);
                      }}
                    >
                      {selectedSectionForRegeneration?.criterionKey === criterionKey &&
                      selectedSectionForRegeneration?.section === 'performanceChecklist' &&
                      singleCriterionReportsLoading ? (
                        <Spinner />
                      ) : null}
                      Regenerate Performance Checklist
                    </Button>
                  </div>
                </PrivateWrapper>
                <h2>Performance Checklist</h2>
                <div className="block-bg-color m-8">
                  <div className="overflow-x-auto">
                    {criterion?.performanceChecklistEvaluation?.performanceChecklist?.length && (
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
                <PrivateWrapper>
                  <div className="flex justify-end">
                    <Button
                      disabled={
                        selectedSectionForRegeneration?.criterionKey === criterionKey &&
                        selectedSectionForRegeneration?.section === 'importantMetrics' &&
                        singleCriterionReportsLoading
                      }
                      onClick={() => {
                        setSelectedSectionForRegeneration({
                          criterionKey: criterionKey,
                          section: 'importantMetrics',
                        });
                        setShowSectionConfirmModal(true);
                      }}
                    >
                      {selectedSectionForRegeneration?.criterionKey === criterionKey &&
                      selectedSectionForRegeneration?.section === 'importantMetrics' &&
                      singleCriterionReportsLoading ? (
                        <Spinner />
                      ) : null}
                      Regenerate Important Metrics
                    </Button>
                  </div>
                </PrivateWrapper>
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
                        {criterion?.importantMetrics?.metrics?.map((metric) => (
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
                {criterion?.reports?.map((report, index) => {
                  return (
                    <div key={(report.reportKey || index) + '_report_key'} className="mt-2">
                      <PrivateWrapper>
                        <div className="my-1 flex justify-end">
                          <Button
                            disabled={
                              selectedSectionForRegeneration?.criterionKey === criterionKey &&
                              selectedSectionForRegeneration?.section === 'report' &&
                              selectedSectionForRegeneration.reportKey === report.reportKey &&
                              singleCriterionReportsLoading
                            }
                            onClick={() => {
                              setSelectedSectionForRegeneration({
                                criterionKey: criterionKey,
                                section: 'report',
                                reportKey: report.reportKey,
                              });
                              setShowSectionConfirmModal(true);
                            }}
                          >
                            {selectedSectionForRegeneration?.criterionKey === criterionKey &&
                            selectedSectionForRegeneration?.section === 'report' &&
                            selectedSectionForRegeneration.reportKey === report.reportKey &&
                            singleCriterionReportsLoading ? (
                              <Spinner />
                            ) : null}
                            Regenerate {report.reportKey} report
                          </Button>
                        </div>
                      </PrivateWrapper>
                      <h2 className="font-bold text-xl mt-5">
                        📄{index + 1}. {report.reportKey}
                      </h2>
                      {reportContentMap[`${criterionKey}__${report.reportKey}`] ? (
                        <div
                          className="markdown-body text-md"
                          dangerouslySetInnerHTML={{ __html: getMarkdownContent(reportContentMap[`${criterionKey}__${report.reportKey}`]) }}
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
      {selectedSectionForRegeneration && (
        <ConfirmationModal
          open={true}
          onClose={() => setSelectedSectionForRegeneration(null)}
          onConfirm={() => {
            handleRegenerateSingleCriterionReports(
              selectedSectionForRegeneration.criterionKey,
              selectedSectionForRegeneration.section === 'report' && selectedSectionForRegeneration.reportKey
                ? selectedSectionForRegeneration.reportKey
                : selectedSectionForRegeneration.section
            );
            setSelectedSectionForRegeneration(null);
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
    </div>
  );
}
