import { Button } from '@/components/home-page/Button';
import { CriterionEvaluation, CriterionReportItem, TickerReport } from '@/types/public-equity/ticker-report-types';
import { CreateAllCriterionReportsRequest, CreateCriteriaRequest, CreateSingleCriterionReportRequest } from '@/types/public-equity/ticker-request-response';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import Accordion from '@dodao/web-core/utils/accordion/Accordion';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import { useEffect, useState } from 'react';

export interface DebugCriterionEvaluationProps {
  report: TickerReport;
  webhookUrl: string;
}
export default function DebugCriterionEvaluation({ report, webhookUrl }: DebugCriterionEvaluationProps) {
  const ticker = report.ticker;
  const baseURL = process.env.NEXT_PUBLIC_AGENT_APP_URL?.toString() || '';

  const [selectedCriterionAccordian, setSelectedCriterionAccordian] = useState<string | null>(null);

  const [showRegenerateAllConfirmModal, setShowRegenerateAllConfirmModal] = useState(false);
  const [reportContentMap, setReportContentMap] = useState<{ [key: string]: string }>({});

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

  // This function handles section-specific regeneration (for checklist, metrics, or individual reports)
  const handleRegenerateSingleCriterionReports = async (criterionKey: string, reportKey: string) => {
    regenerateSingleCriterionReports(`/api/actions/tickers/${ticker}/criterion/${criterionKey}/trigger-single-criterion-reports`, {
      langflowWebhookUrl: webhookUrl,
      reportKey: reportKey,
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

  return (
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
                  handleRegenerateAllSingleCriterionReports(selectedCriterionForRegeneration.criterionKey);
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
              isOpen={selectedCriterionAccordian === `reports_${criterion.criterionKey}`}
              onClick={() =>
                setSelectedCriterionAccordian(selectedCriterionAccordian === `reports_${criterion.criterionKey}` ? null : `reports_${criterion.criterionKey}`)
              }
            >
              <div key={criterion.criterionKey + '_report_criterion_key'} className="mt-8">
                {/* Performance Checklist Section */}
                <div className="flex justify-end">
                  <Button
                    onClick={() =>
                      setSelectedSectionForRegeneration({
                        criterionKey: criterion.criterionKey,
                        section: 'performanceChecklist',
                      })
                    }
                  >
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
                    onClick={() =>
                      setSelectedSectionForRegeneration({
                        criterionKey: criterion.criterionKey,
                        section: 'importantMetrics',
                      })
                    }
                  >
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
                          onClick={() =>
                            setSelectedSectionForRegeneration({
                              criterionKey: criterion.criterionKey,
                              section: 'report',
                              reportKey: report.reportKey,
                            })
                          }
                        >
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
